// Route table. Public vs protected is explicit here (ADR-0008).
// Request validation is NOT repeated here: openapi.yaml drives it (ADR-0003).
import { Router } from 'express';
import { protect } from '../middleware/auth';
import { authLimiter, contactLimiter } from '../middleware/rateLimiters';
import * as auth from '../controllers/authController';
import * as user from '../controllers/userController';
import * as hackathon from '../controllers/hackathonController';
import * as contact from '../controllers/contactController';
import * as system from '../controllers/systemController';

export const router = Router();

// ---- Public ----
router.get('/health', system.health);
router.get('/meta/options', system.getOptions);
router.post('/auth/signup', authLimiter, auth.signup);
router.post('/auth/verify-otp', authLimiter, auth.verifyOtp);
router.post('/auth/resend-otp', authLimiter, auth.resendOtp);
router.post('/auth/login', authLimiter, auth.login);
router.post('/contact', contactLimiter, contact.submit);

// ---- Protected (JWT) ----
router.get('/user/me', protect, user.getMe);
router.put('/user/update', protect, user.updateMe);
router.post('/hackathon/register', protect, hackathon.register);
router.get('/hackathon/my-entry', protect, hackathon.getMyEntry);
router.delete('/hackathon/:id', protect, hackathon.remove);
