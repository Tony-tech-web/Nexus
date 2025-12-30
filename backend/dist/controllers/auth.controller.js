"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    static async register(req, res, next) {
        try {
            const user = await auth_service_1.AuthService.register(req.body);
            res.status(201).json(user);
        }
        catch (err) {
            next(err);
        }
    }
    static async login(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.login(req.body);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async getMe(req, res, next) {
        try {
            // @ts-ignore - user is added by auth middleware
            const userId = req.user?.id;
            if (!userId)
                throw new errorHandler_1.AppError('Unauthorized', 401);
            const user = await auth_service_1.AuthService.getMe(userId);
            res.json(user);
        }
        catch (err) {
            next(err);
        }
    }
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await auth_service_1.AuthService.logout(refreshToken);
            res.json({ message: 'Logged out successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    static async googleLogin(req, res, next) {
        try {
            const { idToken } = req.body;
            if (!idToken)
                throw new errorHandler_1.AppError('Google ID token is required', 400);
            const result = await auth_service_1.AuthService.googleLogin(idToken);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async googleCallback(req, res, next) {
        try {
            const { code } = req.query;
            console.log('Google OAuth callback reached with code:', code);
            res.send("Google OAuth callback reached");
        }
        catch (err) {
            next(err);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.AuthService.forgotPassword(email);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.resetPassword(req.body);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            // @ts-ignore
            const userId = req.user?.id;
            const user = await auth_service_1.AuthService.updateMe(userId, req.body);
            res.json(user);
        }
        catch (err) {
            next(err);
        }
    }
    static async updatePassword(req, res, next) {
        try {
            // @ts-ignore
            const userId = req.user?.id;
            const result = await auth_service_1.AuthService.updatePassword(userId, req.body);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async getUsers(req, res, next) {
        try {
            const users = await auth_service_1.AuthService.getAllUsers();
            res.json(users);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
