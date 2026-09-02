import Opportunity from '../models/Opportunity.js';
import OpportunitySource from '../models/OpportunitySource.js';
import OpportunityIngestion from '../models/OpportunityIngestion.js';
import { collectFromRss } from '../collectors/rssCollector.js';
import { collectFromApi } from '../collectors/apiCollector.js';
import { collectFromWebsite } from '../collectors/websiteCollector.js';
import { findDuplicate, mergeOpportunityIntoMaster } from './duplicateService.js';
import { calculateQualityScore, detectSpamOrFraud } from './qualityService.js';
import { createNotification } from '../utils/notifications.js';
import User from '../models/User.js';
import calculateMatch from '../utils/matchScore.js';

/**
 * Parse an RSS or Atom XML string into structured opportunity objects.
 */
export const parseXmlFeed = (xmlText, source) => {
  const items = [];
  if (!xmlText || typeof xmlText !== 'string') return items;

  // Handle RSS <item> tags
  const rssItemMatches = xmlText.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const itemXml of rssItemMatches) {
    const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch =
      itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i) ||
      itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const descMatch =
      itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ||
      itemXml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
    const pubDateMatch =
      itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
      itemXml.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);

    const rawTitle = titleMatch ? titleMatch[1] : '';
    const rawLink = linkMatch ? linkMatch[1] : '';
    const rawDesc = descMatch ? descMatch[1] : '';
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')) : new Date();

    if (rawTitle && rawLink) {
      items.push({
        title: rawTitle,
        applicationUrl: rawLink.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        sourceUrl: rawLink.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        description: rawDesc,
        datePublished: isNaN(pubDate.getTime()) ? new Date() : pubDate,
      });
    }
  }

  // Handle Atom <entry> tags if no RSS items found
  if (items.length === 0) {
    const atomEntryMatches = xmlText.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
    for (const entryXml of atomEntryMatches) {
      const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch =
        entryXml.match(/<link[^>]*href=["']([^"']+)["']/i) ||
        entryXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const summaryMatch =
        entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
        entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
      const updatedMatch =
        entryXml.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
        entryXml.match(/<published[^>]*>([\s\S]*?)<\/published>/i);

      const rawTitle = titleMatch ? titleMatch[1] : '';
      const rawLink = linkMatch ? linkMatch[1] : '';
      const rawSummary = summaryMatch ? summaryMatch[1] : '';
      const pubDate = updatedMatch ? new Date(updatedMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')) : new Date();

      if (rawTitle && rawLink) {
        items.push({
          title: rawTitle,
          applicationUrl: rawLink.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
          sourceUrl: rawLink.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
          description: rawSummary || rawTitle,
          datePublished: isNaN(pubDate.getTime()) ? new Date() : pubDate,
        });
      }
    }
  }

  return items;
};

/**
 * Full Ingestion Pipeline for a single OpportunitySource.
 */
