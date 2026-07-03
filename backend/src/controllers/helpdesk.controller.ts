import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;
    const { subject, description, priority } = req.body;

    if (!employeeId) return next(new AppError('No employee profile linked', 400));

    const ticket = await prisma.ticket.create({
      data: {
        companyId,
        subject,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        requesterId: employeeId
      }
    });

    res.status(201).json({ status: 'success', data: { ticket } });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    
    const tickets = await prisma.ticket.findMany({
      where: { companyId, deletedAt: null },
      include: {
        requester: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { tickets } });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const { id } = req.params;
    const { status, assignedToId } = req.body;

    const ticket = await prisma.ticket.findFirst({ where: { id, companyId } });
    if (!ticket) return next(new AppError('Ticket not found', 404));

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status, assignedToId }
    });

    res.status(200).json({ status: 'success', data: { ticket: updated } });
  } catch (error) {
    next(error);
  }
};
