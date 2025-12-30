import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { StatsController } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter, loginRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);
router.get('/users', authenticate, AuthController.getUsers);

// Google Auth
router.post('/google-login', authRateLimiter, AuthController.googleLogin);
router.get('/google/callback', authRateLimiter, AuthController.googleCallback);

// Public Stats
router.get('/stats', StatsController.getStats);

// Forgot Password
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
router.post('/reset-password', authRateLimiter, AuthController.resetPassword);

// User Settings (Protected)
router.patch('/update-profile', authenticate, AuthController.updateProfile);
router.patch('/update-password', authenticate, AuthController.updatePassword);

export default router;
