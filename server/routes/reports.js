import express from 'express';
import {
  createOpportunityReport,
  getAdminOpportunityReports,
  resolveOpportunityReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// Public / User route to submit report
router.post('/', createOpportunityReport);

// Admin moderation routes
router.get('/admin', protect, admin, getAdminOpportunityReports);
router.put('/admin/:id/resolve', protect, admin, resolveOpportunityReport);

export default router;
