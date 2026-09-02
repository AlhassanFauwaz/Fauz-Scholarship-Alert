import axios from 'axios';
import Opportunity from '../models/Opportunity.js';
import OpportunitySource from '../models/OpportunitySource.js';
import {
  normalizeCountry,
  normalizeFieldOfStudy,
  normalizeDegreeLevel,
  normalizeFundingType,
  normalizeOpportunityType,
} from './taxonomyService.js';
import { findDuplicate } from './duplicateService.js';
import { createNotification } from '../utils/notifications.js';
import User from '../models/User.js';
import calculateMatch from '../utils/matchScore.js';

/**
 * Clean HTML markup and extract plain text.
 */
const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

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

    const rawTitle = titleMatch ? stripHtml(titleMatch[1]) : '';
    const rawLink = linkMatch ? stripHtml(linkMatch[1]) : '';
    const rawDesc = descMatch ? stripHtml(descMatch[1]) : '';
    const pubDate = pubDateMatch ? new Date(stripHtml(pubDateMatch[1])) : new Date();

    if (rawTitle && rawLink) {
      items.push({
        title: rawTitle,
        applicationUrl: rawLink,
        sourceUrl: rawLink,
        description: rawDesc || rawTitle,
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

      const rawTitle = titleMatch ? stripHtml(titleMatch[1]) : '';
      const rawLink = linkMatch ? stripHtml(linkMatch[1]) : '';
      const rawSummary = summaryMatch ? stripHtml(summaryMatch[1]) : '';
      const pubDate = updatedMatch ? new Date(stripHtml(updatedMatch[1])) : new Date();

      if (rawTitle && rawLink) {
        items.push({
          title: rawTitle,
          applicationUrl: rawLink,
          sourceUrl: rawLink,
          description: rawSummary || rawTitle,
          datePublished: isNaN(pubDate.getTime()) ? new Date() : pubDate,
        });
      }
    }
  }

  return items;
};

/**
 * Extract an estimated deadline from description text or assign a sensible default.
 */
const detectDeadline = (text) => {
  if (!text) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 45); // default 45 days
    return fallback;
  }

  // Look for deadline keywords like "deadline: 15 October 2026", "closing date: 2026-11-30"
  const patterns = [
    /(?:deadline|closes?|closing date|due date)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /(?:deadline|closes?|closing date|due date)[:\s]+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /(?:deadline|closes?|closing date|due date)[:\s]+(\d{4}-\d{2}-\d{2})/i,
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime()) && parsed > new Date()) {
        return parsed;
      }
    }
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 45);
  return fallback;
};

/**
 * Fetch and process opportunities from an OpportunitySource.
 */
