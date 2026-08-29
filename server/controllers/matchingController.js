import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import calculateMatch from '../utils/matchScore.js';

// @desc    Get personalized recommendations for the logged-in user
// @route   GET /api/matching/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get all published opportunities that haven't expired. New users should
    // still see useful opportunities while they complete their profile.
    const opportunities = await Opportunity.find({
      status: 'published',
      deadline: { $gt: new Date() },
    }).sort({ deadline: 1 });

    if (!user.profile?.educationLevel) {
      return res.json({ recommendations: opportunities.slice(0, 6) });
    }

    // Score each one
    const scored = opportunities
      .map(opp => {
        const matchScore = calculateMatch(user.profile, opp);
        return { ...opp.toObject(), matchScore };
      })
      .filter(opp => opp.matchScore >= 40) // only decent matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20); // top 20

    // A partial profile can produce no 40%+ matches. Fall back to current
    // opportunities so the dashboard is never an empty dead end.
    res.json({ recommendations: scored.length ? scored : opportunities.slice(0, 6) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
