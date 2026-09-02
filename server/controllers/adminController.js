import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import OpportunitySource from '../models/OpportunitySource.js';
import OpportunityIngestion from '../models/OpportunityIngestion.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import SavedOpportunity from '../models/SavedOpportunity.js';
import Feedback from '../models/Feedback.js';
import { mergeOpportunityIntoMaster } from '../services/duplicateService.js';

// @desc    Get comprehensive admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalOpportunities,
      publishedOpportunities,
      draftOpportunities,
      expiredOpportunities,
      pendingVerificationOpportunities,
      verifiedOpportunities,
      newTodayOpportunities,
      totalScholarships,
      totalInternships,
      totalFellowships,
      totalGrants,
      totalJobs,
      totalCompetitions,
      totalSources,
      healthySources,
      failedSources,
      totalSubscriptions,
      totalNotifications,
      successfulNotifications,
      failedNotifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: 'active' }),
      User.countDocuments({ emailVerified: true }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: 'published' }),
      Opportunity.countDocuments({ status: 'draft' }),
      Opportunity.countDocuments({ status: 'expired' }),
      Opportunity.countDocuments({ verificationStatus: 'pending' }),
      Opportunity.countDocuments({ verificationStatus: { $in: ['verified', 'official_source'] } }),
      Opportunity.countDocuments({ createdAt: { $gte: today } }),
      Opportunity.countDocuments({ type: 'scholarship' }),
      Opportunity.countDocuments({ type: 'internship' }),
      Opportunity.countDocuments({ type: 'fellowship' }),
      Opportunity.countDocuments({ type: 'grant' }),
      Opportunity.countDocuments({ type: 'job' }),
      Opportunity.countDocuments({ type: 'competition' }),
      OpportunitySource.countDocuments(),
      OpportunitySource.countDocuments({ healthStatus: 'healthy', active: true }),
      OpportunitySource.countDocuments({ healthStatus: 'failed', active: true }),
      Subscription.countDocuments(),
      Notification.countDocuments(),
      Notification.countDocuments({ status: 'sent' }),
      Notification.countDocuments({ status: 'failed' }),
    ]);

    // Most saved opportunities
    const mostSaved = await SavedOpportunity.aggregate([
      { $group: { _id: '$opportunity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'opportunities',
          localField: '_id',
          foreignField: '_id',
          as: 'opportunity',
        },
      },
      { $unwind: '$opportunity' },
      {
        $project: {
          title: '$opportunity.title',
          type: '$opportunity.type',
          country: '$opportunity.country',
          count: 1,
        },
      },
    ]);

    // Most viewed opportunities
    const mostViewed = await Opportunity.find({ status: 'published' })
      .sort({ viewsCount: -1 })
      .limit(6)
      .select('title type country viewsCount clicksCount');

    // Recent registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt accountStatus');

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalOpportunities,
        publishedOpportunities,
        draftOpportunities,
        expiredOpportunities,
        pendingVerificationOpportunities,
        verifiedOpportunities,
        newTodayOpportunities,
        totalScholarships,
        totalInternships,
        totalFellowships,
        totalGrants,
        totalJobs,
        totalCompetitions,
        totalSources,
        healthySources,
        failedSources,
        totalSubscriptions,
        totalNotifications,
        successfulNotifications,
        failedNotifications,
      },
      mostSaved,
      mostViewed,
      recentUsers,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify or moderate an opportunity
