import axios from 'axios';
import { extractJsonLdOpportunities } from '../extractors/jsonLdExtractor.js';
import { extractOpportunityMetadata, stripHtml } from '../extractors/genericExtractor.js';

/**
 * Extract OpenGraph and HTML meta tags from HTML.
 */
const extractOpenGraphMetadata = (htmlText, sourceUrl) => {
  const ogTitleMatch = htmlText.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const ogDescMatch = htmlText.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
    htmlText.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const ogImageMatch = htmlText.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

  const title = ogTitleMatch ? stripHtml(ogTitleMatch[1]) : '';
  const description = ogDescMatch ? stripHtml(ogDescMatch[1]) : '';
  const image = ogImageMatch ? ogImageMatch[1] : '';

  if (!title) return null;

  return {
    title,
    description,
    image,
    applicationUrl: sourceUrl,
    sourceUrl,
  };
};

/**
 * Collect opportunities from an approved institutional website.
 */
export const collectFromWebsite = async (source) => {
  if (!source.websiteUrl) {
    throw new Error(`Source ${source.name} is missing websiteUrl`);
  }

  const response = await axios.get(source.websiteUrl, {
    timeout: 20000,
    headers: {
      'User-Agent': 'FauzOpportunityBot/2.0 (+https://fauz-scholarship-alert-1-ghxp.onrender.com; Global Opportunity Aggregator)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  const html = response.data;
  let candidates = extractJsonLdOpportunities(html, source);

  if (candidates.length === 0) {
    const ogData = extractOpenGraphMetadata(html, source.websiteUrl);
    if (ogData) {
      candidates.push(ogData);
    }
  }

  const opportunities = candidates.map((item) => extractOpportunityMetadata(item, source));

  return {
    rawPayload: typeof html === 'string' ? html.substring(0, 10000) : '',
    opportunities,
  };
};
