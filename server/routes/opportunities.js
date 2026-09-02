import express from 'express';
import upload, { uploadToCloudinary } from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';
import {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
  trackOpportunityClick,
} from '../controllers/opportunityController.js';
import { saveOpportunity, unsaveOpportunity } from '../controllers/savedOpportunityController.js';

const router = express.Router();

// ---------- PUBLIC ROUTES ----------
router.get('/', getOpportunities);
router.post('/:id/click', trackOpportunityClick);
router.get('/:id', getOpportunity); // must come after more specific parameterised routes

// ---------- USER PROTECTED ROUTES (Save/Unsave) ----------
router.post('/:id/save', protect, saveOpportunity);
router.delete('/:id/save', protect, unsaveOpportunity);

// ---------- ADMIN PROTECTED ROUTES ----------
// Create (with image upload)
router.post(
  '/',
  protect,
  admin,
  upload.single('image'),
  uploadToCloudinary,
  createOpportunity
);

// Update (with optional image upload)
router.put(
  '/:id',
  protect,
  admin,
  upload.single('image'),
  uploadToCloudinary,
  updateOpportunity
);

// Delete
router.delete('/:id', protect, admin, deleteOpportunity);

export default router;