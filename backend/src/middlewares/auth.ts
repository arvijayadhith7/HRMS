import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { env } from '../config/env';
import { prisma } from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    companyId: string;
    role: string;
    employeeId?: string | null;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, companyId: true, role: true, employeeId: true, deletedAt: true }
    });

    if (!currentUser || currentUser.deletedAt) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    req.user = {
      id: currentUser.id,
      companyId: currentUser.companyId,
      role: currentUser.role,
      employeeId: currentUser.employeeId,
    };
    
    next();
  } catch (error) {
    next(new AppError('Invalid token or token expired', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
