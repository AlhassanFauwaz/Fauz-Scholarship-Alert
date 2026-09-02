import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { calculateMatchWithReasons } from '../utils/matchScore.js';

/**
 * Generate comprehensive categorized recommendations for a user.
 */
export const getUserRecommendations = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const now = new Date();
  const hiddenIds = user.profile?.hiddenOpportunities || [];

  // Query all active published opportunities
  const opportunities = await Opportunity.find({
    status: 'published',
    deadline: { $gt: now },
    _id: { $nin: hiddenIds },
  })
    .sort({ createdAt: -1 })
    .limit(100);

  // Score all opportunities
  const scored = opportunities.map((opp) => {
    const { matchScore, matchReasons } = calculateMatchWithReasons(user.profile, opp);
    return {
      ...opp.toObject(),
      matchScore,
      matchReasons,
    };
  });

  // Top recommendations sorted by score descending
  const recommended = scored
    .filter((opp) => opp.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 18);

  // If no high-scoring matches, return latest opportunities
  const fallback = scored.slice(0, 6);
  const finalRecommended = recommended.length > 0 ? recommended : fallback;

  // New opportunities discovered in the last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newOpportunities = scored
    .filter((opp) => new Date(opp.dateDiscovered || opp.createdAt) >= sevenDaysAgo)
    .slice(0, 6);

  // Closing soon opportunities (closing in <= 7 days)
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const closingSoon = scored
    .filter((opp) => new Date(opp.deadline) <= sevenDaysLater)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 6);

  return {
    recommendations: finalRecommended,
    newOpportunities,
    closingSoon,
  };
};
