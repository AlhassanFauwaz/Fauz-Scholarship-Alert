import express from 'express';
import {
  getDiscoveryOverview,
  triggerDiscoveryRun,
  approveCandidateSource,
  blockCandidateSource,
} from '../controllers/discoveryController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', protect, admin, getDiscoveryOverview);
router.post('/run', protect, admin, triggerDiscoveryRun);
router.post('/approve/:id', protect, admin, approveCandidateSource);
router.post('/block/:id', protect, admin, blockCandidateSource);

export default router;
