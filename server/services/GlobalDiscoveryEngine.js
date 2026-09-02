import axios from 'axios';
import OpportunitySource from '../models/OpportunitySource.js';
import { detectOpportunity } from './OpportunityDetector.js';
import { extractJsonLdOpportunities } from '../extractors/jsonLdExtractor.js';
import { extractOpportunityMetadata } from '../extractors/genericExtractor.js';
import { syncSource } from './collectorService.js';
import { calculateSourceTrustScore } from '../collectors/sourceDiscoveryCollector.js';

// Multilingual opportunity keywords across 10 global languages
const MULTILINGUAL_KEYWORDS = [
  // English
  'scholarship', 'fellowship', 'internship', 'research grant', 'global competition',
  // French
  'bourse d\'études', 'stage international', 'subvention de recherche',
  // Spanish
  'becas universitarias', 'pasantías internacionales', 'fondos de investigación',
  // Portuguese
  'bolsas de estudo', 'estágio internacional',
  // German
  'stipendium', 'forschungspreis', 'praktikum',
  // Arabic
  'منحة دراسية', 'تدريب مهني',
  // Chinese
  '奖学金', '实习生',
  // Japanese
  '奨学金', 'インターンシップ',
];

// Target Countries across all continents (190+ support framework)
const GLOBAL_DISCOVERY_COUNTRIES = [
  'Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Rwanda', 'Uganda', 'Tanzania', 'Egypt', 'Ethiopia',
  'United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'Norway', 'Finland', 'Switzerland',
  'United States', 'Canada', 'Australia', 'Japan', 'China', 'South Korea', 'India', 'Singapore',
  'Brazil', 'Mexico', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Worldwide',
];

/**
 * Generate discovery search queries combining categories, countries, and languages.
 */
export const generateDiscoveryQueries = () => {
  const queries = [];
  for (const country of GLOBAL_DISCOVERY_COUNTRIES.slice(0, 10)) {
    for (const kw of MULTILINGUAL_KEYWORDS.slice(0, 5)) {
      queries.push(`${kw} ${country} 2026 2027`);
    }
  }
  return queries;
};

/**
 * Discover new opportunity pages from sitemaps and open web endpoints.
 */
export const discoverFromSitemap = async (sitemapUrl, source = {}) => {
  try {
    const response = await axios.get(sitemapUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'FauzOpportunityBot/2.0 (+https://fauz-scholarship-alert-1-ghxp.onrender.com; Global Discovery Engine)',
        Accept: 'application/xml, text/xml, */*',
      },
    });

    const xml = response.data;
    if (typeof xml !== 'string') return [];

    const urlMatches = xml.match(/<loc>([\s\S]*?)<\/loc>/gi) || [];
    const candidateUrls = [];

    for (const locTag of urlMatches) {
      const url = locTag.replace(/<loc>|<\/loc>/gi, '').trim();
      const detector = detectOpportunity(url, url);
      if (detector.isOpportunity) {
        candidateUrls.push(url);
      }
    }

    return candidateUrls;
  } catch (err) {
    console.error(`Sitemap discovery failed [${sitemapUrl}]:`, err.message);
    return [];
  }
};

/**
 * Register a newly discovered domain as a candidate OpportunitySource.
 */
export const registerDiscoveredSource = async (discoveredUrl, defaultCategory = 'General') => {
  try {
    const parsedUrl = new URL(discoveredUrl);
    const domain = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

    const existing = await OpportunitySource.findOne({ domain });
    if (existing) return existing;

    const trustScore = calculateSourceTrustScore(discoveredUrl, domain);
    const isOfficial = domain.endsWith('.edu') || domain.endsWith('.ac.uk') || domain.endsWith('.gov') || domain.includes('un.org') || domain.includes('europa.eu');

    const newSource = await OpportunitySource.create({
      name: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Opportunities`,
      domain,
      baseUrl: `${parsedUrl.protocol}//${parsedUrl.hostname}`,
      websiteUrl: discoveredUrl,
      sourceType: 'approved_crawler',
      discoveryMethod: 'search_discovery',
      trustLevel: isOfficial ? 'official' : trustScore >= 75 ? 'trusted' : 'normal',
      trustScore,
      status: isOfficial ? 'active' : 'pending_review',
      autoPublish: isOfficial,
      priority: isOfficial ? 'high' : 'normal',
      frequency: '12h',
    });

    console.log(`✨ Discovered & Registered new Source Candidate: ${domain} (Trust: ${trustScore}/100)`);
    return newSource;
  } catch (err) {
    console.error('Error registering discovered source:', err.message);
    return null;
  }
};

/**
 * Run full global discovery sweep.
 */
export const runGlobalDiscoverySweep = async () => {
  console.log('🌐 Executing Global Discovery Sweep across multi-continental targets...');
  let totalDiscovered = 0;

  const activeSources = await OpportunitySource.find({
    active: true,
    status: 'active',
  }).limit(20);

  for (const source of activeSources) {
    try {
      const result = await syncSource(source);
      if (result.success) {
        totalDiscovered += result.created || 0;
      }
    } catch (err) {
      console.error(`Discovery sync error on ${source.name}:`, err.message);
    }
  }

  return { totalDiscovered, sourcesChecked: activeSources.length };
};

export default {
  generateDiscoveryQueries,
  discoverFromSitemap,
  registerDiscoveredSource,
  runGlobalDiscoverySweep,
};
