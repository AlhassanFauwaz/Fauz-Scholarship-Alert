/**
 * OpportunityVerificationEngine
 * Evaluates authenticity, source authority, application link viability,
 * and sets standardized lifecycle verification states.
 */

export const VERIFICATION_STATES = {
  DISCOVERED: 'discovered',
  EXTRACTED: 'extracted',
  VALIDATED: 'validated',
  SOURCE_VERIFIED: 'source_verified',
  VERIFIED: 'verified',
  OFFICIAL: 'official',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  ARCHIVED: 'archived',
};

/**
 * Determine verification status based on quality, trust, and risk.
 * @param {object} candidate - Opportunity candidate.
 * @param {object} source - OpportunitySource record.
 * @param {object} riskAssessment - Output from FraudRiskEngine.
 * @param {number} qualityScore - Quality score (0-100).
 * @returns {object} { verificationStatus, verificationNotes, autoPublish }
 */
export const verifyOpportunityAuthenticity = (
  candidate = {},
  source = {},
  riskAssessment = {},
  qualityScore = 75
) => {
  const { isSuspicious, riskLevel, reasons: riskReasons = [] } = riskAssessment;

  // 1. Critical fraud / spam detection -> REJECTED
  if (isSuspicious || riskLevel === 'critical') {
    return {
      verificationStatus: VERIFICATION_STATES.REJECTED,
      verificationNotes: `Automated Fraud Filter Flag: ${riskReasons.join('; ')}`,
      autoPublish: false,
    };
  }

  // 2. Official university or government source domain -> OFFICIAL
  const isOfficial =
    source.trustLevel === 'official' ||
    (source.domain && (source.domain.endsWith('.edu') || source.domain.endsWith('.ac.uk') || source.domain.endsWith('.gov') || source.domain.includes('un.org') || source.domain.includes('europa.eu')));

  if (isOfficial && qualityScore >= 70 && !isSuspicious) {
    return {
      verificationStatus: VERIFICATION_STATES.OFFICIAL,
      verificationNotes: `Verified from Official Host Entity Domain (${source.domain || source.name})`,
      autoPublish: true,
    };
  }

  // 3. Highly trusted / trusted platform with solid quality -> VERIFIED
  const isTrusted =
    source.trustLevel === 'highly_trusted' ||
    source.trustLevel === 'trusted' ||
    (source.trustScore && source.trustScore >= 75);

  if (isTrusted && qualityScore >= 75 && !isSuspicious) {
    return {
      verificationStatus: VERIFICATION_STATES.VERIFIED,
      verificationNotes: `Authenticity verified by automated quality & multi-signal rules (Quality: ${qualityScore}/100)`,
      autoPublish: true,
    };
  }

  // 4. Moderate trust or lower confidence -> VALIDATED (Requires Admin Review)
  return {
    verificationStatus: VERIFICATION_STATES.VALIDATED,
    verificationNotes: 'Discovered candidate awaiting administrator confirmation',
    autoPublish: false,
  };
};

export default {
  VERIFICATION_STATES,
  verifyOpportunityAuthenticity,
};
