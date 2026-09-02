/**
 * OpportunityDetector
 * Fast two-stage detection service that determines whether a candidate webpage
 * or text payload contains a legitimate educational or professional opportunity.
 */

const OPPORTUNITY_SIGNALS = [
  { keyword: 'scholarship', weight: 25, type: 'scholarship' },
  { keyword: 'fellowship', weight: 25, type: 'fellowship' },
  { keyword: 'internship', weight: 25, type: 'internship' },
  { keyword: 'grant', weight: 20, type: 'grant' },
  { keyword: 'funding', weight: 15, type: 'funding' },
  { keyword: 'deadline', weight: 15 },
  { keyword: 'eligibility', weight: 15 },
  { keyword: 'apply now', weight: 15 },
  { keyword: 'application fee', weight: 10 },
  { keyword: 'fully funded', weight: 20 },
  { keyword: 'tuition waiver', weight: 20 },
  { keyword: 'monthly stipend', weight: 15 },
  { keyword: 'competition', weight: 20, type: 'competition' },
  { keyword: 'call for applications', weight: 20 },
  { keyword: 'research opportunity', weight: 20, type: 'research' },
  { keyword: 'exchange programme', weight: 20, type: 'exchange' },
  { keyword: 'volunteer', weight: 15, type: 'volunteer' },
  { keyword: 'conference grant', weight: 20, type: 'conference' },
  { keyword: 'master degree', weight: 10 },
  { keyword: 'phd position', weight: 15 },
  { keyword: 'postdoctoral', weight: 15, type: 'research' },
];

/**
 * Detect whether input text/HTML represents an opportunity.
 * @param {string} text - Plain text or HTML string.
 * @param {string} url - Target URL.
 * @returns {object} { isOpportunity, confidence, opportunityTypeProbability, signals }
 */
export const detectOpportunity = (text = '', url = '') => {
  if (!text || typeof text !== 'string') {
    return { isOpportunity: false, confidence: 0, signals: [], opportunityTypeProbability: {} };
  }

  const cleanText = `${text} ${url}`.toLowerCase();
  const detectedSignals = [];
  let totalScore = 0;
  const typeScores = {};

  for (const sig of OPPORTUNITY_SIGNALS) {
    if (cleanText.includes(sig.keyword)) {
      detectedSignals.push(sig.keyword);
      totalScore += sig.weight;
      if (sig.type) {
        typeScores[sig.type] = (typeScores[sig.type] || 0) + sig.weight;
      }
    }
  }

  // Structural signals
  if (/(\d{1,2}\s+[a-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})/i.test(text)) {
    detectedSignals.push('date_pattern_detected');
    totalScore += 10;
  }
  if (url && /(scholarship|fellowship|internship|grant|apply|opportunity|careers|jobs)/i.test(url)) {
    detectedSignals.push('url_opportunity_path');
    totalScore += 15;
  }

  const confidence = Math.min(Math.round((totalScore / 80) * 100), 100);
  const isOpportunity = confidence >= 35 && detectedSignals.length >= 2;

  return {
    isOpportunity,
    confidence,
    signals: detectedSignals,
    opportunityTypeProbability: typeScores,
  };
};

export default { detectOpportunity };
