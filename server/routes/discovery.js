import express from 'express';
import {
  getDiscoveryOverview,
  triggerDiscoveryRun,
  approveCandidateSource,
  blockCandidateSource,
} from '../controllers/discoveryController.js';
import auth from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', auth, admin, getDiscoveryOverview);
router.post('/run', auth, admin, triggerDiscoveryRun);
router.post('/approve/:id', auth, admin, approveCandidateSource);
router.post('/block/:id', auth, admin, blockCandidateSource);

export default router;
