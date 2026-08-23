import express from 'express';
import {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  toggleSubscription,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createSubscription);
router.get('/', getSubscriptions);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.put('/:id/toggle', toggleSubscription);

export default router;