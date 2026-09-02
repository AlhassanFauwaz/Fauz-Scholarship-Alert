import cron from 'node-cron';
import { runContinuousRecheck } from '../services/RecheckEngine.js';

let recheckJob = null;

/**
 * Initializes the recurring recheck scheduler (runs every 60 minutes).
 */
export const initRecheckScheduler = () => {
  if (recheckJob) return;

  console.log('🔄 Opportunity Recheck Scheduler initialized (Every 60 minutes).');

  recheckJob = cron.schedule('0 * * * *', async () => {
    console.log('⏰ Starting hourly opportunity recheck & link health sweep...');
    await runContinuousRecheck(50);
  });
};

export default { initRecheckScheduler };
