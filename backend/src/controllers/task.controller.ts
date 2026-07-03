import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, id: assignedById } = req.user as any;
    const { title, description, priority, dueDate, assignedToId } = req.body;

    const task = await prisma.task.create({
      data: {
        companyId,
        title,
        description,
        priority,
        status: 'TODO',
        dueDate: new Date(dueDate),
        assignedToId,
        assignedById
      }
    });

    res.status(201).json({ status: 'success', data: { task } });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    
    const tasks = await prisma.task.findMany({
      where: { companyId, deletedAt: null },
      include: {
        assignee: { select: { firstName: true, lastName: true, photo: true } },
        assigner: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { tasks } });
  } catch (error) {
    next(error);
  }
};

export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, employeeId } = req.user as any;

    if (!employeeId) return next(new AppError('No employee profile linked', 400));
    
    const tasks = await prisma.task.findMany({
      where: { companyId, assignedToId: employeeId, deletedAt: null },
      include: {
        assigner: { select: { email: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.status(200).json({ status: 'success', data: { tasks } });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findFirst({ where: { id, companyId } });
    if (!task) return next(new AppError('Task not found', 404));

    const updated = await prisma.task.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ status: 'success', data: { task: updated } });
  } catch (error) {
    next(error);
  }
};
