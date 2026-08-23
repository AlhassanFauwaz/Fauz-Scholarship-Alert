import express from 'express';
import { getMe, updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateProfile);
router.put('/me/password', changePassword);

export default router;