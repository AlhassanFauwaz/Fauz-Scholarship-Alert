import axios from 'axios';
import OpportunitySource from '../models/OpportunitySource.js';

/**
 * Known legitimate global institutional discovery targets to monitor for new feeds and sub-portals.
 */
const GLOBAL_DISCOVERY_TARGETS = [
  // Africa
  {
    name: 'Association of African Universities (AAU)',
    url: 'https://aau.org/',
    category: 'university',
    region: 'Africa',
    country: 'Ghana',
  },
  {
    name: 'African Development Bank Careers & Fellowships',
    url: 'https://www.afdb.org/en/about-us/careers',
    category: 'international_org',
    region: 'Africa',
    country: 'Worldwide',
  },
  {
    name: 'African Union Commission Youth & Scholarships',
    url: 'https://au.int/en/scholarships',
    category: 'government',
    region: 'Africa',
    country: 'Worldwide',
  },
  {
    name: 'RUFORUM African Universities Grants',
    url: 'https://www.ruforum.org/',
    category: 'university',
    region: 'Africa',
    country: 'Uganda',
  },
  // Europe
  {
    name: 'European Research Council (ERC) Grants',
    url: 'https://erc.europa.eu/funding',
    category: 'research_institution',
    region: 'Europe',
    country: 'Europe',
  },
  {
    name: 'Campus France International Scholarships',
    url: 'https://www.campusfrance.org/en/bursaries-foreign-students',
    category: 'government',
    region: 'Europe',
    country: 'France',
  },
  {
    name: 'Swedish Institute Scholarships',
    url: 'https://si.se/en/apply/scholarships/',
    category: 'government',
    region: 'Europe',
    country: 'Sweden',
  },
  {
    name: 'Swiss Government Excellence Scholarships',
    url: 'https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html',
    category: 'government',
    region: 'Europe',
    country: 'Switzerland',
  },
  // Americas
  {
    name: 'Organization of American States (OAS) Scholarships',
    url: 'http://www.oas.org/en/scholarships/',
    category: 'international_org',
    region: 'North America',
    country: 'Worldwide',
  },
  {
    name: 'Fulbright Foreign Student Program',
    url: 'https://foreign.fulbrightonline.org/',
    category: 'government',
    region: 'North America',
    country: 'United States',
  },
  {
    name: 'Mitacs Globalink Research Internships Canada',
    url: 'https://www.mitacs.ca/our-programs/globalink-research-internship-students/',
    category: 'research_institution',
    region: 'North America',
    country: 'Canada',
  },
  // Asia & Oceania
  {
    name: 'Australia Awards Scholarships',
    url: 'https://www.dfat.gov.au/people-to-people/australia-awards',
    category: 'government',
    region: 'Oceania',
    country: 'Australia',
  },
  {
    name: 'MEXT Japan Government Scholarships',
    url: 'https://www.studyinjapan.go.jp/en/planning/scholarship/',
    category: 'government',
    region: 'Asia',
    country: 'Japan',
  },
  {
    name: 'Chinese Government Scholarship Council',
    url: 'http://www.campuschina.org/',
    category: 'government',
    region: 'Asia',
    country: 'China',
  },
];

/**
 * Calculate trust score for a candidate source based on domain and characteristics.
 */
export const calculateSourceTrustScore = (url, name) => {
  let score = 65;
  const lowerUrl = (url || '').toLowerCase();

  if (lowerUrl.includes('.gov') || lowerUrl.includes('.go.') || lowerUrl.includes('admin.ch')) score += 25;
  if (lowerUrl.includes('.edu') || lowerUrl.includes('.ac.') || lowerUrl.includes('.edu.')) score += 20;
  if (lowerUrl.includes('.org') || lowerUrl.includes('.eu') || lowerUrl.includes('.int')) score += 15;
  if (lowerUrl.startsWith('https://')) score += 5;
  if (lowerUrl.includes('un.org') || lowerUrl.includes('europa.eu') || lowerUrl.includes('worldbank.org')) score += 20;

  return Math.min(score, 100);
};

/**
 * Run source discovery scan across target catalogs.
 */
export const runSourceDiscovery = async () => {
  console.log('🔍 Running automated global source discovery...');
  let discoveredCount = 0;

  for (const target of GLOBAL_DISCOVERY_TARGETS) {
    try {
      const existing = await OpportunitySource.findOne({
        $or: [{ websiteUrl: target.url }, { name: target.name }],
      });

      if (!existing) {
        const trustScore = calculateSourceTrustScore(target.url, target.name);
        const autoApprove = trustScore >= 90;

        await OpportunitySource.create({
          name: target.name,
          websiteUrl: target.url,
          sourceType: 'approved_crawler',
          sourceCategory: target.category,
          region: target.region,
          defaultCountry: target.country,
          discoveryMethod: 'crawled',
          trustScore,
          active: true,
          autoPublish: autoApprove,
          status: autoApprove ? 'active' : 'pending_review',
          frequency: '12h',
        });
        discoveredCount++;
      }
    } catch (err) {
      console.error(`Source discovery check error [${target.name}]:`, err.message);
    }
  }

  console.log(`✅ Source discovery completed. Discovered ${discoveredCount} new candidate sources.`);
  return { discoveredCount };
};
