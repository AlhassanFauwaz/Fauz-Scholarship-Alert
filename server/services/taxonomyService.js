/**
 * Controlled taxonomies and normalization utilities for global opportunities.
 */

// Controlled Countries and Common Aliases
const COUNTRY_ALIASES = {
  ghana: 'Ghana',
  gh: 'Ghana',
  ghanaian: 'Ghana',
  nigeria: 'Nigeria',
  ng: 'Nigeria',
  nigerian: 'Nigeria',
  kenya: 'Kenya',
  ke: 'Kenya',
  kenyan: 'Kenya',
  'united states': 'United States',
  usa: 'United States',
  us: 'United States',
  american: 'United States',
  'united kingdom': 'United Kingdom',
  uk: 'United Kingdom',
  british: 'United Kingdom',
  canada: 'Canada',
  ca: 'Canada',
  canadian: 'Canada',
  germany: 'Germany',
  de: 'Germany',
  german: 'Germany',
  france: 'France',
  fr: 'France',
  french: 'France',
  australia: 'Australia',
  au: 'Australia',
  australian: 'Australia',
  japan: 'Japan',
  jp: 'Japan',
  japanese: 'Japan',
  china: 'China',
  cn: 'China',
  chinese: 'China',
  india: 'India',
  in: 'India',
  indian: 'India',
  'south africa': 'South Africa',
  za: 'South Africa',
  rwanda: 'Rwanda',
  rw: 'Rwanda',
  rwandan: 'Rwanda',
  uganda: 'Uganda',
  ug: 'Uganda',
  ugandan: 'Uganda',
  worldwide: 'Worldwide',
  global: 'Worldwide',
  international: 'Worldwide',
  all: 'Worldwide',
  any: 'Worldwide',
};

// Controlled Fields of Study
const FIELD_ALIASES = {
  'computer science': 'Computer Science',
  'computer sciences': 'Computer Science',
  computing: 'Computer Science',
  'software engineering': 'Software Engineering',
  'information technology': 'Information Technology',
  it: 'Information Technology',
  'data science': 'Data Science',
  'artificial intelligence': 'Artificial Intelligence',
  ai: 'Artificial Intelligence',
  engineering: 'Engineering',
  'electrical engineering': 'Electrical Engineering',
  'mechanical engineering': 'Mechanical Engineering',
  'civil engineering': 'Civil Engineering',
  medicine: 'Medicine',
  'medical sciences': 'Medicine',
  'public health': 'Public Health',
  health: 'Public Health',
  nursing: 'Nursing',
  pharmacy: 'Pharmacy',
  business: 'Business & Administration',
  'business administration': 'Business & Administration',
  mba: 'Business & Administration',
  finance: 'Finance & Economics',
  economics: 'Finance & Economics',
  law: 'Law & Legal Studies',
  'legal studies': 'Law & Legal Studies',
  education: 'Education & Teaching',
  teaching: 'Education & Teaching',
  agriculture: 'Agriculture & Environmental Sciences',
  'environmental science': 'Agriculture & Environmental Sciences',
  'social sciences': 'Social Sciences',
  humanities: 'Humanities & Arts',
  arts: 'Humanities & Arts',
  science: 'Natural Sciences',
  'natural sciences': 'Natural Sciences',
};

// Controlled Degree Levels
const DEGREE_ALIASES = {
  highschool: 'highschool',
  'high school': 'highschool',
  secondary: 'highschool',
  diploma: 'diploma',
  certificate: 'diploma',
  associate: 'diploma',
  undergraduate: 'undergraduate',
  bachelor: 'undergraduate',
  bachelors: 'undergraduate',
  bsc: 'undergraduate',
  ba: 'undergraduate',
  graduate: 'graduate',
  masters: 'graduate',
  master: 'graduate',
  msc: 'graduate',
  ma: 'graduate',
  mphil: 'mphil',
  phd: 'phd',
  doctorate: 'phd',
  doctoral: 'phd',
  postdoctoral: 'postdoctoral',
  postdoc: 'postdoctoral',
  professional: 'professional',
};

