import { stripHtml } from './genericExtractor.js';
import {
  normalizeCountry,
  normalizeFieldOfStudy,
  normalizeDegreeLevel,
  normalizeFundingType,
  normalizeOpportunityType,
} from '../services/taxonomyService.js';

/**
 * Extract structured opportunity data from JSON-LD schema blocks in HTML.
 */
export const extractJsonLdOpportunities = (htmlText, source = {}) => {
  const opportunities = [];
  if (!htmlText || typeof htmlText !== 'string') return opportunities;

  const scriptMatches = htmlText.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  for (const scriptTag of scriptMatches) {
    try {
      const jsonContent = scriptTag.replace(/<script\b[^>]*>|<\/script>/gi, '').trim();
      const parsed = JSON.parse(jsonContent);
      const items = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed];

      for (const item of items) {
        const itemType = (item['@type'] || '').toLowerCase();
        if (
          itemType.includes('course') ||
          itemType.includes('event') ||
          itemType.includes('jobposting') ||
          itemType.includes('grant') ||
          itemType.includes('educational') ||
          itemType.includes('specialannouncement')
        ) {
          const title = stripHtml(item.name || item.title || item.headline);
          const description = stripHtml(item.description || item.articleBody || title);
          const appUrl = item.url || item.sameAs || source.websiteUrl;
          const deadlineStr = item.validThrough || item.endDate || item.expires;
          const deadline = deadlineStr ? new Date(deadlineStr) : null;

          if (title && appUrl) {
            const detectedType = normalizeOpportunityType(`${title} ${itemType}`);

            opportunities.push({
              title,
              description,
              organization: item.hiringOrganization?.name || item.provider?.name || item.organizer?.name || source.name,
              applicationUrl: appUrl,
              sourceUrl: appUrl,
              deadline: deadline && !isNaN(deadline.getTime()) ? deadline : undefined,
              type: detectedType,
              country: normalizeCountry(item.jobLocation?.address?.addressCountry || source.defaultCountry),
              datePublished: item.datePosted ? new Date(item.datePosted) : new Date(),
            });
          }
        }
      }
    } catch (e) {
      // Ignore invalid JSON-LD blocks
    }
  }

  return opportunities;
};
