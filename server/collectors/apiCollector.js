import axios from 'axios';
import { extractOpportunityMetadata } from '../extractors/genericExtractor.js';

/**
 * Collect opportunities from a REST API endpoint.
 */
export const collectFromApi = async (source) => {
  if (!source.apiEndpoint) {
    throw new Error(`Source ${source.name} is missing apiEndpoint`);
  }

  const response = await axios.get(source.apiEndpoint, {
    timeout: 18000,
    headers: {
      'User-Agent': 'FauzOpportunityBot/2.0 (+https://fauz-scholarship-alert-1-ghxp.onrender.com; Global Opportunity Aggregator)',
      Accept: 'application/json',
    },
  });

  let rawList = [];
  if (Array.isArray(response.data)) {
    rawList = response.data;
  } else if (response.data && typeof response.data === 'object') {
    rawList =
      response.data.opportunities ||
      response.data.items ||
      response.data.results ||
      response.data.data ||
      [response.data];
  }

  const opportunities = rawList.map((item) => extractOpportunityMetadata(item, source));

  return {
    rawPayload: response.data,
    opportunities,
  };
};
