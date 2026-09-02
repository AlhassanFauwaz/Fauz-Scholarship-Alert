import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { calculateMatchWithReasons } from '../utils/matchScore.js';

/**
 * Generate comprehensive categorized recommendations using a scalable two-stage pipeline:
 * Stage 1: Candidate Generation (Hard eligibility & geographic filtering)
 * Stage 2: Multi-Factor Ranking & Explanation
 */
export const getUserRecommendations = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const now = new Date();
  const hiddenIds = user.profile?.hiddenOpportunities || [];
  const userCountry = user.profile?.country;
  const userNationality = user.profile?.nationality;
  const userDegree = user.profile?.educationLevel;
  const preferredTypes = user.profile?.preferredOpportunityTypes || [];

  // STAGE 1: Candidate Generation Query (Filter by hard eligibility constraints)
  const candidateFilter = {
    status: 'published',
    deadline: { $gt: now },
    _id: { $nin: hiddenIds },
  };

  const orEligibility = [];
  if (userCountry) {
    orEligibility.push({ country: userCountry }, { eligibleCountries: userCountry }, { country: 'Worldwide' });
  }
  if (userNationality) {
    orEligibility.push({ 'eligibility.nationality': userNationality }, { eligibleCountries: userNationality });
  }
  if (orEligibility.length > 0) {
    candidateFilter.$or = orEligibility;
  }

  if (preferredTypes.length > 0) {
    candidateFilter.type = { $in: preferredTypes };
  }

  // Fetch candidate pool (scales cleanly even across millions of records)
  let candidates = await Opportunity.find(candidateFilter)
    .sort({ verificationStatus: 1, qualityScore: -1, createdAt: -1 })
    .limit(150);

  // Fallback if candidate filter is overly narrow
  if (candidates.length < 10) {
    const broadCandidates = await Opportunity.find({
      status: 'published',
      deadline: { $gt: now },
      _id: { $nin: hiddenIds },
    })
      .sort({ qualityScore: -1, createdAt: -1 })
      .limit(60);
    candidates = [...candidates, ...broadCandidates];
  }

  // Deduplicate candidates by _id
  const seenIds = new Set();
  const uniqueCandidates = candidates.filter((item) => {
    if (seenIds.has(item._id.toString())) return false;
    seenIds.add(item._id.toString());
    return true;
  });

  // STAGE 2: Multi-Factor Scoring & Explanation
  const scored = uniqueCandidates.map((opp) => {
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

export default { getUserRecommendations };
