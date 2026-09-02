/**
 * FraudRiskEngine
 * Evaluates candidate opportunities against suspicious patterns, fee-scam indicators,
 * malicious redirects, and phishing heuristics.
 */

const CRITICAL_FRAUD_PATTERNS = [
  { pattern: /send\s+money\s+to\s+claim/i, reason: 'Demands upfront money to claim opportunity' },
  { pattern: /western\s+union|moneygram/i, reason: 'Requests wire transfer payment via Western Union or MoneyGram' },
  { pattern: /crypto\s+payment|bitcoin\s+deposit|usdt\s+transfer/i, reason: 'Demands cryptocurrency or Bitcoin payments' },
  { pattern: /dm\s+on\s+telegram|whatsapp\s+us\s+to\s+get\s+scholarship/i, reason: 'Directs application to private messaging (Telegram/WhatsApp)' },
  { pattern: /100%\s+guaranteed\s+(visa|scholarship|admission)\s+if\s+you\s+pay/i, reason: 'Claims guaranteed admission/visa in exchange for payment' },
];

const SUSPICIOUS_DOMAINS = ['bit.ly', 'tinyurl.com', 'wa.me', 't.me', 'cutt.ly', 'is.gd'];

/**
 * Assess fraud and security risk for an opportunity candidate.
 * @param {object} candidate - Opportunity candidate record.
 * @param {object} source - Associated OpportunitySource record.
 * @returns {object} { riskScore, riskLevel, reasons, isSuspicious }
 */
export const assessFraudRisk = (candidate = {}, source = {}) => {
  let riskScore = 5;
  const reasons = [];

  const combinedText = `${candidate.title || ''} ${candidate.description || ''} ${candidate.applicationUrl || ''} ${candidate.requirements?.instructions || ''}`.toLowerCase();

  // 1. Critical fraud pattern matching
  for (const item of CRITICAL_FRAUD_PATTERNS) {
    if (item.pattern.test(combinedText)) {
      riskScore += 45;
      reasons.push(item.reason);
    }
  }

  // 2. Suspicious URL redirects
  if (candidate.applicationUrl) {
    const lowerUrl = candidate.applicationUrl.toLowerCase();
    for (const sDomain of SUSPICIOUS_DOMAINS) {
      if (lowerUrl.includes(sDomain)) {
        riskScore += 30;
        reasons.push(`Application link uses shortened or direct-messaging URL: ${sDomain}`);
        break;
      }
    }
  }

  // 3. Organization verification check
  if (!candidate.organization || candidate.organization === 'Host Organization' || candidate.organization === 'Unknown') {
    riskScore += 15;
    reasons.push('Host organization is missing or unverified');
  }

  // 4. Source Trust Level influence
  if (source.trustLevel === 'untrusted' || (source.trustScore && source.trustScore < 40)) {
    riskScore += 25;
    reasons.push('Discovered from low-trust or unverified external source domain');
  }

  // Determine Risk Level
  riskScore = Math.min(Math.max(riskScore, 0), 100);
  let riskLevel = 'low';
  if (riskScore >= 70) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';

  return {
    riskScore,
    riskLevel,
    reasons,
    isSuspicious: riskLevel === 'high' || riskLevel === 'critical',
  };
};

export default { assessFraudRisk };
