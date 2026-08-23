import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import calculateMatch from '../utils/matchScore.js';

// @desc    Get personalized recommendations for the logged-in user
// @route   GET /api/matching/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.profile || !user.profile.educationLevel) {
      return res.status(400).json({
        message: 'Please complete your profile (at least education level) to get recommendations.',
      });
    }

    // Get all published opportunities that haven't expired
    const opportunities = await Opportunity.find({
      status: 'published',
      deadline: { $gt: new Date() },
    });

    // Score each one
    const scored = opportunities
      .map(opp => {
        const matchScore = calculateMatch(user.profile, opp);
        return { ...opp.toObject(), matchScore };
      })
      .filter(opp => opp.matchScore >= 40) // only decent matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20); // top 20

    res.json({ recommendations: scored });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};