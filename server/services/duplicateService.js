import Opportunity from '../models/Opportunity.js';

/**
 * Normalizes a URL for comparison by stripping protocol, www, trailing slashes, and UTM tracking parameters.
 */
export const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.trim());
    // remove common tracking query params
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source'];
    paramsToRemove.forEach((p) => parsed.searchParams.delete(p));
    let clean = `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`;
    clean = clean.replace(/\/+$/, '').toLowerCase();
    if (parsed.search) clean += parsed.search;
    return clean;
  } catch (e) {
    return url.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');
  }
};

/**
 * Simple light stemmer for plurals.
 */
const stemWord = (word) => {
  if (!word || word.length < 4) return word;
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.endsWith('es') && !word.endsWith('les')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
};

/**
 * Tokenize a string into stemmed alphanumeric word set for Jaccard similarity.
 */
const tokenize = (text) => {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .map(stemWord)
  );
};

/**
 * Calculate Jaccard similarity between two texts.
 */
export const calculateTextSimilarity = (text1, text2) => {
  const set1 = tokenize(text1);
  const set2 = tokenize(text2);
  if (set1.size === 0 && set2.size === 0) return 1;
  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

/**
 * Check if a candidate opportunity already exists in the database.
 * Returns the existing duplicate Opportunity or null.
 */
export const findDuplicate = async (candidate) => {
  const { title, applicationUrl, sourceUrl, organization } = candidate;

  // 1. Direct match on applicationUrl
  if (applicationUrl) {
    const existing = await Opportunity.find({
      $or: [
        { applicationUrl: candidate.applicationUrl },
        { sourceUrl: candidate.applicationUrl },
      ],
    }).limit(1);

    if (existing.length > 0) return existing[0];
  }

  // 2. Direct match on sourceUrl
  if (sourceUrl) {
    const existing = await Opportunity.findOne({
      $or: [{ sourceUrl }, { applicationUrl: sourceUrl }],
    });
    if (existing) return existing;
  }

  // 3. Exact Title + Organization match
  if (title && organization) {
    const escapedTitle = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedOrg = organization.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Opportunity.findOne({
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') },
      organization: { $regex: new RegExp(`^${escapedOrg}$`, 'i') },
    });
    if (existing) return existing;
  }

  // 4. Fuzzy title search within candidates
  if (title) {
    const words = title
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 4);

    if (words.length > 0) {
      const candidates = await Opportunity.find({
        $or: words.map((w) => ({ title: { $regex: w, $options: 'i' } })),
      }).limit(10);

      for (const item of candidates) {
        const sim = calculateTextSimilarity(title, item.title);
        if (sim >= 0.70) {
          return item;
        }
      }
    }
  }

  return null;
};
