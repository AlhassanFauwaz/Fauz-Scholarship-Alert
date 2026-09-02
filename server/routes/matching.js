import express from 'express';
import { getRecommendations, dismissOpportunity } from '../controllers/matchingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/recommendations', protect, getRecommendations);
router.post('/dismiss/:id', protect, dismissOpportunity);

export default router;