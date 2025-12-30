"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const stats_controller_1 = require("../controllers/stats.controller");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
router.post('/register', rateLimit_1.authRateLimiter, auth_controller_1.AuthController.register);
router.post('/login', rateLimit_1.loginRateLimiter, auth_controller_1.AuthController.login);
router.post('/logout', auth_1.authenticate, auth_controller_1.AuthController.logout);
router.get('/me', auth_1.authenticate, auth_controller_1.AuthController.getMe);
router.get('/users', auth_1.authenticate, auth_controller_1.AuthController.getUsers);
// Google Auth
router.post('/google-login', rateLimit_1.authRateLimiter, auth_controller_1.AuthController.googleLogin);
router.get('/google/callback', rateLimit_1.authRateLimiter, auth_controller_1.AuthController.googleCallback);
// Public Stats
router.get('/stats', stats_controller_1.StatsController.getStats);
// Forgot Password
router.post('/forgot-password', rateLimit_1.authRateLimiter, auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', rateLimit_1.authRateLimiter, auth_controller_1.AuthController.resetPassword);
// User Settings (Protected)
router.patch('/update-profile', auth_1.authenticate, auth_controller_1.AuthController.updateProfile);
router.patch('/update-password', auth_1.authenticate, auth_controller_1.AuthController.updatePassword);
exports.default = router;
