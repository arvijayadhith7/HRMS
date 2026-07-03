import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    
    const totalEmployees = await prisma.employee.count({
      where: { companyId, status: 'ACTIVE', deletedAt: null }
    });

    const pendingLeaves = await prisma.leaveRequest.count({
      where: { companyId, status: 'PENDING', deletedAt: null }
    });

    const openTickets = await prisma.ticket.count({
      where: { companyId, status: 'OPEN', deletedAt: null }
    });

    const openJobs = await prisma.recruitmentJob.count({
      where: { companyId, status: 'OPEN', deletedAt: null }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalEmployees,
        pendingLeaves,
        openTickets,
        openJobs
      }
    });
  } catch (error) {
    next(error);
  }
};
