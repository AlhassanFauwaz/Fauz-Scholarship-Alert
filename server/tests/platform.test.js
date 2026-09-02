import test from 'node:test';
import assert from 'node:assert';
import {
  normalizeCountry,
  normalizeFieldOfStudy,
  normalizeDegreeLevel,
  normalizeFundingType,
  normalizeOpportunityType,
} from '../services/taxonomyService.js';
import { calculateTextSimilarity, normalizeUrl } from '../services/duplicateService.js';
import calculateMatch, { calculateMatchWithReasons } from '../utils/matchScore.js';
import { parseXmlFeed } from '../services/collectorService.js';

test('Taxonomy Normalization - Countries, Fields, Degrees, Funding', () => {
  assert.strictEqual(normalizeCountry('GH'), 'Ghana');
  assert.strictEqual(normalizeCountry('ghanaian'), 'Ghana');
  assert.strictEqual(normalizeCountry('USA'), 'United States');
  assert.strictEqual(normalizeCountry('uk'), 'United Kingdom');
  assert.strictEqual(normalizeCountry('Worldwide'), 'Worldwide');

  assert.strictEqual(normalizeFieldOfStudy('Computing'), 'Computer Science');
  assert.strictEqual(normalizeFieldOfStudy('Software Engineering'), 'Software Engineering');
  assert.strictEqual(normalizeFieldOfStudy('Public Health'), 'Public Health');

  assert.strictEqual(normalizeDegreeLevel('MSc'), 'graduate');
  assert.strictEqual(normalizeDegreeLevel('PhD'), 'phd');
  assert.strictEqual(normalizeDegreeLevel('Bachelor'), 'undergraduate');

  assert.strictEqual(normalizeFundingType('Fully Funded 100%'), 'fully_funded');
  assert.strictEqual(normalizeFundingType('Tuition waiver only'), 'tuition_only');
  assert.strictEqual(normalizeFundingType('Monthly stipend'), 'stipend');

  assert.strictEqual(normalizeOpportunityType('Software Internship'), 'internship');
  assert.strictEqual(normalizeOpportunityType('Research Fellowship 2026'), 'fellowship');
  assert.strictEqual(normalizeOpportunityType('Innovation Grant'), 'grant');
});

test('Duplicate Service - URL normalization and Similarity calculation', () => {
  const url1 = 'https://www.example.com/scholarship-2026/?utm_source=twitter&utm_medium=social';
  const url2 = 'http://example.com/scholarship-2026';
  assert.strictEqual(normalizeUrl(url1), normalizeUrl(url2));

  const sim1 = calculateTextSimilarity(
    'Fully Funded Master Scholarship in Canada 2026',
    'Fully Funded Masters Scholarship in Canada 2026'
  );
  assert.ok(sim1 >= 0.75, `Expected similarity >= 0.75, got ${sim1}`);

  const sim2 = calculateTextSimilarity(
    'Computer Science Internship in Germany',
    'Medical Doctor Residency Fellowship in Australia'
  );
  assert.ok(sim2 < 0.3, `Expected low similarity, got ${sim2}`);
});

test('Recommendation Engine - Multi-criterion Match Scoring with Explanations', () => {
  const itStudentProfile = {
    country: 'Ghana',
    nationality: 'Ghanaian',
    educationLevel: 'undergraduate',
    fieldOfStudy: 'Information Technology',
    skills: ['Python', 'SQL', 'Web Development'],
    preferredOpportunityTypes: ['scholarship', 'internship'],
    preferredFunding: ['fully_funded'],
  };

  const medicineStudentProfile = {
    country: 'Nigeria',
    nationality: 'Nigerian',
    educationLevel: 'graduate',
    fieldOfStudy: 'Medicine',
    skills: ['Clinical Research', 'Public Health'],
    preferredOpportunityTypes: ['fellowship', 'grant'],
    preferredFunding: ['fully_funded'],
  };

  const itOpportunity = {
    title: 'Fully Funded MSc in Information Technology 2026',
    type: 'scholarship',
    degreeLevels: ['undergraduate', 'graduate'],
    fieldsOfStudy: ['Information Technology', 'Computer Science'],
    eligibleCountries: ['Ghana', 'Nigeria', 'Worldwide'],
    fundingType: 'fully_funded',
    skills: ['Python', 'Software Engineering'],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const medOpportunity = {
    title: 'Global Health Medical Research Grant 2026',
    type: 'grant',
    degreeLevels: ['graduate', 'phd'],
    fieldsOfStudy: ['Medicine', 'Public Health'],
    eligibleCountries: ['Nigeria', 'Worldwide'],
    fundingType: 'fully_funded',
    skills: ['Clinical Research'],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const itResult = calculateMatchWithReasons(itStudentProfile, itOpportunity);
  const itOnMedResult = calculateMatchWithReasons(itStudentProfile, medOpportunity);
  const medResult = calculateMatchWithReasons(medicineStudentProfile, medOpportunity);

  assert.ok(itResult.matchScore >= 80, `Expected IT student score on IT opp >= 80, got ${itResult.matchScore}`);
  assert.ok(itResult.matchReasons.length > 0, 'Expected match reasons for IT student');
  assert.ok(
    itResult.matchReasons.some((r) => r.includes('Information Technology')),
    'Expected field match reason'
  );

  assert.ok(
    itResult.matchScore > itOnMedResult.matchScore,
    'Expected IT student to match IT opp better than Medical grant'
  );

  assert.ok(medResult.matchScore >= 80, `Expected Medicine student score on Med opp >= 80, got ${medResult.matchScore}`);
  assert.ok(
    medResult.matchScore > calculateMatch(medicineStudentProfile, itOpportunity),
    'Expected Medicine student to match Med opp better than IT opp'
  );
});

test('Collector Service - RSS and Atom XML Parsing', () => {
  const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>Sample Global Scholarships</title>
      <item>
        <title>Fully Funded Master Scholarship in AI</title>
        <link>https://example.org/ai-masters</link>
        <description><![CDATA[Join our fully funded master program. Deadline: 30 November 2026]]></description>
        <pubDate>Mon, 01 Sep 2026 10:00:00 GMT</pubDate>
      </item>
    </channel>
  </rss>`;

  const items = parseXmlFeed(sampleRss, { name: 'Sample' });
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].title, 'Fully Funded Master Scholarship in AI');
  assert.strictEqual(items[0].applicationUrl, 'https://example.org/ai-masters');
  assert.ok(items[0].description.includes('Deadline: 30 November 2026'));
});
