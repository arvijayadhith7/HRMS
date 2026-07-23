import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const askAssistant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = (req as any).user || {};
    const { query } = req.body;

    // Simulated AI Response logic
    let reply = "I'm your NestAI assistant. How can I help you today?";

    if (query.toLowerCase().includes('attendance')) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const presentCount = await prisma.attendance.count({
        where: { date: today, status: 'PRESENT' }
      });
      reply = `Today's attendance looks good! You have ${presentCount} employees present right now.`;
    } else if (query.toLowerCase().includes('leave')) {
      const pendingLeaves = await prisma.leave.count({
        where: { status: 'pending' }
      });
      reply = `You currently have ${pendingLeaves} pending leave requests to review.`;
    }

    res.status(200).json({ status: 'success', data: { reply } });
  } catch (error) {
    next(error);
  }
};
