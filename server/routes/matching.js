import express from 'express';
import { getRecommendations } from '../controllers/matchingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/recommendations', protect, getRecommendations);

export default router;