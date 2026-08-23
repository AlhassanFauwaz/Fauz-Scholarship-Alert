import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import SavedOpportunity from '../models/SavedOpportunity.js';
import Feedback from '../models/Feedback.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });

    const totalOpportunities = await Opportunity.countDocuments();
    const publishedOpportunities = await Opportunity.countDocuments({ status: 'published' });
    const draftOpportunities = await Opportunity.countDocuments({ status: 'draft' });
    const expiredOpportunities = await Opportunity.countDocuments({ status: 'expired' });

    const totalScholarships = await Opportunity.countDocuments({ type: 'scholarship' });
    const totalInternships = await Opportunity.countDocuments({ type: 'internship' });
    const totalFellowships = await Opportunity.countDocuments({ type: 'fellowship' });
    const totalGrants = await Opportunity.countDocuments({ type: 'grant' });

    const totalSubscriptions = await Subscription.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const successfulNotifications = await Notification.countDocuments({ status: 'sent' });
    const failedNotifications = await Notification.countDocuments({ status: 'failed' });

    // Most viewed/saved opportunities (we'll mock for now, can be based on saved count)
    const mostSaved = await SavedOpportunity.aggregate([
      { $group: { _id: '$opportunity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'opportunities', localField: '_id', foreignField: '_id', as: 'opportunity' } },
      { $unwind: '$opportunity' },
      { $project: { title: '$opportunity.title', count: 1 } },
    ]);

    // Recent registrations
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('fullName email createdAt');

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalOpportunities,
        publishedOpportunities,
        draftOpportunities,
        expiredOpportunities,
        totalScholarships,
        totalInternships,
        totalFellowships,
        totalGrants,
        totalSubscriptions,
        totalNotifications,
        successfulNotifications,
        failedNotifications,
      },
      mostSaved,
      recentUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Get all users (admin view)
// @route   GET /api/admin/users
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update feedback (respond, change status)
// @route   PUT /api/admin/feedback/:id
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get aggregated reports
// @route   GET /api/admin/reports
export const getAdminReports = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    // Date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // User stats
    const totalUsers = await User.countDocuments(dateFilter);
    const verifiedUsers = await User.countDocuments({ ...dateFilter, emailVerified: true });
    const activeUsers = await User.countDocuments({ ...dateFilter, accountStatus: 'active' });
    const suspendedUsers = await User.countDocuments({ ...dateFilter, accountStatus: 'suspended' });

    // Opportunity stats (filterable by type and category)
    let oppFilter = { ...dateFilter };
    if (type) oppFilter.type = type;
    if (category) oppFilter.category = category;

    const totalOpportunities = await Opportunity.countDocuments(oppFilter);
    const publishedOpps = await Opportunity.countDocuments({ ...oppFilter, status: 'published' });
    const draftOpps = await Opportunity.countDocuments({ ...oppFilter, status: 'draft' });
    const expiredOpps = await Opportunity.countDocuments({ ...oppFilter, status: 'expired' });

    // Opportunity breakdown by type
    const opportunitiesByType = await Opportunity.aggregate([
      { $match: oppFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Opportunity breakdown by country
    const opportunitiesByCountry = await Opportunity.aggregate([
      { $match: oppFilter },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Notification stats
    const totalNotifications = await Notification.countDocuments(dateFilter);
    const emailNotifications = await Notification.countDocuments({ ...dateFilter, channel: 'email' });
    const smsNotifications = await Notification.countDocuments({ ...dateFilter, channel: 'sms' });
    const inAppNotifications = await Notification.countDocuments({ ...dateFilter, channel: 'in-app' });
    const deliveredNotifications = await Notification.countDocuments({ ...dateFilter, status: 'delivered' });
    const failedNotifications = await Notification.countDocuments({ ...dateFilter, status: 'failed' });

    // Engagement stats (most viewed/saved)
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all opportunities (admin view)
// @route   GET /api/admin/opportunities
export const getAdminOpportunities = async (req, res) => {
  try {
    const { keyword, type, status, category, country } = req.query;
    let query = {};

    if (keyword) {
      query.$text = { $search: keyword };
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    if (country) query.country = country;

    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email');

    res.json({ opportunities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};