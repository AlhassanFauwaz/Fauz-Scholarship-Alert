import OpportunitySource from '../models/OpportunitySource.js';
import Opportunity from '../models/Opportunity.js';
import { runSourceDiscovery } from '../collectors/sourceDiscoveryCollector.js';

/**
 * Get Global Discovery Dashboard Overview & Continental Coverage metrics.
 */
export const getDiscoveryOverview = async (req, res) => {
  try {
    const totalSources = await OpportunitySource.countDocuments();
    const activeSources = await OpportunitySource.countDocuments({ status: 'active' });
    const pendingSources = await OpportunitySource.countDocuments({ status: 'pending_review' });
    const blockedSources = await OpportunitySource.countDocuments({ status: 'blocked' });

    const totalOpportunities = await Opportunity.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const collectedToday = await Opportunity.countDocuments({ createdAt: { $gte: today } });

    // Continental coverage aggregation
    const regionalCoverage = await OpportunitySource.aggregate([
      {
        $group: {
          _id: '$region',
          sourceCount: { $sum: 1 },
          opportunitiesCount: { $sum: '$opportunitiesFound' },
        },
      },
    ]);

    // Top country coverage aggregation
    const countryCoverage = await Opportunity.aggregate([
      { $match: { country: { $ne: '' } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]);

    // Candidate sources awaiting review
    const candidateSources = await OpportunitySource.find({ status: 'pending_review' })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      stats: {
        totalSources,
        activeSources,
        pendingSources,
        blockedSources,
        totalOpportunities,
        collectedToday,
      },
      regionalCoverage,
      countryCoverage,
      candidateSources,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving discovery metrics', error: err.message });
  }
};

/**
 * Trigger immediate manual source discovery scan.
 */
export const triggerDiscoveryRun = async (req, res) => {
  try {
    const result = await runSourceDiscovery();
    res.json({
      message: `Source discovery scan completed. Found ${result.discoveredCount} new candidate sources.`,
      result,
    });
  } catch (err) {
    res.status(500).json({ message: 'Discovery scan failed', error: err.message });
  }
};

/**
 * Approve a candidate source.
 */
export const approveCandidateSource = async (req, res) => {
  try {
    const { id } = req.params;
    const source = await OpportunitySource.findById(id);
    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }

    source.status = 'active';
    source.trustScore = Math.max(source.trustScore || 70, 75);
    await source.save();

    res.json({ message: 'Source approved and activated successfully', source });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed', error: err.message });
  }
};

/**
 * Block a malicious/spam source.
 */
export const blockCandidateSource = async (req, res) => {
  try {
    const { id } = req.params;
    const source = await OpportunitySource.findById(id);
    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }

    source.status = 'blocked';
    source.active = false;
    await source.save();

    res.json({ message: 'Source blocked successfully', source });
  } catch (err) {
    res.status(500).json({ message: 'Blocking failed', error: err.message });
  }
};
