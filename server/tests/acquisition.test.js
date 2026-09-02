import test from 'node:test';
import assert from 'node:assert';
import { extractOpportunityMetadata, extractDeadline } from '../extractors/genericExtractor.js';
import { extractJsonLdOpportunities } from '../extractors/jsonLdExtractor.js';
import { calculateSourceTrustScore } from '../collectors/sourceDiscoveryCollector.js';
import { calculateQualityScore, detectSpamOrFraud } from '../services/qualityService.js';
import { normalizeUrl, calculateTextSimilarity } from '../services/duplicateService.js';

test('Generic Extractor - Metadata inference and Deadline extraction', () => {
  const rawItem = {
    title: 'Fully Funded Master Scholarship in Artificial Intelligence 2027',
    description: 'We offer a full tuition waiver and monthly stipend. Application deadline: 15 December 2026. Join us in Oxford.',
    url: 'https://oxford.ac.uk/apply-ai-2027',
    country: 'United Kingdom',
  };

  const extracted = extractOpportunityMetadata(rawItem, { name: 'University of Oxford', defaultCountry: 'United Kingdom' });

  assert.strictEqual(extracted.title, 'Fully Funded Master Scholarship in Artificial Intelligence 2027');
  assert.strictEqual(extracted.type, 'scholarship');
  assert.strictEqual(extracted.fundingType, 'fully_funded');
  assert.ok(extracted.degreeLevels.includes('graduate'), 'Expected graduate degree level');
  assert.ok(extracted.deadline instanceof Date, 'Expected valid Date instance');
  assert.strictEqual(extracted.deadline.getFullYear(), 2026);
  assert.strictEqual(extracted.deadline.getMonth(), 11); // December (0-indexed 11)
  assert.strictEqual(extracted.deadline.getDate(), 15);
  assert.ok(extracted.classificationConfidence >= 80, `Expected confidence >= 80, got ${extracted.classificationConfidence}`);
});

test('JSON-LD Schema.org Extractor - Structured Course/JobPosting Parsing', () => {
  const sampleHtml = `
  <html>
    <head>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": "Summer Machine Learning Research Internship",
        "description": "Join our AI research team for a fully funded summer internship in Munich.",
        "validThrough": "2026-11-30T23:59:59Z",
        "hiringOrganization": {
          "@type": "Organization",
          "name": "Max Planck Institute"
        },
        "url": "https://mpg.de/internships/ml-2026",
        "jobLocation": {
          "@type": "Place",
          "address": {
            "addressCountry": "DE"
          }
        }
      }
      </script>
    </head>
  </html>
  `;

  const extracted = extractJsonLdOpportunities(sampleHtml, { defaultCountry: 'Germany' });
  assert.strictEqual(extracted.length, 1);
  assert.strictEqual(extracted[0].title, 'Summer Machine Learning Research Internship');
  assert.strictEqual(extracted[0].organization, 'Max Planck Institute');
  assert.strictEqual(extracted[0].country, 'Germany');
  assert.strictEqual(extracted[0].type, 'internship');
  assert.strictEqual(extracted[0].deadline.getFullYear(), 2026);
});

test('Source Discovery - Trust Score Calculation', () => {
  const eduScore = calculateSourceTrustScore('https://cambridge.ac.uk/scholarships', 'Cambridge University');
  const govScore = calculateSourceTrustScore('https://education.gov.za/bursaries', 'Department of Education');
  const unScore = calculateSourceTrustScore('https://un.org/careers', 'UN Careers');
  const genericScore = calculateSourceTrustScore('https://random-opportunity-site.xyz/feed', 'Random Site');

  assert.ok(eduScore >= 85, `Expected .ac.uk score >= 85, got ${eduScore}`);
  assert.ok(govScore >= 90, `Expected .gov score >= 90, got ${govScore}`);
  assert.ok(unScore >= 95, `Expected un.org score >= 95, got ${unScore}`);
  assert.ok(genericScore < 75, `Expected generic site score < 75, got ${genericScore}`);
});

test('Quality Service - Scoring & Spam Detection', () => {
  const validOpp = {
    title: 'Chevening Masters Scholarship 2027',
    description: 'Fully funded scholarship in the UK covering flights, accommodation, and full tuition fees. Applicants must hold an undergraduate degree.',
    applicationUrl: 'https://chevening.org/apply',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    organization: 'UK Foreign, Commonwealth & Development Office',
    degreeLevels: ['graduate'],
    fieldsOfStudy: ['All Fields'],
  };

  const quality = calculateQualityScore(validOpp, { trustScore: 98 });
  assert.ok(quality >= 85, `Expected quality >= 85, got ${quality}`);

  const scamOpp = {
    title: 'Guaranteed 100% Scholarship',
    description: 'Send money to claim your visa and scholarship immediately.',
    applicationUrl: 'https://wa.me/123456789',
  };

  const spamCheck = detectSpamOrFraud(scamOpp);
  assert.strictEqual(spamCheck.isSpam, true);
});
