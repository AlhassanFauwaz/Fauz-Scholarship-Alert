import Opportunity from '../models/Opportunity.js';
import { normalizeUrl, calculateTextSimilarity } from './duplicateService.js';

export const DUPLICATE_LEVELS = {
  EXACT_DUPLICATE: 'EXACT_DUPLICATE',
  LIKELY_DUPLICATE: 'LIKELY_DUPLICATE',
  POSSIBLE_DUPLICATE: 'POSSIBLE_DUPLICATE',
  UNRELATED: 'UNRELATED',
};

/**
 * Compare two opportunity records across multiple vectors.
 */
export const compareOpportunities = (candidate, existing) => {
  // Vector 1: Direct application or source URL match
  const candAppUrl = normalizeUrl(candidate.applicationUrl || candidate.sourceUrl);
  const existAppUrl = normalizeUrl(existing.applicationUrl || existing.sourceUrl);
  const hasUrlMatch =
    candAppUrl &&
    (candAppUrl === existAppUrl ||
      existing.sourceReferences?.some((s) => normalizeUrl(s.url) === candAppUrl) ||
      existing.sources?.some((s) => normalizeUrl(s.url) === candAppUrl));

  if (hasUrlMatch) {
    return { level: DUPLICATE_LEVELS.EXACT_DUPLICATE, confidence: 100 };
  }

  // Vector 2: Title similarity
  const titleSim = calculateTextSimilarity(candidate.title || '', existing.title || '');

  // Vector 3: Organization match
  const candOrg = (candidate.organization || '').trim().toLowerCase();
  const existOrg = (existing.organization || '').trim().toLowerCase();
  const orgMatch = candOrg && existOrg && (candOrg === existOrg || candOrg.includes(existOrg) || existOrg.includes(candOrg));

  // Vector 4: Deadline proximity (within 3 days)
  let deadlineMatch = false;
  if (candidate.deadline && existing.deadline) {
    const diffDays = Math.abs(new Date(candidate.deadline) - new Date(existing.deadline)) / (1000 * 60 * 60 * 24);
    deadlineMatch = diffDays <= 3;
  }

  // Synthesis
  if (titleSim >= 0.85 && (orgMatch || deadlineMatch)) {
    return { level: DUPLICATE_LEVELS.EXACT_DUPLICATE, confidence: Math.round(titleSim * 100) };
  }
  if (titleSim >= 0.70 && orgMatch) {
    return { level: DUPLICATE_LEVELS.LIKELY_DUPLICATE, confidence: Math.round(titleSim * 100) };
  }
  if (titleSim >= 0.60 || (orgMatch && deadlineMatch)) {
    return { level: DUPLICATE_LEVELS.POSSIBLE_DUPLICATE, confidence: 60 };
  }

  return { level: DUPLICATE_LEVELS.UNRELATED, confidence: 0 };
};

/**
 * Check if a candidate matches any existing opportunities in the database.
 */
export const evaluateDuplicates = async (candidate) => {
  const { title, applicationUrl, sourceUrl } = candidate;

  // 1. Check exact URL matches first
  if (applicationUrl || sourceUrl) {
    const targetUrl = applicationUrl || sourceUrl;
    const urlMatch = await Opportunity.findOne({
      $or: [
        { applicationUrl: targetUrl },
        { sourceUrl: targetUrl },
        { 'sourceReferences.url': targetUrl },
        { 'sources.url': targetUrl },
      ],
    });
    if (urlMatch) {
      return { match: urlMatch, level: DUPLICATE_LEVELS.EXACT_DUPLICATE, confidence: 100 };
    }
  }

  // 2. Scan candidate items by keywords
  if (title) {
    const words = title
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 4);

    if (words.length > 0) {
      const candidates = await Opportunity.find({
        $or: words.map((w) => ({ title: { $regex: w, $options: 'i' } })),
      }).limit(15);

      for (const item of candidates) {
        const comparison = compareOpportunities(candidate, item);
        if (
          comparison.level === DUPLICATE_LEVELS.EXACT_DUPLICATE ||
          comparison.level === DUPLICATE_LEVELS.LIKELY_DUPLICATE
        ) {
          return { match: item, level: comparison.level, confidence: comparison.confidence };
        }
      }
    }
  }

  return { match: null, level: DUPLICATE_LEVELS.UNRELATED, confidence: 0 };
};

/**
 * Merge an opportunity candidate into a master opportunity record.
 */
export const mergeIntoMasterRecord = async (masterOpp, candidate, source = {}) => {
  const isOfficial =
    source.trustLevel === 'official' ||
    (source.trustScore && source.trustScore >= 90) ||
    candidate.isOfficial === true;

  const newCitation = {
    name: candidate.sourceName || source.name || 'Additional Opportunity Source',
    url: candidate.sourceUrl || candidate.applicationUrl,
    domain: source.domain || (candidate.sourceUrl ? new URL(candidate.sourceUrl).hostname : ''),
    sourceId: source._id || candidate.sourceId,
    discoveredAt: new Date(),
    firstDiscovered: new Date(),
    lastVerified: new Date(),
    sourceTrustScore: source.trustScore || 75,
    isOfficial,
  };

  // Check if citation URL is already present
  const alreadyCited = masterOpp.sourceReferences?.some(
    (s) => normalizeUrl(s.url) === normalizeUrl(newCitation.url)
  );

  if (!alreadyCited) {
    if (!masterOpp.sourceReferences) masterOpp.sourceReferences = [];
    masterOpp.sourceReferences.push(newCitation);
    masterOpp.sources = masterOpp.sourceReferences;
    masterOpp.isMerged = true;

    // If candidate comes from an official university/government domain, promote official links
    if (isOfficial) {
      if (candidate.applicationUrl && !masterOpp.officialWebsite) {
        masterOpp.officialWebsite = candidate.applicationUrl;
      }
      masterOpp.verificationStatus = 'official';
    }

    await masterOpp.save();
  }

  return masterOpp;
};

export default {
  DUPLICATE_LEVELS,
  compareOpportunities,
  evaluateDuplicates,
  mergeIntoMasterRecord,
};
