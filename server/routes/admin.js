import express from 'express';
import {
  getDashboardStats,
  getAdminOpportunities,
  verifyOpportunity,
  mergeOpportunities,
  getIngestions,
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminFeedback,
  updateAdminFeedback,
  getAdminReports,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Opportunities
router.get('/opportunities', getAdminOpportunities);
router.put('/opportunities/:id/verify', verifyOpportunity);
router.post('/opportunities/:id/merge', mergeOpportunities);

// Raw Ingestion Auditing
router.get('/ingestions', getIngestions);

// Users
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUser);
router.put('/users/:id', updateAdminUser);
router.delete('/users/:id', deleteAdminUser);

// Feedback
router.get('/feedback', getAdminFeedback);
router.put('/feedback/:id', updateAdminFeedback);

// Reports
router.get('/reports', getAdminReports);

export default router;