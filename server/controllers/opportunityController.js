import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import calculateMatch from '../utils/matchScore.js';
import { createNotification, broadcastOpportunityUpdateInApp } from '../utils/notifications.js';
import { broadcastOpportunityEmail } from '../utils/broadcastEmail.js';
import { broadcastOpportunitySMS } from '../utils/broadcastSMS.js';

// Helper to parse complex fields from FormData or JSON payloads
const parseComplexFields = (req) => {
  if (typeof req.body.eligibility === 'string') {
    try {
      req.body.eligibility = JSON.parse(req.body.eligibility);
    } catch (e) {
      // ignore
    }
  }

  // Parse arrays if sent as comma-separated strings
  const arrayFields = ['degreeLevels', 'fieldsOfStudy', 'subjects', 'skills', 'eligibleCountries', 'eligibleRegions', 'documentsRequired', 'tags'];
  for (const field of arrayFields) {
    if (typeof req.body[field] === 'string') {
      req.body[field] = req.body[field]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  if (typeof req.body.isRemote === 'string') {
    req.body.isRemote = req.body.isRemote === 'true';
  }
  if (typeof req.body.featured === 'string') {
    req.body.featured = req.body.featured === 'true';
  }
};

// @desc    Create a new opportunity
// @route   POST /api/opportunities
// @access  Private/Admin
export const createOpportunity = async (req, res) => {
  try {
    parseComplexFields(req);

    req.body.createdBy = req.user?.id || req.user?._id;
    const opportunity = await Opportunity.create(req.body);

    // Only trigger notifications if the opportunity is published and verified
    if (opportunity.status === 'published' && (opportunity.verificationStatus === 'verified' || opportunity.verificationStatus === 'official_source')) {
      // 1. Profile-based matching
      const users = await User.find({
        accountStatus: 'active',
        emailVerified: true,
      });

      for (const user of users) {
        if (user.profile && (user.profile.educationLevel || user.profile.fieldOfStudy)) {
          const matchScore = calculateMatch(user.profile, opportunity);
          if (matchScore >= 45) {
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
        if (sub.countries && (sub.countries.includes(opportunity.country) || opportunity.country === 'Worldwide')) matches++;
        if (
          sub.educationLevels &&
          opportunity.degreeLevels &&
          opportunity.degreeLevels.some((deg) => sub.educationLevels.includes(deg))
        ) matches++;
        if (
          sub.fields &&
          opportunity.fieldsOfStudy &&
          opportunity.fieldsOfStudy.some((f) => sub.fields.includes(f))
        ) matches++;
        if (sub.keywords && sub.keywords.length > 0) {
          const haystack = `${opportunity.title} ${opportunity.description}`.toLowerCase();
          const kwMatches = sub.keywords.filter((kw) =>
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

      broadcastOpportunityEmail(opportunity, 'created').catch((err) =>
        console.error('Broadcast email failed:', err)
      );

      broadcastOpportunitySMS(opportunity, 'created').catch((err) =>
        console.error('Broadcast SMS failed:', err)
      );
    }

    res.status(201).json({ opportunity });
  } catch (error) {
    console.error('createOpportunity error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all opportunities (public with rich faceted filters, sorting, pagination)
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
      region,
      educationLevel,
      degreeLevel,
      fieldOfStudy,
      fundingType,
      isRemote,
      featured,
      closingSoon,
      sort,
      page = 1,
      limit = 24,
    } = req.query;

    if (keyword?.trim()) {
      const escapedKeyword = keyword
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const keywordPattern = new RegExp(escapedKeyword, 'i');
      query.$or = [
        { title: keywordPattern },
        { description: keywordPattern },
        { shortDescription: keywordPattern },
        { organization: keywordPattern },
        { provider: keywordPattern },
        { country: keywordPattern },
        { category: keywordPattern },
        { fieldsOfStudy: keywordPattern },
        { tags: keywordPattern },
        { skills: keywordPattern },
      ];
    }

    if (type && type !== 'all') query.type = type;
    if (category) query.category = category;
    if (country && country !== 'Worldwide') {
      query.$or = [
        { country: new RegExp(country, 'i') },
        { eligibleCountries: new RegExp(country, 'i') },
        { country: 'Worldwide' },
      ];
    }
    if (region && region !== 'Worldwide') query.region = region;
    if (fundingType && fundingType !== 'all') query.fundingType = fundingType;
    if (isRemote === 'true') query.isRemote = true;

    const targetDegree = degreeLevel || educationLevel;
    if (targetDegree) {
      query.$or = [
        { degreeLevels: targetDegree },
        { 'eligibility.minEducationLevel': targetDegree },
        { degreeLevels: 'any' },
      ];
    }

    if (fieldOfStudy) {
      query.$or = [
        { fieldsOfStudy: new RegExp(fieldOfStudy, 'i') },
        { 'eligibility.fieldOfStudy': new RegExp(fieldOfStudy, 'i') },
      ];
    }

    if (featured === 'true') query.featured = true;

    const now = new Date();
    if (closingSoon === 'true') {
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      query.deadline = { $gte: now, $lte: sevenDaysLater };
    } else {
      // By default don't show expired
      query.deadline = { $gte: now };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };
    else if (sort === 'latest') sortOption = { createdAt: -1 };
    else if (sort === 'popular') sortOption = { viewsCount: -1, savesCount: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [total, opportunities] = await Promise.all([
      Opportunity.countDocuments(query),
      Opportunity.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'fullName email')
        .populate('sourceId', 'name websiteUrl healthStatus'),
    ]);

    res.json({
      opportunities,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error('getOpportunities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single opportunity by ID or SEO slug
// @route   GET /api/opportunities/:id
// @access  Public
export const getOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    let opportunity = null;

    // Check if valid ObjectId or Slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      opportunity = await Opportunity.findById(id)
        .populate('createdBy', 'fullName email')
        .populate('sourceId', 'name websiteUrl healthStatus');
    } else {
      opportunity = await Opportunity.findOne({ slug: id })
        .populate('createdBy', 'fullName email')
        .populate('sourceId', 'name websiteUrl healthStatus');
    }

    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    // Increment views anonymously
    Opportunity.findByIdAndUpdate(opportunity._id, { $inc: { viewsCount: 1 } }).exec();

    res.json({ opportunity });
  } catch (error) {
    console.error('getOpportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Track click on application link
// @route   POST /api/opportunities/:id/click
// @access  Public
export const trackOpportunityClick = async (req, res) => {
  try {
    const { id } = req.params;
    await Opportunity.findByIdAndUpdate(id, { $inc: { clicksCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Could not track click' });
  }
};

// @desc    Update an opportunity
// @route   PUT /api/opportunities/:id
// @access  Private/Admin
export const updateOpportunity = async (req, res) => {
  try {
    parseComplexFields(req);

    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.status === 'published') {
      broadcastOpportunityUpdateInApp(opportunity).catch((err) =>
        console.error('In-app update notification failed:', err)
      );
      broadcastOpportunityEmail(opportunity, 'updated').catch((err) =>
        console.error('Broadcast email failed:', err)
      );
      broadcastOpportunitySMS(opportunity, 'updated').catch((err) =>
        console.error('Broadcast SMS failed:', err)
      );
    }

    res.json({ opportunity });
  } catch (error) {
    console.error('updateOpportunity error:', error);
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
    console.error('deleteOpportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
