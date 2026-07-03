import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;
    const { leaveTypeId, fromDate, toDate, reason } = req.body;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = (to.getTime() - from.getTime()) / (1000 * 3600 * 24) + 1;

    if (totalDays <= 0) {
      return next(new AppError('Invalid date range', 400));
    }

    const leaveBalance = await prisma.leaveBalance.findFirst({
      where: { companyId, employeeId, leaveTypeId, year: new Date().getFullYear() }
    });

    if (!leaveBalance || leaveBalance.balanceDays < totalDays) {
      return next(new AppError('Insufficient leave balance', 400));
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        companyId,
        employeeId,
        leaveTypeId,
        fromDate: from,
        toDate: to,
        totalDays,
        reason,
        status: 'PENDING'
      }
    });

    res.status(201).json({ status: 'success', data: { leaveRequest } });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;
    
    const leaves = await prisma.leaveRequest.findMany({
      where: { companyId, employeeId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { leaves } });
  } catch (error) {
    next(error);
  }
};

export const getLeaveBalances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;
    const year = new Date().getFullYear();

    const balances = await prisma.leaveBalance.findMany({
      where: { companyId, employeeId, year },
      include: { leaveType: true }
    });

    res.status(200).json({ status: 'success', data: { balances } });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, id: approverId } = req.user as any;
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const leave = await prisma.leaveRequest.findFirst({
      where: { id, companyId },
    });

    if (!leave) return next(new AppError('Leave request not found', 404));

    const updated = await prisma.$transaction(async (tx) => {
      const l = await tx.leaveRequest.update({
        where: { id },
        data: { status, approvedById: approverId, rejectionReason }
      });

      if (status === 'APPROVED') {
        const balance = await tx.leaveBalance.findFirst({
          where: { companyId, employeeId: l.employeeId, leaveTypeId: l.leaveTypeId, year: l.fromDate.getFullYear() }
        });
        
        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: balance.usedDays + l.totalDays,
              balanceDays: balance.balanceDays - l.totalDays
            }
          });
        }
      }
      return l;
    });

    res.status(200).json({ status: 'success', data: { leave: updated } });
  } catch (error) {
    next(error);
  }
};
