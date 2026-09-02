import express from 'express';
import {
  getDashboardStats,
  getAdminOpportunities,
  verifyOpportunity,
  overrideOpportunity,
  mergeOpportunities,
  getIngestions,
  getAuditLogs,
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

// Opportunities Management & Moderation
router.get('/opportunities', getAdminOpportunities);
router.put('/opportunities/:id/verify', verifyOpportunity);
router.put('/opportunities/:id/override', overrideOpportunity);
router.post('/opportunities/:id/merge', mergeOpportunities);

// Raw Ingestion Auditing & Audit Trail
router.get('/ingestions', getIngestions);
router.get('/audit-logs', getAuditLogs);

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