/**
 * Calculates a match score (0–100) between a user profile and an opportunity.
 * The score is based on:
 *   - Education level match (30 points)
 *   - Field of study match (25 points)
 *   - Country eligibility match (20 points)
 *   - Preferred opportunity type match (15 points)
 *   - Keyword/interest overlap (10 points)
 *
 * @param {Object} userProfile - The user's profile object (from User model)
 * @param {Object} opportunity - The opportunity object (from Opportunity model)
 * @returns {Number} Score between 0 and 100
 */
const calculateMatch = (userProfile, opportunity) => {
  let score = 0;
  const eligibility = opportunity.eligibility || {};
  const user = userProfile || {};

  // 1. Education level (30 points)
  if (eligibility.minEducationLevel && user.educationLevel) {
    const levels = ['highschool', 'undergraduate', 'graduate', 'postgraduate', 'phd'];
    const userIdx = levels.indexOf(user.educationLevel);
    const minIdx = levels.indexOf(eligibility.minEducationLevel);
    if (userIdx >= minIdx) {
      score += 30;
    }
  }

  // 2. Field of study (25 points)
  if (eligibility.fieldOfStudy && user.fieldOfStudy) {
    if (eligibility.fieldOfStudy.toLowerCase() === user.fieldOfStudy.toLowerCase()) {
      score += 25;
    } else if (user.interests && user.interests.some(i => i.toLowerCase() === eligibility.fieldOfStudy.toLowerCase())) {
      score += 15;
    }
  }

  // 3. Country eligibility (20 points)
  if (eligibility.countryEligibility && eligibility.countryEligibility.length > 0 && user.country) {
    if (eligibility.countryEligibility.includes(user.country)) {
      score += 20;
    }
  } else if (opportunity.country && user.country) {
    // If no eligibility list, just country match (looser)
    if (opportunity.country === user.country) {
      score += 10;
    }
  }

  // 4. Preferred opportunity types (15 points)
  if (user.preferredOpportunityTypes && user.preferredOpportunityTypes.length > 0) {
    if (user.preferredOpportunityTypes.includes(opportunity.type)) {
      score += 15;
    }
  }

  // 5. Keywords / interests (10 points)
  const userKeywords = [
    ...(user.keywords || []),
    ...(user.interests || []),
    ...(user.preferredFields || []),
  ].map(k => k.toLowerCase());

  if (userKeywords.length > 0) {
    const haystack = `${opportunity.title} ${opportunity.description} ${opportunity.category}`.toLowerCase();
    let hits = 0;
    for (const kw of userKeywords) {
      if (haystack.includes(kw)) hits++;
    }
    score += Math.min(hits * 2, 10);
  }

  return Math.min(score, 100);
};

export default calculateMatch;