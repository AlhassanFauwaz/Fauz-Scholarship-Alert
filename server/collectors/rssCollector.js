import axios from 'axios';
import { parseXmlFeed } from '../services/collectorService.js';
import { extractOpportunityMetadata } from '../extractors/genericExtractor.js';

/**
 * Collect opportunities from an RSS/Atom/XML feed.
 */
export const collectFromRss = async (source) => {
  if (!source.rssUrl) {
    throw new Error(`Source ${source.name} is missing rssUrl`);
  }

  const response = await axios.get(source.rssUrl, {
    timeout: 18000,
    headers: {
      'User-Agent': 'FauzOpportunityBot/2.0 (+https://fauz-scholarship-alert-1-ghxp.onrender.com; Global Opportunity Aggregator)',
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
  });

  const parsedItems = parseXmlFeed(response.data, source);
  const opportunities = parsedItems.map((item) => extractOpportunityMetadata(item, source));

  return {
    rawPayload: response.data,
    opportunities,
  };
};