// Controlled Opportunity Types
export const OPPORTUNITY_TYPES = [
  'scholarship',
  'internship',
  'grant',
  'fellowship',
  'job',
  'research',
  'training',
  'competition',
  'exchange',
  'graduate_programme',
  'volunteer',
  'conference',
  'entrepreneurship',
  'funding',
  'other',
];

// Controlled Funding Types
export const FUNDING_TYPES = [
  'fully_funded',
  'partially_funded',
  'tuition_only',
  'stipend',
  'no_funding',
  'paid',
  'unpaid',
  'other',
];

export const REGIONS = [
  'Africa',
  'Europe',
  'North America',
  'South America',
  'Asia',
  'Oceania',
  'Middle East',
  'Worldwide',
];

export const normalizeCountry = (countryInput) => {
  if (!countryInput || typeof countryInput !== 'string') return 'Worldwide';
  const clean = countryInput.trim().toLowerCase();
  if (COUNTRY_ALIASES[clean]) return COUNTRY_ALIASES[clean];
  // Capitalize words
  return countryInput
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export const normalizeFieldOfStudy = (fieldInput) => {
  if (!fieldInput || typeof fieldInput !== 'string') return 'General';
  const clean = fieldInput.trim().toLowerCase();
  if (FIELD_ALIASES[clean]) return FIELD_ALIASES[clean];
  return fieldInput.trim();
};

export const normalizeDegreeLevel = (levelInput) => {
  if (!levelInput || typeof levelInput !== 'string') return 'undergraduate';
  const clean = levelInput.trim().toLowerCase();
  if (DEGREE_ALIASES[clean]) return DEGREE_ALIASES[clean];
  return 'undergraduate';
};

export const normalizeFundingType = (fundingInput) => {
  if (!fundingInput || typeof fundingInput !== 'string') return 'other';
  const clean = fundingInput.trim().toLowerCase().replace(/[\s-]/g, '_');
  if (FUNDING_TYPES.includes(clean)) return clean;
  if (clean.includes('full') || clean.includes('100%')) return 'fully_funded';
  if (clean.includes('partial') || clean.includes('50%')) return 'partially_funded';
  if (clean.includes('tuition')) return 'tuition_only';
  if (clean.includes('stipend') || clean.includes('allowance')) return 'stipend';
  if (clean.includes('paid') || clean.includes('salary')) return 'paid';
  return 'other';
};

export const normalizeOpportunityType = (typeInput) => {
  if (!typeInput || typeof typeInput !== 'string') return 'scholarship';
  const clean = typeInput.trim().toLowerCase().replace(/[\s-]/g, '_');
  if (OPPORTUNITY_TYPES.includes(clean)) return clean;
  if (clean.includes('intern')) return 'internship';
  if (clean.includes('fellow')) return 'fellowship';
  if (clean.includes('grant')) return 'grant';
  if (clean.includes('job') || clean.includes('career') || clean.includes('employment')) return 'job';
  if (clean.includes('research')) return 'research';
  if (clean.includes('train') || clean.includes('course') || clean.includes('workshop')) return 'training';
  if (clean.includes('compet') || clean.includes('contest') || clean.includes('hackathon')) return 'competition';
  if (clean.includes('exchange')) return 'exchange';
  if (clean.includes('graduate')) return 'graduate_programme';
  if (clean.includes('volunteer')) return 'volunteer';
  if (clean.includes('conf') || clean.includes('event') || clean.includes('summit')) return 'conference';
  if (clean.includes('entrepreneur') || clean.includes('startup')) return 'entrepreneurship';
  if (clean.includes('fund')) return 'funding';
  if (clean.includes('scholar')) return 'scholarship';
  return 'other';
};
