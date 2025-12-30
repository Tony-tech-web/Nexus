import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import prisma from '../utils/prisma';
import { sendPasswordResetEmail } from '../utils/email';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utility to hash sensitive tokens before DB storage
const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

export class AuthService {
  static async register(data: any) {
    const { email, password, confirmPassword } = data;

    // 1. Validation
    if (!email || !password || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    // 2. Check existence
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Return generic error to prevent email discovery
      throw new AppError('Registration failed. Please try again.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        authProvider: 'local',
        role: data.role || 'VIEWER',
      }
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Use generic error for both non-existent user and wrong password
    const genericError = new AppError('Invalid email or password', 401);

    if (!user) throw genericError;
    if (!user.password && user.authProvider === 'google') {
        throw new AppError('This account is linked with Google. Please use Google Login.', 400);
    }
    
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) throw genericError;

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Store refresh token hash
    await prisma.refreshToken.create({
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

  static async googleLogin(idToken: string) {
    if (!idToken) throw new AppError('Google token is required', 400);

    try {
      // verifies the access token and gets user info
      const tokenInfo = await googleClient.getTokenInfo(idToken);
      
      const email = tokenInfo.email;
      if (!email) {
        throw new AppError('Could not retrieve email from Google token', 400);
      }

      const googleId = tokenInfo.sub || email;

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            googleId,
            authProvider: 'google',
            role: 'VIEWER',
          }
        });
      } else if (user.authProvider === 'local') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, authProvider: 'google' }
        });
      }

      const accessToken = generateAccessToken({ id: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id });

      await prisma.refreshToken.create({
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
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new AppError('Google authentication failed', 401);
    }
  }

  static async forgotPassword(email: string) {
    // Always return success message
    const successMsg = { message: 'If an account with that email exists, a reset link has been sent.' };
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return successMsg;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    await sendPasswordResetEmail(email, token);
    return successMsg;
  }

  static async resetPassword(data: any) {
    const { token, newPassword } = data;
    const tokenHash = hashToken(token);
    
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { 
        tokenHash,
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    if (!passwordRegex.test(newPassword)) {
        throw new AppError('Password must be 8-12 characters and include uppercase, lowercase, number, and special character.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true }
        })
    ]);

    return { message: 'Password updated successfully' };
  }

  static async logout(refreshToken: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true }
      });
    }
    return { message: 'Logged out successfully' };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, googleId: true, authProvider: true }
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async updateMe(userId: string, data: any) {
    const { email } = data;
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } }
      });
      if (existingUser) throw new AppError('Email already in use', 400);
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { email },
      select: { id: true, email: true, role: true }
    });
  }

  static async updatePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.authProvider === 'google') {
      throw new AppError('Password management not available for this account type', 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) throw new AppError('Invalid current password', 401);

    if (!passwordRegex.test(newPassword)) {
      throw new AppError('New password does not meet security requirements', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password updated successfully' };
  }

  static async getAllUsers() {
    return await prisma.user.findMany({
      select: { id: true, email: true, role: true, authProvider: true, createdAt: true }
    });
  }
}
