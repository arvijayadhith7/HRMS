import type { Request, Response, NextFunction } from 'express';
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
      select: { id: true, role: true, email: true }
    });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Attempt to find the employee profile linked to this user's email
    let employeeId = null;
    if (currentUser.role === 'employee' || currentUser.role === 'EMPLOYEE') {
      const employee = await prisma.employee.findUnique({
        where: { email: currentUser.email }
      });
      if (employee) {
        employeeId = employee.id;
      }
    }

    (req as any).user = { 
      id: currentUser.id, 
      email: currentUser.email, 
      role: currentUser.role, 
      employeeId 
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