// @route   PUT /api/admin/opportunities/:id/verify
// @access  Private/Admin
export const verifyOpportunity = async (req, res) => {
  try {
    const { verificationStatus, verificationNotes, autoPublish = true } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    if (verificationStatus) {
      opportunity.verificationStatus = verificationStatus;
      opportunity.verifiedBy = req.user.id;
      opportunity.verifiedAt = new Date();
      if (verificationStatus === 'verified' && autoPublish) {
        opportunity.status = 'published';
      }
    }
    if (verificationNotes !== undefined) {
      opportunity.verificationNotes = verificationNotes;
    }

    await opportunity.save();
    res.json({ opportunity });
  } catch (error) {
    console.error('verifyOpportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Merge duplicate opportunity into master opportunity
// @route   POST /api/admin/opportunities/:id/merge
// @access  Private/Admin
export const mergeOpportunities = async (req, res) => {
  try {
    const { targetMasterId } = req.body;
    const duplicateOpp = await Opportunity.findById(req.params.id);
    const masterOpp = await Opportunity.findById(targetMasterId);

    if (!duplicateOpp || !masterOpp) {
      return res.status(404).json({ message: 'One or both opportunities not found' });
    }

    await mergeOpportunityIntoMaster(masterOpp, duplicateOpp);
    // Mark duplicate as archived/merged
    duplicateOpp.status = 'archived';
    duplicateOpp.verificationStatus = 'rejected';
    duplicateOpp.verificationNotes = `Merged into master opportunity: ${masterOpp._id}`;
    await duplicateOpp.save();

    res.json({ message: 'Opportunities merged successfully', masterOpportunity: masterOpp });
  } catch (error) {
    console.error('mergeOpportunities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get raw ingestion audit logs
// @route   GET /api/admin/ingestions
// @access  Private/Admin
export const getIngestions = async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.processingStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [ingestions, total] = await Promise.all([
      OpportunityIngestion.find(filter)
        .sort({ retrievedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('sourceId', 'name sourceType websiteUrl')
        .populate('extractedOpportunityId', 'title slug status verificationStatus'),
      OpportunityIngestion.countDocuments(filter),
    ]);

    res.json({
      ingestions,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    console.error('getIngestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all opportunities (admin view with moderation and filters)
// @route   GET /api/admin/opportunities
// @access  Private/Admin
export const getAdminOpportunities = async (req, res) => {
  try {
    const { keyword, type, status, verificationStatus, category, country } = req.query;
    let query = {};

    if (keyword) {
      const keywordPattern = new RegExp(keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: keywordPattern },
        { organization: keywordPattern },
        { country: keywordPattern },
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (category) query.category = category;
    if (country) query.country = country;

    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email')
      .populate('sourceId', 'name websiteUrl healthStatus');

    res.json({ opportunities });
  } catch (error) {
    console.error('getAdminOpportunities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAdminUsers = async (req, res) => {
  try {
    const { search, status, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.accountStatus = status;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password -emailVerificationToken -resetPasswordToken')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('getAdminUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status or role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateAdminUser = async (req, res) => {
  try {
    const { accountStatus, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (accountStatus) user.accountStatus = accountStatus;
    if (role) user.role = role;

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all feedback
// @route   GET /api/admin/feedback
// @access  Private/Admin
export const getAdminFeedback = async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const feedback = await Feedback.find(query)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ feedback });
  } catch (error) {
    console.error('getAdminFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update feedback
// @route   PUT /api/admin/feedback/:id
// @access  Private/Admin
export const updateAdminFeedback = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    if (status) feedback.status = status;
    if (adminResponse) feedback.adminResponse = adminResponse;

    await feedback.save();
    res.json({ feedback });
  } catch (error) {
    console.error('updateAdminFeedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get aggregated reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAdminReports = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const totalUsers = await User.countDocuments(dateFilter);
    const verifiedUsers = await User.countDocuments({ ...dateFilter, emailVerified: true });
    const activeUsers = await User.countDocuments({ ...dateFilter, accountStatus: 'active' });
    const suspendedUsers = await User.countDocuments({ ...dateFilter, accountStatus: 'suspended' });

    let oppFilter = { ...dateFilter };
    if (type) oppFilter.type = type;
    if (category) oppFilter.category = category;

    const totalOpportunities = await Opportunity.countDocuments(oppFilter);
    const publishedOpps = await Opportunity.countDocuments({ ...oppFilter, status: 'published' });
    const draftOpps = await Opportunity.countDocuments({ ...oppFilter, status: 'draft' });
    const expiredOpps = await Opportunity.countDocuments({ ...oppFilter, status: 'expired' });

    const opportunitiesByType = await Opportunity.aggregate([
      { $match: oppFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const opportunitiesByCountry = await Opportunity.aggregate([
      { $match: oppFilter },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalNotifications = await Notification.countDocuments(dateFilter);
    const emailNotifications = await Notification.countDocuments({ ...dateFilter, channel: 'email' });
    const smsNotifications = await Notification.countDocuments({ ...dateFilter, channel: 'sms' });
    const inAppNotifications = await Notification.countDocuments({ ...dateFilter, channel: 'in-app' });
    const deliveredNotifications = await Notification.countDocuments({ ...dateFilter, status: 'delivered' });
    const failedNotifications = await Notification.countDocuments({ ...dateFilter, status: 'failed' });

    const mostSaved = await SavedOpportunity.aggregate([
      { $group: { _id: '$opportunity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'opportunities',
          localField: '_id',
          foreignField: '_id',
          as: 'opportunity',
        },
      },
      { $unwind: '$opportunity' },
      { $project: { title: '$opportunity.title', count: 1 } },
    ]);

    res.json({
      userReports: {
        totalUsers,
        verifiedUsers,
        activeUsers,
        suspendedUsers,
      },
      opportunityReports: {
        totalOpportunities,
        publishedOpps,
        draftOpps,
        expiredOpps,
        byType: opportunitiesByType,
        byCountry: opportunitiesByCountry,
      },
      notificationReports: {
        totalNotifications,
        emailNotifications,
        smsNotifications,
        inAppNotifications,
        deliveredNotifications,
        failedNotifications,
      },
      engagementReports: {
        mostSaved,
      },
    });
  } catch (error) {
    console.error('getAdminReports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};