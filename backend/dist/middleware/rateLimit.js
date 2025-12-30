"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRateLimiter = exports.authRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased limit for testing
    message: {
        error: 'Too many attempts. Please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Increased limit for testing
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many failed login attempts. Please try again after an hour'
    }
});
