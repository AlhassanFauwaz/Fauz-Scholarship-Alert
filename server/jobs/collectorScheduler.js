import cron from 'node-cron';
import OpportunitySource from '../models/OpportunitySource.js';
import { syncSource } from '../services/collectorService.js';

let collectorJob = null;

const FREQUENCY_INTERVALS_MS = {
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sweeps active sources and synchronizes those that are due based on priority & frequency.
 */
export const runCollectorSweep = async () => {
  try {
    const activeSources = await OpportunitySource.find({
      active: true,
      status: 'active',
      healthStatus: { $ne: 'disabled' },
    }).sort({ priority: -1, lastSyncAt: 1 });

    const now = new Date();

    for (const source of activeSources) {
      const intervalMs = FREQUENCY_INTERVALS_MS[source.frequency] || FREQUENCY_INTERVALS_MS['6h'];
      const lastSync = source.lastSyncAt ? new Date(source.lastSyncAt).getTime() : 0;
      const isDue = now.getTime() - lastSync >= intervalMs;

      if (isDue) {
        console.log(`⏰ Scheduled collector sync due for: ${source.name} [Priority: ${source.priority}]`);
        await syncSource(source);
        // Rate-limiting delay between external requests
        await delay(source.requestDelayMs || 1000);
      }
    }
  } catch (error) {
    console.error('Collector scheduler sweep error:', error.message);
  }
};

/**
 * Initializes the recurring collector cron job (runs every 10 minutes).
 */
export const initCollectorScheduler = () => {
  if (collectorJob) return;

  console.log('🤖 Opportunity Collector Scheduler initialized (Every 10 minutes).');

  collectorJob = cron.schedule('*/10 * * * *', async () => {
    await runCollectorSweep();
  });
};