export const syncSource = async (source) => {
  try {
    let rawItems = [];

    if (source.sourceType === 'rss' && source.rssUrl) {
      const response = await axios.get(source.rssUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'FauzOpportunityBot/2.0 (Discovery and Opportunity Aggregator)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      });
      rawItems = parseXmlFeed(response.data, source);
    } else if (source.sourceType === 'api' && source.apiEndpoint) {
      const response = await axios.get(source.apiEndpoint, {
        timeout: 15000,
        headers: {
          'User-Agent': 'FauzOpportunityBot/2.0 (Discovery and Opportunity Aggregator)',
          Accept: 'application/json',
        },
      });
      if (Array.isArray(response.data)) {
        rawItems = response.data;
      } else if (response.data?.opportunities || response.data?.items || response.data?.results) {
        rawItems = response.data.opportunities || response.data.items || response.data.results;
      }
    }

    let createdCount = 0;

    for (const raw of rawItems) {
      const title = raw.title?.trim();
      const appUrl = raw.applicationUrl || raw.url || raw.link || source.websiteUrl;
      if (!title || !appUrl) continue;

      const fullDesc = raw.description || raw.summary || title;
      const cleanDesc = stripHtml(fullDesc);
      const shortDesc = cleanDesc.length > 280 ? `${cleanDesc.substring(0, 277)}...` : cleanDesc;

      const candidate = {
        title,
        shortDescription: shortDesc,
        description: cleanDesc,
        type: normalizeOpportunityType(raw.type || source.defaultOpportunityType),
        category: raw.category || source.defaultCategory || 'General',
        organization: raw.organization || raw.provider || source.name,
        provider: source.name,
        country: normalizeCountry(raw.country || source.defaultCountry),
        region: raw.region || 'Worldwide',
        applicationUrl: appUrl,
        officialWebsite: source.websiteUrl,
        sourceUrl: raw.sourceUrl || appUrl,
        sourceName: source.name,
        sourceId: source._id,
        fundingType: normalizeFundingType(raw.fundingType || (title.toLowerCase().includes('fully funded') ? 'fully_funded' : 'other')),
        degreeLevels: [normalizeDegreeLevel(raw.degreeLevel || (title.toLowerCase().includes('master') ? 'graduate' : title.toLowerCase().includes('phd') ? 'phd' : 'undergraduate'))],
        fieldsOfStudy: [normalizeFieldOfStudy(raw.fieldOfStudy || 'General')],
        deadline: raw.deadline ? new Date(raw.deadline) : detectDeadline(cleanDesc),
        datePublished: raw.datePublished || new Date(),
        status: 'published',
        verificationStatus: source.autoPublish ? 'verified' : 'pending',
      };

      // Check for duplicate
      const duplicate = await findDuplicate(candidate);
      if (!duplicate) {
        const newOpp = await Opportunity.create(candidate);
        createdCount++;

        // Trigger background user notification if verified/published
        if (newOpp.status === 'published' && newOpp.verificationStatus === 'verified') {
          triggerMatchNotifications(newOpp).catch((err) =>
            console.error('Error notifying users for new opportunity:', err)
          );
        }
      }
    }

    // Update source health and stats
    source.lastSyncAt = new Date();
    source.lastSuccessAt = new Date();
    source.healthStatus = 'healthy';
    source.lastErrorMessage = '';
    source.retryCount = 0;
    source.opportunitiesFound = (source.opportunitiesFound || 0) + createdCount;
    await source.save();

    return { success: true, count: createdCount };
  } catch (error) {
    console.error(`Source sync failed [${source.name}]:`, error.message);
    source.lastSyncAt = new Date();
    source.lastFailureAt = new Date();
    source.lastErrorMessage = error.message;
    source.retryCount = (source.retryCount || 0) + 1;
    source.healthStatus = source.retryCount >= 3 ? 'failed' : 'warning';
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
 * Seed initial trusted global opportunity feeds if the database is empty.
 */
export const seedInitialSources = async () => {
  try {
    const existingCount = await OpportunitySource.countDocuments();
    if (existingCount > 0) return;

    console.log('🌱 Seeding initial global opportunity sources...');

    const seedSources = [
      {
        name: 'DAAD Scholarships Database',
        websiteUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
        sourceType: 'rss',
        rssUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships/rss/',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'Academic',
        defaultCountry: 'Germany',
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'Chevening International Scholarships',
        websiteUrl: 'https://www.chevening.org/scholarships/',
        sourceType: 'rss',
        rssUrl: 'https://www.chevening.org/feed/',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'Master Degrees',
        defaultCountry: 'United Kingdom',
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'Erasmus Mundus Joint Masters',
        websiteUrl: 'https://erasmus-plus.ec.europa.eu/',
        sourceType: 'rss',
        rssUrl: 'https://ec.europa.eu/programmes/erasmus-plus/rss_en.xml',
        defaultOpportunityType: 'scholarship',
        defaultCategory: 'European Union Studies',
        defaultCountry: 'Europe',
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'World Bank Fellowships & Grants',
        websiteUrl: 'https://www.worldbank.org/en/programs/scholarships',
        sourceType: 'rss',
        rssUrl: 'https://www.worldbank.org/en/news/rss',
        defaultOpportunityType: 'grant',
        defaultCategory: 'Development & Economics',
        defaultCountry: 'Worldwide',
        frequency: '12h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'UN Careers & Internship Opportunities',
        websiteUrl: 'https://careers.un.org/',
        sourceType: 'rss',
        rssUrl: 'https://www.un.org/press/en/feed',
        defaultOpportunityType: 'internship',
        defaultCategory: 'International Relations',
        defaultCountry: 'Worldwide',
        frequency: '6h',
        active: true,
        autoPublish: true,
      },
      {
        name: 'UNESCO Youth Grants & Competitions',
        websiteUrl: 'https://www.unesco.org/en/youth',
        sourceType: 'rss',
        rssUrl: 'https://en.unesco.org/rss.xml',
        defaultOpportunityType: 'competition',
        defaultCategory: 'Youth Innovation',
        defaultCountry: 'Worldwide',
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
