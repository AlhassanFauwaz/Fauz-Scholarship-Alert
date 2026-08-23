import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import calculateMatch from '../utils/matchScore.js';
import { createNotification, broadcastOpportunityUpdateInApp } from '../utils/notifications.js';
import { broadcastOpportunityEmail } from '../utils/broadcastEmail.js';
import { broadcastOpportunitySMS } from '../utils/broadcastSMS.js';   // <-- added import

// Helper to parse fields that might be sent as JSON strings from FormData
const parseEligibility = (req) => {
  if (typeof req.body.eligibility === 'string') {
    try {
      req.body.eligibility = JSON.parse(req.body.eligibility);
    } catch (e) {
      throw new Error('Invalid eligibility data');
    }
  }
  // Ensure arrays inside eligibility are arrays (if they were sent differently)
  if (req.body.eligibility) {
    const { countryEligibility } = req.body.eligibility;
    if (typeof countryEligibility === 'string' && countryEligibility.trim() !== '') {
      req.body.eligibility.countryEligibility = countryEligibility
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(countryEligibility)) {
      // already array, ok
    } else {
      req.body.eligibility.countryEligibility = [];
    }
  }
};

// @desc    Create a new opportunity
// @route   POST /api/opportunities
// @access  Private/Admin
export const createOpportunity = async (req, res) => {
  try {
    // Parse eligibility and other complex fields
    parseEligibility(req);

    req.body.createdBy = req.user.id;
    const opportunity = await Opportunity.create(req.body);

    // Only trigger notifications if the opportunity is published
    if (opportunity.status === 'published') {
      // 1. Profile-based matching
      const users = await User.find({
        accountStatus: 'active',
        emailVerified: true,
      });

      for (const user of users) {
        if (user.profile && user.profile.educationLevel) {
          const matchScore = calculateMatch(user.profile, opportunity);
          if (matchScore >= 40) {
            await createNotification({
              user: user._id,
              opportunity: opportunity._id,
              title: `New Matching Opportunity: ${opportunity.title}`,
              message: `A new ${opportunity.type} "${opportunity.title}" matches your profile (${matchScore}% match).`,
              type: 'new_match',
              channel: 'in-app',
            });
          }
        }
      }

      // 2. Subscription-based matching
      const subscriptions = await Subscription.find({ active: true });
      for (const sub of subscriptions) {
        let matches = 0;

        if (sub.opportunityTypes && sub.opportunityTypes.includes(opportunity.type)) matches++;
        if (sub.categories && sub.categories.includes(opportunity.category)) matches++;
        if (sub.countries && sub.countries.includes(opportunity.country)) matches++;
        if (
          sub.educationLevels &&
          opportunity.eligibility?.minEducationLevel &&
          sub.educationLevels.includes(opportunity.eligibility.minEducationLevel)
        ) matches++;
        if (
          sub.fields &&
          opportunity.eligibility?.fieldOfStudy &&
          sub.fields.includes(opportunity.eligibility.fieldOfStudy)
        ) matches++;
        if (sub.keywords && sub.keywords.length > 0) {
          const haystack = `${opportunity.title} ${opportunity.description}`.toLowerCase();
          const kwMatches = sub.keywords.filter(kw =>
            haystack.includes(kw.toLowerCase())
          ).length;
          matches += kwMatches;
        }

        if (matches >= 2) {
          await createNotification({
            user: sub.user,
            opportunity: opportunity._id,
            title: `New Matching Opportunity: ${opportunity.title}`,
            message: `A new opportunity "${opportunity.title}" matches your subscription criteria.`,
            type: 'new_match',
            channel: 'in-app',
          });
        }
      }

      // Send scholarship alerts only through notification channels users enabled.
      broadcastOpportunityEmail(opportunity, 'created')
        .catch(err => console.error('Broadcast email failed:', err));

      broadcastOpportunitySMS(opportunity, 'created')
        .catch(err => console.error('Broadcast SMS failed:', err));
    }

    res.status(201).json({ opportunity });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all opportunities (public with filters, featured, closing-soon, pagination)
// @route   GET /api/opportunities
// @access  Public
export const getOpportunities = async (req, res) => {
  try {
    let query = { status: 'published' };

    const {
      keyword,
      type,
      category,
      country,
      educationLevel,
      fieldOfStudy,
      featured,
      closingSoon,
      sort,
      limit,
    } = req.query;

    if (keyword?.trim()) {
      // Regex search works even when a MongoDB text index has not been created yet,
      // and supports matching partial words such as "scholar".
      const escapedKeyword = keyword
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const keywordPattern = new RegExp(escapedKeyword, 'i');
      query.$or = [
        { title: keywordPattern },
        { description: keywordPattern },
        { organization: keywordPattern },
        { country: keywordPattern },
        { category: keywordPattern },
      ];
    }
    if (type) query.type = type;
    if (category) query.category = category;
    if (country) query.country = country;
    if (educationLevel) query['eligibility.minEducationLevel'] = educationLevel;
    if (fieldOfStudy) query['eligibility.fieldOfStudy'] = fieldOfStudy;

    if (featured === 'true') query.featured = true;

    if (closingSoon === 'true') {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      query.deadline = { $gte: now, $lte: sevenDaysLater };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };
    else if (sort === 'latest') sortOption = { createdAt: -1 };

    const resultsLimit = limit ? parseInt(limit, 10) : 50;

    const opportunities = await Opportunity.find(query)
      .sort(sortOption)
      .limit(resultsLimit)
      .populate('createdBy', 'fullName email');

    res.json({ opportunities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
export const getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      'createdBy',
      'fullName email'
    );
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ opportunity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an opportunity
// @route   PUT /api/opportunities/:id
// @access  Private/Admin
export const updateOpportunity = async (req, res) => {
  try {
    // Parse eligibility if present
    parseEligibility(req);

    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Scholarship updates use only the notification channels users enabled.
    if (opportunity.status === 'published') {
      broadcastOpportunityUpdateInApp(opportunity)
        .catch(err => console.error('In-app update notification failed:', err));

      broadcastOpportunityEmail(opportunity, 'updated')
        .catch(err => console.error('Broadcast email failed:', err));

      broadcastOpportunitySMS(opportunity, 'updated')
        .catch(err => console.error('Broadcast SMS failed:', err));
    }

    res.json({ opportunity });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private/Admin
export const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
