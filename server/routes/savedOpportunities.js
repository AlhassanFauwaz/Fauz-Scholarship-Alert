import express from 'express';
import { getSavedOpportunities } from '../controllers/savedOpportunityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSavedOpportunities);

export default router;