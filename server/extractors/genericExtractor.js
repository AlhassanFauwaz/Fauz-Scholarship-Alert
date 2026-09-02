import {
  normalizeCountry,
  normalizeFieldOfStudy,
  normalizeDegreeLevel,
  normalizeFundingType,
  normalizeOpportunityType,
} from '../services/taxonomyService.js';

/**
 * Clean HTML and extract plain text.
 */
export const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extract deadline date from text with multiple global date formats.
 */
export const extractDeadline = (text) => {
  if (!text) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 45);
    return { deadline: fallback, confidence: 50 };
  }

  const patterns = [
    /(?:deadline|closes?|closing date|due date|application end|apply by)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /(?:deadline|closes?|closing date|due date|application end|apply by)[:\s]+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /(?:deadline|closes?|closing date|due date|application end|apply by)[:\s]+(\d{4}-\d{2}-\d{2})/i,
    /(?:deadline|closes?|closing date|due date)[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime()) && parsed > new Date()) {
        return { deadline: parsed, confidence: 95 };
      }
    }
  }

  // Fallback 45 days into the future
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 45);
  return { deadline: fallback, confidence: 60 };
};

/**
 * Generic opportunity metadata extractor.
 */
export const extractOpportunityMetadata = (rawItem, source = {}) => {
  const title = stripHtml(rawItem.title || rawItem.name || '').trim();
  const rawDesc = rawItem.description || rawItem.content || rawItem.summary || title;
  const description = stripHtml(rawDesc);
  const shortDescription =
    description.length > 280 ? `${description.substring(0, 277)}...` : description;

  const appUrl =
    rawItem.applicationUrl || rawItem.url || rawItem.link || rawItem.guid || source.websiteUrl;

  const { deadline, confidence: deadlineConf } = rawItem.deadline
    ? { deadline: new Date(rawItem.deadline), confidence: 100 }
    : extractDeadline(description);

  const type = normalizeOpportunityType(rawItem.type || title || source.defaultOpportunityType);
  const category = rawItem.category || source.defaultCategory || 'General';
  const organization =
    rawItem.organization || rawItem.provider || rawItem.author || source.name || 'Host Organization';

  const country = normalizeCountry(rawItem.country || source.defaultCountry);
  const region = rawItem.region || source.region || 'Worldwide';
  const fundingType = normalizeFundingType(
    rawItem.fundingType || (title.toLowerCase().includes('fully funded') ? 'fully_funded' : 'other')
  );

  const isRemote =
    rawItem.isRemote === true ||
    /remote|online|virtual|work from home/i.test(`${title} ${description}`);

  // Degree detection
  let degreeLevels = [];
  if (rawItem.degreeLevels && rawItem.degreeLevels.length > 0) {
    degreeLevels = rawItem.degreeLevels.map(normalizeDegreeLevel);
  } else {
    const combined = `${title} ${description}`.toLowerCase();
    if (combined.includes('phd') || combined.includes('doctorate')) degreeLevels.push('phd');
    if (combined.includes('master') || combined.includes('msc') || combined.includes('postgraduate'))
      degreeLevels.push('graduate');
    if (combined.includes('bachelor') || combined.includes('undergraduate') || combined.includes('bsc'))
      degreeLevels.push('undergraduate');
    if (combined.includes('diploma') || combined.includes('certificate')) degreeLevels.push('diploma');
    if (degreeLevels.length === 0) degreeLevels.push('undergraduate');
  }

  // Field detection
  let fieldsOfStudy = [];
  if (rawItem.fieldsOfStudy && rawItem.fieldsOfStudy.length > 0) {
    fieldsOfStudy = rawItem.fieldsOfStudy.map(normalizeFieldOfStudy);
  } else {
    fieldsOfStudy = [normalizeFieldOfStudy(rawItem.fieldOfStudy || category)];
  }

  // Calculate classification confidence
  let confidence = 70;
  if (type !== 'other') confidence += 10;
  if (country !== 'Worldwide') confidence += 10;
  if (deadlineConf >= 90) confidence += 10;

  return {
    title,
    shortDescription,
    description,
    type,
    category,
    organization,
    provider: source.name || organization,
    country,
    region,
    isRemote,
    fundingType,
    fundingAmount: rawItem.fundingAmount || '',
    degreeLevels,
    fieldsOfStudy,
    deadline,
    applicationUrl: appUrl,
    officialWebsite: source.websiteUrl || appUrl,
    sourceUrl: rawItem.sourceUrl || appUrl,
    sourceName: source.name || 'Global Opportunity Directory',
    sourceId: source._id,
    datePublished: rawItem.datePublished ? new Date(rawItem.datePublished) : new Date(),
    classificationConfidence: Math.min(confidence, 100),
  };
};
