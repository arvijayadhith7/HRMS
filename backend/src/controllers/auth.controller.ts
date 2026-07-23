import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { redis } from '../config/redis';
import { AppError } from '../utils/appError';
import crypto from 'crypto';

const signTokens = (userId: number, role: string) => {
  const payload = { id: userId, role };
  
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
};

export const registerCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyName, domain, adminName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: email.split('@')[0],
          email,
          passwordHash,
          role: 'COMPANY_ADMIN',
        },
      });

      const employee = await tx.employee.create({
        data: {
          empId: 'ADMIN-001',
          firstName: adminName.split(' ')[0] || adminName,
          lastName: adminName.split(' ').slice(1).join(' ') || '',
          email,
          department: 'Administration',
          designation: 'Company Admin',
          joinDate: new Date(),
          salary: 0
        }
      });

      return { user };
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: { id: result.user.id, email: result.user.email, role: result.user.role }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const { accessToken, refreshToken } = signTokens(user.id, user.role);

    await redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return next(new AppError('No refresh token provided', 401));
    }

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
    const storedToken = await redis.get(`refresh_token:${decoded.id}`);

    if (!storedToken || storedToken !== refreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const { accessToken, refreshToken: newRefreshToken } = signTokens(decoded.id, decoded.role);

    await redis.set(`refresh_token:${decoded.id}`, newRefreshToken, 'EX', 7 * 24 * 60 * 60);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      accessToken
    });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
        await redis.del(`refresh_token:${decoded.id}`);
      } catch (err) {
        // Ignore verify error on logout
      }
    }

    res.clearCookie('refresh_token');
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return next(new AppError('Email and newPassword are required', 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    // A13: Alert HR/Admin
    const hrAdmins = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'] }
      }
    });

    for (const admin of hrAdmins) {
      const adminEmployee = await prisma.employee.findUnique({ where: { email: admin.email } });
      if (adminEmployee) {
        await prisma.notification.create({
          data: {
            userId: adminEmployee.id,
            title: 'Security Alert: Password Changed',
            message: `Employee with email ${email} has changed their password.`,
            type: 'warning'
          }
        });
      }
    }

    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
