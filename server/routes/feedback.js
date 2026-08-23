import express from 'express';
import { submitFeedback, getUserFeedback, getAllFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', submitFeedback);
router.get('/', getUserFeedback);
router.get('/admin', getAllFeedback); // Admin route to get all feedback
export default router;