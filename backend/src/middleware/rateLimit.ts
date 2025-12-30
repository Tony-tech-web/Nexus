import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased limit for testing
  message: {
    error: 'Too many attempts. Please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Increased limit for testing
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many failed login attempts. Please try again after an hour'
  }
});
