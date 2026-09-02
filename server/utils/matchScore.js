/**
 * Calculates a match score (0–100) and transparent explanation reasons
 * between a user profile and an opportunity.
 *
 * Scoring breakdown:
 *   - Field of study / keywords match (up to 25 pts)
 *   - Degree level match (up to 20 pts)
 *   - Country / Nationality eligibility match (up to 20 pts)
 *   - Preferred opportunity type match (up to 10 pts)
 *   - Skills match (up to 10 pts)
 *   - Location / Region / Remote match (up to 5 pts)
 *   - Funding preference match (up to 5 pts)
 *   - Deadline active status (up to 5 pts)
 *
 * @param {Object} userProfile - The user's profile object
 * @param {Object} opportunity - The opportunity object
 * @returns {Number} Score between 0 and 100
 */
export const calculateMatchWithReasons = (userProfile, opportunity) => {
  let score = 0;
  const reasons = [];
  const user = userProfile || {};
  const opp = opportunity || {};
  const eligibility = opp.eligibility || {};

  // 1. Field of study match (up to 25 pts)
  const oppFields = [
    ...(opp.fieldsOfStudy || []),
    ...(opp.subjects || []),
    eligibility.fieldOfStudy,
  ]
    .filter(Boolean)
    .map((f) => f.toLowerCase());

  const userField = (user.fieldOfStudy || '').toLowerCase();
  const userPreferredFields = (user.preferredFields || []).map((f) => f.toLowerCase());

  let fieldMatched = false;
  if (userField && oppFields.some((f) => f.includes(userField) || userField.includes(f) || f === 'general' || f === 'any')) {
    score += 25;
    fieldMatched = true;
    reasons.push(`Matches your field of study (${user.fieldOfStudy})`);
  } else if (userPreferredFields.length > 0 && oppFields.some((f) => userPreferredFields.some((pf) => f.includes(pf) || pf.includes(f)))) {
    score += 20;
    fieldMatched = true;
    reasons.push('Matches your preferred study fields');
  } else if (oppFields.includes('general') || oppFields.includes('all') || oppFields.length === 0) {
    score += 15;
    reasons.push('Open to all fields of study');
  }

  // 2. Degree level match (up to 20 pts)
  const degreeLevels = [
    ...(opp.degreeLevels || []),
    eligibility.minEducationLevel,
  ].filter(Boolean);

  const levelsHierarchy = [
    'highschool',
    'diploma',
    'undergraduate',
    'graduate',
    'postgraduate',
    'mphil',
    'phd',
    'postdoctoral',
    'professional',
  ];

  if (user.educationLevel) {
    const userIdx = levelsHierarchy.indexOf(user.educationLevel.toLowerCase());
    if (degreeLevels.length === 0 || degreeLevels.includes('any')) {
      score += 20;
      reasons.push('Open to all education levels');
    } else {
      const matchDegree = degreeLevels.some((deg) => {
        const degIdx = levelsHierarchy.indexOf(deg.toLowerCase());
        return degIdx !== -1 && userIdx >= degIdx;
      });
      if (matchDegree) {
        score += 20;
        reasons.push(`You meet the education level requirement (${user.educationLevel})`);
      }
    }
  }

  // 3. Country / Nationality eligibility match (up to 20 pts)
  const eligibleCountries = [
    ...(opp.eligibleCountries || []),
    ...(eligibility.countryEligibility || []),
    ...(eligibility.nationality || []),
  ].map((c) => c.toLowerCase());

  const userCountry = (user.country || '').toLowerCase();
  const userNationality = (user.nationality || '').toLowerCase();

  if (
    eligibleCountries.length === 0 ||
    eligibleCountries.includes('worldwide') ||
    eligibleCountries.includes('all') ||
    eligibleCountries.includes('global') ||
    opp.region === 'Worldwide'
  ) {
    score += 20;
    reasons.push('Open to applicants worldwide');
  } else if (
    (userCountry && eligibleCountries.some((c) => c.includes(userCountry) || userCountry.includes(c))) ||
    (userNationality && eligibleCountries.some((c) => c.includes(userNationality) || userNationality.includes(c)))
  ) {
    score += 20;
    reasons.push(`Your country (${user.country || user.nationality}) is eligible`);
  }

  // 4. Preferred opportunity type match (up to 10 pts)
  const preferredTypes = (user.preferredOpportunityTypes || []).map((t) => t.toLowerCase());
  if (preferredTypes.length > 0 && opp.type && preferredTypes.includes(opp.type.toLowerCase())) {
    score += 10;
    reasons.push(`Matches your interest in ${opp.type} opportunities`);
  } else if (preferredTypes.length === 0) {
    score += 5;
  }

  // 5. Skills match (up to 10 pts)
  const userSkills = (user.skills || []).map((s) => s.toLowerCase());
  const oppSkills = (opp.skills || []).map((s) => s.toLowerCase());
  if (userSkills.length > 0) {
    const matchedSkills = userSkills.filter((sk) =>
      oppSkills.includes(sk) ||
      (opp.description || '').toLowerCase().includes(sk) ||
      (opp.title || '').toLowerCase().includes(sk)
    );
    if (matchedSkills.length > 0) {
      score += Math.min(matchedSkills.length * 5, 10);
      reasons.push(`Matches ${matchedSkills.length} of your listed skills`);
    }
  }

  // 6. Location / Region / Remote match (up to 5 pts)
  if (user.isRemoteOnly && opp.isRemote) {
    score += 5;
    reasons.push('Fully remote opportunity');
  } else if (!user.isRemoteOnly) {
    const preferredCountries = (user.preferredCountries || []).map((c) => c.toLowerCase());
    const preferredRegions = (user.preferredRegions || []).map((r) => r.toLowerCase());
    if (
      (opp.country && preferredCountries.includes(opp.country.toLowerCase())) ||
      (opp.region && preferredRegions.includes(opp.region.toLowerCase()))
    ) {
      score += 5;
      reasons.push('In your preferred destination');
    } else {
      score += 3;
    }
  }

  // 7. Funding preference match (up to 5 pts)
  const preferredFunding = (user.preferredFunding || []).map((f) => f.toLowerCase());
  if (opp.fundingType === 'fully_funded') {
    score += 5;
    reasons.push('Fully funded opportunity');
  } else if (opp.fundingType && preferredFunding.includes(opp.fundingType.toLowerCase())) {
    score += 5;
    reasons.push('Matches your funding preference');
  } else {
    score += 2;
  }

  // 8. Active deadline (up to 5 pts)
  if (opp.deadline && new Date(opp.deadline) > new Date()) {
    score += 5;
  }

  const finalScore = Math.min(Math.max(score, 0), 100);
  return {
    matchScore: finalScore,
    matchReasons: reasons.length > 0 ? reasons : ['General opportunity matching your region'],
  };
};

/**
 * Backward-compatible helper that returns only the integer score.
 */
const calculateMatch = (userProfile, opportunity) => {
  const result = calculateMatchWithReasons(userProfile, opportunity);
  return result.matchScore;
};

export default calculateMatch;