/**
 * Opportunity quality assessment and spam/fraud heuristic checks.
 */

const SUSPICIOUS_KEYWORDS = [
  'send money to claim',
  'western union',
  'processing fee required via whatsapp',
  '100% guaranteed admission if you pay',
  'dm on telegram for scholarship',
  'wire transfer fee',
  'crypto payment',
  'bitcoin deposit',
];

/**
 * Check if opportunity content shows spam, phishing, or fee-scam patterns.
 */
export const detectSpamOrFraud = (candidate) => {
  const combined = `${candidate.title} ${candidate.description} ${candidate.applicationUrl}`.toLowerCase();

  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (combined.includes(keyword)) {
      return { isSpam: true, reason: `Contains suspicious payment keyword: "${keyword}"` };
    }
  }

  // Check malformed or suspicious URLs
  if (candidate.applicationUrl) {
    const url = candidate.applicationUrl.toLowerCase();
    if (url.includes('bit.ly/') || url.includes('tinyurl.com/') || url.includes('wa.me/')) {
      return { isSpam: true, reason: 'Uses shortened or direct messaging link instead of official portal' };
    }
  }

  return { isSpam: false };
};

/**
 * Calculate Quality Score (0–100) for an opportunity.
 */
export const calculateQualityScore = (candidate, source = {}) => {
  let score = 0;

  // 1. Official/trusted source (+30)
  if (source.trustScore) {
    score += Math.round((source.trustScore / 100) * 30);
  } else {
    score += 20;
  }

  // 2. Valid HTTPS application link (+20)
  if (candidate.applicationUrl && candidate.applicationUrl.startsWith('https://')) {
    score += 20;
  } else if (candidate.applicationUrl) {
    score += 10;
  }

  // 3. Valid future deadline (+15)
  if (candidate.deadline && new Date(candidate.deadline) > new Date()) {
    score += 15;
  }

  // 4. Complete description & eligibility (+15)
  const descLen = (candidate.description || '').length;
  if (descLen > 250) {
    score += 15;
  } else if (descLen > 100) {
    score += 10;
  } else {
    score += 5;
  }

  // 5. Host organization identified (+10)
  if (candidate.organization && candidate.organization !== 'Host Organization') {
    score += 10;
  }

  // 6. Degree and study fields structured (+10)
  if (candidate.degreeLevels?.length > 0 && candidate.fieldsOfStudy?.length > 0) {
    score += 10;
  } else {
    score += 5;
  }

  return Math.min(Math.max(score, 0), 100);
};
