import { runGlobalDiscoverySweep } from '../services/GlobalDiscoveryEngine.js';
import { runContinuousRecheck } from '../services/RecheckEngine.js';

let isRunning = false;

/**
 * Autonomous Background Discovery Worker.
 * Executes non-blocking continuous acquisition sweeps with failure isolation.
 */
export const startDiscoveryWorker = () => {
  console.log('⚙️ Background Discovery Worker started.');

  // Run initial discovery sweep 30 seconds after server boot
  setTimeout(async () => {
    try {
      if (!isRunning) {
        isRunning = true;
        await runGlobalDiscoverySweep();
        isRunning = false;
      }
    } catch (err) {
      console.error('Discovery worker execution error:', err.message);
      isRunning = false;
    }
  }, 30000);
};

export default { startDiscoveryWorker };
