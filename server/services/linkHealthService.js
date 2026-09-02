import axios from 'axios';
import Opportunity from '../models/Opportunity.js';

/**
 * Validate whether a URL is reachable.
 */
export const checkUrlReachability = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { reachable: false, error: 'Invalid URL format' };
  }

  try {
    const response = await axios.head(url, {
      timeout: 8000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'FauzOpportunityBot/2.0 (+https://fauz-scholarship-alert-1-ghxp.onrender.com; Link Health Check)',
      },
    });

    return { reachable: response.status >= 200 && response.status < 400 };
  } catch (headErr) {
    try {
      // Fallback to lightweight GET
      const getRes = await axios.get(url, {
        timeout: 8000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'FauzOpportunityBot/2.0 (+https://fauz-scholarship-alert-1-ghxp.onrender.com; Link Health Check)',
          Range: 'bytes=0-500',
        },
      });
      return { reachable: getRes.status >= 200 && getRes.status < 400 };
    } catch (getErr) {
      return { reachable: false, error: getErr.message };
    }
  }
};

/**
 * Periodically check published opportunities for broken application links.
 */
export const runLinkHealthAudit = async (limit = 50) => {
  try {
    const opportunities = await Opportunity.find({
      status: 'published',
      linkStatus: { $ne: 'link_broken' },
    })
      .sort({ updatedAt: 1 })
      .limit(limit);

    let brokenCount = 0;

    for (const opp of opportunities) {
      const result = await checkUrlReachability(opp.applicationUrl);
      if (!result.reachable) {
        opp.linkStatus = 'link_broken';
        await opp.save();
        brokenCount++;
      } else {
        opp.linkStatus = 'healthy';
        await opp.save();
      }
    }

    return { checked: opportunities.length, broken: brokenCount };
  } catch (error) {
    console.error('Link health audit error:', error.message);
    return { error: error.message };
  }
};
