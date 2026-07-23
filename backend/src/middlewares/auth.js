import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { env } from '../config/env';
import { prisma } from '../config/db';
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, employeeId: true }
        });
        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }
        req.user = { id: currentUser.id, email: decoded.email, role: currentUser.role, employeeId: currentUser.employeeId };
        next();
    }
    catch (error) {
        next(new AppError('Invalid token or token expired', 401));
    }
};
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map