import User from '../models/User.js';
import { getUserRecommendations } from '../services/recommendationService.js';

// @desc    Get personalized recommendations for the logged-in user
// @route   GET /api/matching/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const result = await getUserRecommendations(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('getRecommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Dismiss / hide an opportunity (mark as "not interested")
// @route   POST /api/matching/dismiss/:id
// @access  Private
export const dismissOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.profile) {
      user.profile = {};
    }
    if (!user.profile.hiddenOpportunities) {
      user.profile.hiddenOpportunities = [];
    }

    if (!user.profile.hiddenOpportunities.includes(id)) {
      user.profile.hiddenOpportunities.push(id);
      await user.save();
    }

    res.json({ message: 'Opportunity marked as not interested', dismissedId: id });
  } catch (error) {
    console.error('dismissOpportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
