import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = (req as any).user;
    const { leaveType, fromDate, toDate, reason } = req.body;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (to < from) {
      return next(new AppError('Invalid date range', 400));
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: Number(employeeId),
        leaveType,
        fromDate: from,
        toDate: to,
        reason,
        status: 'pending'
      }
    });

    res.status(201).json({ status: 'success', data: { leave } });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = (req as any).user;
    
    const leaves = await prisma.leave.findMany({
      where: { employeeId: Number(employeeId) },
      orderBy: { appliedAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { leaves } });
  } catch (error) {
    next(error);
  }
};

export const getLeaveBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Stub for now since balances are not in schema
    res.status(200).json({ status: 'success', data: { balances: [] } });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await prisma.leave.findFirst({
      where: { id: Number(id) },
    });

    if (!leave) return next(new AppError('Leave request not found', 404));

    const updated = await prisma.leave.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.status(200).json({ status: 'success', data: { leave: updated } });
  } catch (error) {
    next(error);
  }
};
