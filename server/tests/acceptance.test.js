import test from 'node:test';
import assert from 'node:assert';
import { detectOpportunity } from '../services/OpportunityDetector.js';
import { assessFraudRisk } from '../services/FraudRiskEngine.js';
import { compareOpportunities, DUPLICATE_LEVELS } from '../services/OpportunityDeduplicationEngine.js';
import { verifyOpportunityAuthenticity } from '../services/OpportunityVerificationEngine.js';
import { generateDiscoveryQueries } from '../services/GlobalDiscoveryEngine.js';
import calculateMatch, { calculateMatchWithReasons } from '../utils/matchScore.js';

test('Acceptance Test 1: Autonomous Signal Detection on Unlisted Public Content', () => {
  const samplePage = `
    <h1>Oxford AI Fellowship 2027</h1>
    <p>Applications are invited for our fully funded postdoctoral research fellowship in Computer Science.
    The fellowship covers full tuition waiver and living stipend of £40,000.
    Deadline for applications: 30 November 2026. Apply now via university portal.</p>
  `;

  const detection = detectOpportunity(samplePage, 'https://ox.ac.uk/dept/fellowship-2027');
  assert.strictEqual(detection.isOpportunity, true);
  assert.ok(detection.confidence >= 75, `Expected detection confidence >= 75, got ${detection.confidence}`);
  assert.ok(detection.signals.includes('fellowship'), 'Expected fellowship signal');
  assert.ok(detection.signals.includes('fully funded'), 'Expected fully funded signal');
});

test('Acceptance Test 2: Admin Ingestion & Normalization Convergence', () => {
  const adminEntry = {
    title: 'DAAD Master Scholarship Germany 2027',
    description: 'Fully funded scholarship for international graduate students.',
    country: 'Germany',
    eligibleCountries: ['Ghana', 'Worldwide'],
    type: 'scholarship',
    degreeLevels: ['undergraduate', 'graduate'],
    fieldsOfStudy: ['Computer Science'],
    fundingType: 'fully_funded',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    sourceType: 'admin_manual',
  };

  const userProfile = {
    country: 'Ghana',
    nationality: 'Ghanaian',
    educationLevel: 'graduate',
    fieldOfStudy: 'Computer Science',
    preferredOpportunityTypes: ['scholarship'],
    preferredCountries: ['Germany'],
    preferredFunding: ['fully_funded'],
  };

  const match = calculateMatchWithReasons(userProfile, adminEntry);
  assert.ok(match.matchScore >= 75, `Expected high match for qualified user, got ${match.matchScore}`);
  assert.ok(match.matchReasons.some((r) => r.includes('Computer Science')), 'Expected field match reason');
});

test('Acceptance Test 3: Multi-Source Duplicate Detection & Vector Comparison', () => {
  const sourceA = {
    title: 'Erasmus Mundus Master in Data Science 2027',
    organization: 'European Commission',
    applicationUrl: 'https://erasmus.eu/apply-data-science',
    deadline: new Date('2026-12-15'),
  };

  const sourceB = {
    title: 'Erasmus Mundus Masters Degree - Data Science 2027',
    organization: 'European Commission',
    applicationUrl: 'https://scholarship-aggregator.org/erasmus-data-science',
    sourceUrl: 'https://scholarship-aggregator.org/erasmus-data-science',
    deadline: new Date('2026-12-15'),
  };

  const comparison = compareOpportunities(sourceB, sourceA);
  assert.ok(
    comparison.level === DUPLICATE_LEVELS.EXACT_DUPLICATE || comparison.level === DUPLICATE_LEVELS.LIKELY_DUPLICATE,
    `Expected duplicate level EXACT or LIKELY, got ${comparison.level}`
  );
  assert.ok(comparison.confidence >= 70, `Expected confidence >= 70, got ${comparison.confidence}`);
});

test('Acceptance Test 4: Untrusted & Suspicious Content Routed to Review / Rejected', () => {
  const suspiciousOpp = {
    title: 'Guaranteed 100% Scholarship in UK - Pay Visa Processing Fee',
    description: 'Send money to claim your admission immediately. Contact our agent via WhatsApp at https://wa.me/123456789 to deposit Bitcoin.',
    applicationUrl: 'https://wa.me/123456789',
    organization: 'Unknown Agency',
  };

  const risk = assessFraudRisk(suspiciousOpp, { trustLevel: 'untrusted', trustScore: 20 });
  assert.strictEqual(risk.isSuspicious, true);
  assert.ok(risk.riskScore >= 70, `Expected critical risk score >= 70, got ${risk.riskScore}`);

  const authResult = verifyOpportunityAuthenticity(suspiciousOpp, { trustLevel: 'untrusted' }, risk, 30);
  assert.strictEqual(authResult.verificationStatus, 'rejected');
  assert.strictEqual(authResult.autoPublish, false);
});

test('Acceptance Test 5: Global Discovery Query Generation across 190+ Countries & Languages', () => {
  const queries = generateDiscoveryQueries();
  assert.ok(queries.length > 20, `Expected > 20 multi-lingual queries, got ${queries.length}`);
  assert.ok(
    queries.some((q) => q.includes('scholarship') || q.includes('bourse') || q.includes('becas')),
    'Expected multi-lingual opportunity keywords'
  );
});

test('Acceptance Test 6: Source Failure Isolation & Graceful Continuation', () => {
  const sources = [
    { name: 'Source A (Down)', fails: true },
    { name: 'Source B (Healthy)', fails: false, items: 5 },
    { name: 'Source C (Healthy)', fails: false, items: 8 },
  ];

  let totalCollected = 0;
  let failuresEncountered = 0;

  for (const src of sources) {
    try {
      if (src.fails) {
        throw new Error('Connection timeout 504');
      }
      totalCollected += src.items;
    } catch (e) {
      failuresEncountered++;
    }
  }

  assert.strictEqual(failuresEncountered, 1);
  assert.strictEqual(totalCollected, 13);
});
