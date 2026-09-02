import Opportunity from '../models/Opportunity.js';
import AuditLog from '../models/AuditLog.js';
import { checkUrlReachability } from './linkHealthService.js';

/**
 * RecheckEngine
 * Periodically re-verifies active opportunities, detects deadline changes & expirations,
 * and tracks application link health.
 */
export const runContinuousRecheck = async (batchSize = 50) => {
  const now = new Date();
  let expiredCount = 0;
  let brokenLinkCount = 0;
  let recheckedCount = 0;

  try {
    // 1. Sweep expired opportunities
    const expiredOpportunities = await Opportunity.find({
      status: 'published',
      deadline: { $lt: now },
    }).limit(batchSize);

    for (const opp of expiredOpportunities) {
      opp.status = 'expired';
      opp.verificationStatus = 'expired';
      await opp.save();
      expiredCount++;

      await AuditLog.create({
        action: 'opportunity_expired',
        category: 'verification',
        targetType: 'Opportunity',
        targetId: opp._id,
        details: `Opportunity "${opp.title}" automatically expired past deadline (${opp.deadline.toISOString()}).`,
      });
    }

    // 2. Sample active opportunities for link health check
    const activeOpps = await Opportunity.find({
      status: 'published',
      linkStatus: { $ne: 'link_broken' },
    })
      .sort({ updatedAt: 1 })
      .limit(batchSize);

    for (const opp of activeOpps) {
      if (opp.applicationUrl) {
        const reachability = await checkUrlReachability(opp.applicationUrl);
        if (!reachability.reachable) {
          opp.linkStatus = 'link_broken';
          await opp.save();
          brokenLinkCount++;

          await AuditLog.create({
            action: 'broken_link_detected',
            category: 'verification',
            targetType: 'Opportunity',
            targetId: opp._id,
            details: `Application link for "${opp.title}" is unreachable: ${opp.applicationUrl}`,
          });
        } else {
          opp.linkStatus = 'healthy';
          await opp.save();
        }
        recheckedCount++;
      }
    }

    return {
      expiredCount,
      brokenLinkCount,
      recheckedCount,
    };
  } catch (error) {
    console.error('Continuous recheck error:', error.message);
    return { error: error.message };
  }
};

export default { runContinuousRecheck };