export const syncSource = async (source) => {
  const startTime = Date.now();
  console.log(`📡 Ingestion starting for source: ${source.name} [${source.sourceType}]`);

  try {
    let collectionResult;

    if (source.sourceType === 'rss') {
      collectionResult = await collectFromRss(source);
    } else if (source.sourceType === 'api') {
      collectionResult = await collectFromApi(source);
    } else {
      collectionResult = await collectFromWebsite(source);
    }

    const { rawPayload, opportunities: candidateOpportunities } = collectionResult;

    let createdCount = 0;
    let mergedCount = 0;
    let flaggedCount = 0;

    for (const candidate of candidateOpportunities) {
      if (!candidate.title || !candidate.applicationUrl) continue;

      // 1. Log Raw Ingestion Audit Record
      const ingestionRecord = await OpportunityIngestion.create({
        sourceId: source._id,
        sourceName: source.name,
        sourceUrl: candidate.applicationUrl,
        rawTitle: candidate.title,
        rawDescription: candidate.description,
        rawContent: typeof rawPayload === 'string' ? rawPayload.substring(0, 5000) : '',
        processingStatus: 'pending',
      });

      // 2. Spam / Fraud Check
      const fraudCheck = detectSpamOrFraud(candidate);
      if (fraudCheck.isSpam) {
        ingestionRecord.processingStatus = 'rejected';
        ingestionRecord.processingErrors = [fraudCheck.reason];
        await ingestionRecord.save();
        flaggedCount++;
        continue;
      }

      // 3. Duplicate Detection 2.0
      const existingDuplicate = await findDuplicate(candidate);
      if (existingDuplicate) {
        await mergeOpportunityIntoMaster(existingDuplicate, candidate, source);
        ingestionRecord.processingStatus = 'duplicate_merged';
        ingestionRecord.duplicateCandidateId = existingDuplicate._id;
        ingestionRecord.extractedOpportunityId = existingDuplicate._id;
        await ingestionRecord.save();
        mergedCount++;
        continue;
      }

      // 4. Quality Scoring
      const qualityScore = calculateQualityScore(candidate, source);
      candidate.qualityScore = qualityScore;

      // 5. Automatic Publishing vs Verification Queue
      const shouldAutoPublish =
        source.autoPublish ||
        (source.trustScore >= 75 && qualityScore >= 75 && candidate.deadline > new Date());

      candidate.status = 'published';
      candidate.verificationStatus = shouldAutoPublish ? 'verified' : 'pending';

      const createdOpportunity = await Opportunity.create(candidate);
      createdCount++;

      // 6. Update Ingestion Log
      ingestionRecord.processingStatus = 'processed';
      ingestionRecord.qualityScore = qualityScore;
      ingestionRecord.extractedOpportunityId = createdOpportunity._id;
      await ingestionRecord.save();

      // 7. Trigger User Match Notifications
      if (createdOpportunity.verificationStatus === 'verified') {
        triggerMatchNotifications(createdOpportunity).catch((err) =>
          console.error('Match notification error:', err.message)
        );
      }
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[COLLECTOR] Source: ${source.name} | Status: SUCCESS | Found: ${candidateOpportunities.length} | New: ${createdCount} | Merged: ${mergedCount} | Duration: ${durationSeconds}s`
    );

    // Update source health and stats
    source.lastSyncAt = new Date();
    source.lastSuccessAt = new Date();
    source.healthStatus = 'healthy';
    source.lastErrorMessage = '';
    source.consecutiveFailures = 0;
    source.retryCount = 0;
    source.opportunitiesFound = (source.opportunitiesFound || 0) + createdCount;
    await source.save();

    return {
      success: true,
      found: candidateOpportunities.length,
      created: createdCount,
      merged: mergedCount,
      flagged: flaggedCount,
    };
  } catch (error) {
    console.error(`[COLLECTOR] Source: ${source.name} | Status: FAILED | Error: ${error.message}`);
    source.lastSyncAt = new Date();
    source.lastFailureAt = new Date();
    source.lastErrorMessage = error.message;
    source.consecutiveFailures = (source.consecutiveFailures || 0) + 1;
    source.retryCount = (source.retryCount || 0) + 1;
    source.healthStatus = source.consecutiveFailures >= 3 ? 'failed' : 'warning';
    await source.save();
    return { success: false, error: error.message };
  }
};

/**
 * Match a newly discovered opportunity against active registered users and send alerts.
 */
const triggerMatchNotifications = async (opportunity) => {
  const users = await User.find({
    accountStatus: 'active',
    emailVerified: true,
  });

  for (const user of users) {
    if (user.profile && (user.profile.educationLevel || user.profile.fieldOfStudy)) {
      const matchScore = calculateMatch(user.profile, opportunity);
      if (matchScore >= 50) {
        await createNotification({
          user: user._id,
          opportunity: opportunity._id,
          title: `New Matching Opportunity: ${opportunity.title}`,
          message: `A new ${opportunity.type} "${opportunity.title}" matches your profile (${matchScore}% match).`,
          type: 'new_match',
          channel: 'in-app',
        });
      }
    }
  }
};

/**
 * Seed initial real, curated global opportunity feeds across all continents.
 */
export const seedInitialSources = async () => {
  try {
    const existingCount = await OpportunitySource.countDocuments();
    if (existingCount > 0) return;

    console.log('🌱 Seeding verified global opportunity sources across continents...');

    const seedSources = [
      // Europe
      {
        name: 'DAAD Scholarships Database (Germany)',
        websiteUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
        sourceType: 'rss',
        rssUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships/rss/',
        sourceCategory: 'government',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'Academic Excellence',
        defaultCountry: 'Germany',
        region: 'Europe',
        priority: 'high',
        trustScore: 98,
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'Chevening International Scholarships (UK)',
        websiteUrl: 'https://www.chevening.org/scholarships/',
        sourceType: 'rss',
        rssUrl: 'https://www.chevening.org/feed/',
        sourceCategory: 'government',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'Master Degrees',
        defaultCountry: 'United Kingdom',
        region: 'Europe',
        priority: 'high',
        trustScore: 98,
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'Erasmus+ & Erasmus Mundus Masters (EU)',
        websiteUrl: 'https://erasmus-plus.ec.europa.eu/',
        sourceType: 'rss',
        rssUrl: 'https://ec.europa.eu/programmes/erasmus-plus/rss_en.xml',
        sourceCategory: 'international_org',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'European Union Joint Degrees',
        defaultCountry: 'Europe',
        region: 'Europe',
        priority: 'high',
        trustScore: 99,
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'Commonwealth Scholarships Commission',
        websiteUrl: 'https://cscuk.fcdo.gov.uk/scholarships/',
        sourceType: 'rss',
        rssUrl: 'https://cscuk.fcdo.gov.uk/feed/',
        sourceCategory: 'government',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'Commonwealth Development',
        defaultCountry: 'United Kingdom',
        region: 'Europe',
        priority: 'high',
        trustScore: 96,
        frequency: '6h',
        active: true,
        autoPublish: true,
      },

      // Africa
      {
        name: 'Mandela Washington Fellowship for Young African Leaders',
        websiteUrl: 'https://www.mandelawashingtonfellowship.org/',
        sourceType: 'rss',
        rssUrl: 'https://www.mandelawashingtonfellowship.org/feed/',
        sourceCategory: 'foundation',
        defaultOpportunityType: 'fellowship',
        defaultCategory: 'Leadership & Public Service',
        defaultCountry: 'Worldwide',
        region: 'Africa',
        priority: 'high',
        trustScore: 95,
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'African Development Bank Careers & Fellowships',
        websiteUrl: 'https://www.afdb.org/en/about-us/careers',
        sourceType: 'rss',
        rssUrl: 'https://www.afdb.org/en/news-and-events/rss',
        sourceCategory: 'international_org',
        defaultOpportunityType: 'internship',
        defaultCategory: 'Economic Development',
        defaultCountry: 'Worldwide',
        region: 'Africa',
        priority: 'normal',
        trustScore: 94,
        frequency: '12h',
        active: true,
        autoPublish: true,
      },

      // Global & International Organizations
      {
        name: 'World Bank Scholarships & Fellowships',
        websiteUrl: 'https://www.worldbank.org/en/programs/scholarships',
        sourceType: 'rss',
        rssUrl: 'https://www.worldbank.org/en/news/rss',
        sourceCategory: 'international_org',
        defaultOpportunityType: 'grant',
        defaultCategory: 'Development & Economics',
        defaultCountry: 'Worldwide',
        region: 'Worldwide',
        priority: 'high',
        trustScore: 99,
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'United Nations Careers & Internships',
        websiteUrl: 'https://careers.un.org/',
        sourceType: 'rss',
        rssUrl: 'https://www.un.org/press/en/feed',
        sourceCategory: 'international_org',
        defaultOpportunityType: 'internship',
        defaultCategory: 'International Affairs',
        defaultCountry: 'Worldwide',
        region: 'Worldwide',
        priority: 'high',
        trustScore: 99,
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'UNESCO Youth Grants & Competitions',
        websiteUrl: 'https://www.unesco.org/en/youth',
        sourceType: 'rss',
        rssUrl: 'https://en.unesco.org/rss.xml',
        sourceCategory: 'international_org',
        defaultOpportunityType: 'competition',
        defaultCategory: 'Youth & Innovation',
        defaultCountry: 'Worldwide',
        region: 'Worldwide',
        priority: 'normal',
        trustScore: 97,
        frequency: '12h',
        active: true,
        autoPublish: true,
      },

      // North America & Global Tech
      {
        name: 'Fulbright Foreign Student Program',
        websiteUrl: 'https://foreign.fulbrightonline.org/',
        sourceType: 'approved_crawler',
        sourceCategory: 'government',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'Graduate Studies',
        defaultCountry: 'United States',
        region: 'North America',
        priority: 'high',
        trustScore: 98,
        frequency: '12h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'Mitacs Globalink Research Internships (Canada)',
        websiteUrl: 'https://www.mitacs.ca/our-programs/globalink-research-internship-students/',
        sourceType: 'approved_crawler',
        sourceCategory: 'research_institution',
        defaultOpportunityType: 'research',
        defaultCategory: 'STEM & Innovation',
        defaultCountry: 'Canada',
        region: 'North America',
        priority: 'normal',
        trustScore: 96,
        frequency: '12h',
        active: true,
        autoPublish: true,
      },

      // Asia & Oceania
      {
        name: 'Australia Awards Scholarships',
        websiteUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards',
        sourceType: 'approved_crawler',
        sourceCategory: 'government',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'International Development',
        defaultCountry: 'Australia',
        region: 'Oceania',
        priority: 'high',
        trustScore: 97,
        frequency: '12h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'Study in Japan (MEXT) Scholarships',
        websiteUrl: 'https://www.studyinjapan.go.jp/en/planning/scholarship/',
        sourceType: 'approved_crawler',
        sourceCategory: 'government',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'Higher Education in Japan',
        defaultCountry: 'Japan',
        region: 'Asia',
        priority: 'high',
        trustScore: 97,
        frequency: '12h',
        active: true,
        autoPublish: true,
      },
    ];

    await OpportunitySource.insertMany(seedSources);
    console.log(`✅ Seeded ${seedSources.length} global opportunity sources.`);
  } catch (error) {
    console.error('Initial sources seeding failed:', error.message);
  }
};
