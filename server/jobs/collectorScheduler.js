import cron from 'node-cron';
import OpportunitySource from '../models/OpportunitySource.js';
import { syncSource } from '../services/collectorService.js';

const FREQUENCY_INTERVALS_MS = {
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

export const startCollectorScheduler = () => {
  // Check active sources every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = Date.now();
      const activeSources = await OpportunitySource.find({ active: true });

      for (const source of activeSources) {
        const intervalMs = FREQUENCY_INTERVALS_MS[source.frequency] || FREQUENCY_INTERVALS_MS['6h'];
        const lastSyncTime = source.lastSyncAt ? new Date(source.lastSyncAt).getTime() : 0;

        // If never synced or time elapsed exceeds interval
        if (now - lastSyncTime >= intervalMs) {
          console.log(`📡 Collecting from source: ${source.name} (${source.sourceType})`);
          await syncSource(source);
        }
      }
    } catch (error) {
      console.error('Collector scheduler execution failed:', error.message);
    }
  });

  console.log('🕒 Opportunity collector scheduler initialized (runs every 10 minutes).');
};
