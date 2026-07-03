import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existingRecord = await prisma.attendance.findFirst({
      where: { companyId, employeeId, date: today }
    });

    if (existingRecord) {
      return next(new AppError('Already checked in for today', 400));
    }

    const attendance = await prisma.attendance.create({
      data: {
        companyId,
        employeeId,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT'
      }
    });

    res.status(201).json({ status: 'success', data: { attendance } });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: { companyId, employeeId, date: today }
    });

    if (!attendance || !attendance.checkIn) {
      return next(new AppError('No check-in record found for today', 404));
    }

    if (attendance.checkOut) {
      return next(new AppError('Already checked out for today', 400));
    }

    const checkOutTime = new Date();
    const diffHours = (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        totalHours: diffHours,
      }
    });

    res.status(200).json({ status: 'success', data: { attendance: updated } });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;
    const { month, year } = req.query;

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      dateFilter = { date: { gte: startDate, lte: endDate } };
    }

    const records = await prisma.attendance.findMany({
      where: { companyId, employeeId, ...dateFilter },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { records } });
  } catch (error) {
    next(error);
  }
};
