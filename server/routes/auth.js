import express from 'express';
import { register, login, verifyEmail, resendVerification } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-verification', protect, resendVerification);

export default router;
