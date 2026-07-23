import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, contact, message, isAnonymous } = req.body;

    const ticket = await prisma.queryBox.create({
      data: {
        name,
        contact,
        message,
        isAnonymous: isAnonymous || true,
        status: 'pending'
      }
    });

    res.status(201).json({ status: 'success', data: { ticket } });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tickets = await prisma.queryBox.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { tickets } });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await prisma.queryBox.findFirst({ where: { id: Number(id) } });
    if (!ticket) return next(new AppError('Ticket not found', 404));

    const updated = await prisma.queryBox.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.status(200).json({ status: 'success', data: { ticket: updated } });
  } catch (error) {
    next(error);
  }
};
