import cron from 'node-cron';
import { runSourceDiscovery } from '../collectors/sourceDiscoveryCollector.js';

let discoveryJob = null;

/**
 * Initializes the automated source discovery cron scheduler.
 * Runs once every 24 hours at 03:00 UTC.
 */
export const initDiscoveryScheduler = () => {
  if (discoveryJob) return;

  console.log('🌐 Automated Source Discovery Scheduler initialized (Daily 03:00 UTC).');

  discoveryJob = cron.schedule('0 3 * * *', async () => {
    try {
      console.log('⏰ Starting scheduled source discovery sweep...');
      await runSourceDiscovery();
    } catch (err) {
      console.error('Source discovery scheduler error:', err.message);
    }
  });
};
