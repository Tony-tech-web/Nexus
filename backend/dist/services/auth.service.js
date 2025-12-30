"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = require("../middleware/errorHandler");
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../utils/prisma"));
const email_1 = require("../utils/email");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Utility to hash sensitive tokens before DB storage
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
class AuthService {
    static async register(data) {
        const { email, password, confirmPassword } = data;
        // 1. Validation
        if (!email || !password || !confirmPassword) {
            throw new errorHandler_1.AppError('All fields are required', 400);
        }
        if (password !== confirmPassword) {
            throw new errorHandler_1.AppError('Passwords do not match', 400);
        }
        if (!passwordRegex.test(password)) {
            throw new errorHandler_1.AppError('Password must be 8-12 characters and include uppercase, lowercase, number, and special character.', 400);
        }
        // 2. Check existence
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            // Return generic error to prevent email discovery
            throw new errorHandler_1.AppError('Registration failed. Please try again.', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                authProvider: 'local',
                role: data.role || 'VIEWER',
            }
        });
        return { id: user.id, email: user.email, role: user.role };
    }
    static async login(data) {
        const { email, password } = data;
        const user = await prisma_1.default.user.findUnique({
            where: { email }
        });
        // Use generic error for both non-existent user and wrong password
        const genericError = new errorHandler_1.AppError('Invalid email or password', 401);
        if (!user)
            throw genericError;
        if (!user.password && user.authProvider === 'google') {
            throw new errorHandler_1.AppError('This account is linked with Google. Please use Google Login.', 400);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            throw genericError;
        const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id });
        // Store refresh token hash
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });
        return {
            user: { id: user.id, email: user.email, role: user.role },
            accessToken,
            refreshToken
        };
    }
    static async googleLogin(idToken) {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email)
            throw new errorHandler_1.AppError('Invalid Google token', 400);
        let user = await prisma_1.default.user.findUnique({
            where: { email: payload.email }
        });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email: payload.email,
                    googleId: payload.sub,
                    authProvider: 'google',
                    role: 'VIEWER',
                }
            });
        }
        else if (user.authProvider === 'local') {
            // Email collision handling: If local user exists, link Google but keep local as primary or update
            user = await prisma_1.default.user.update({
                where: { id: user.id },
                data: { googleId: payload.sub, authProvider: 'google' }
            });
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id });
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        return {
            user: { id: user.id, email: user.email, role: user.role },
            accessToken,
            refreshToken
        };
    }
    static async forgotPassword(email) {
        // Always return success message
        const successMsg = { message: 'If an account with that email exists, a reset link has been sent.' };
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return successMsg;
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour
        await prisma_1.default.passwordResetToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt
            }
        });
        await (0, email_1.sendPasswordResetEmail)(email, token);
        return successMsg;
    }
    static async resetPassword(data) {
        const { token, newPassword } = data;
        const tokenHash = hashToken(token);
        const resetToken = await prisma_1.default.passwordResetToken.findFirst({
            where: {
                tokenHash,
                used: false,
                expiresAt: { gt: new Date() }
            },
            include: { user: true }
        });
        if (!resetToken) {
            throw new errorHandler_1.AppError('Invalid or expired reset token', 400);
        }
        if (!passwordRegex.test(newPassword)) {
            throw new errorHandler_1.AppError('Password must be 8-12 characters and include uppercase, lowercase, number, and special character.', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword }
            }),
            prisma_1.default.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true }
            })
        ]);
        return { message: 'Password updated successfully' };
    }
    static async logout(refreshToken) {
        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);
            await prisma_1.default.refreshToken.updateMany({
                where: { tokenHash },
                data: { revoked: true }
            });
        }
        return { message: 'Logged out successfully' };
    }
    static async getMe(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, googleId: true, authProvider: true }
        });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        return user;
    }
    static async updateMe(userId, data) {
        const { email } = data;
        if (email) {
            const existingUser = await prisma_1.default.user.findFirst({
                where: { email, NOT: { id: userId } }
            });
            if (existingUser)
                throw new errorHandler_1.AppError('Email already in use', 400);
        }
        return await prisma_1.default.user.update({
            where: { id: userId },
            data: { email },
            select: { id: true, email: true, role: true }
        });
    }
    static async updatePassword(userId, data) {
        const { currentPassword, newPassword } = data;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || user.authProvider === 'google') {
            throw new errorHandler_1.AppError('Password management not available for this account type', 400);
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password || '');
        if (!isMatch)
            throw new errorHandler_1.AppError('Invalid current password', 401);
        if (!passwordRegex.test(newPassword)) {
            throw new errorHandler_1.AppError('New password does not meet security requirements', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { message: 'Password updated successfully' };
    }
    static async getAllUsers() {
        return await prisma_1.default.user.findMany({
            select: { id: true, email: true, role: true, authProvider: true, createdAt: true }
        });
    }
}
exports.AuthService = AuthService;
