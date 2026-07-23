import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // req.user might be an Employee or a generic User in this system depending on auth middleware
    const userId = (req as any).user.employeeId || (req as any).user.id;
    
    // In this app, Employee is linked to Notification via userId
    // I need to ensure what `userId` represents. Let's assume it's the Employee ID.
    const employee = await prisma.employee.findUnique({
      where: { email: (req as any).user.email }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: employee.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id: Number(id) },
      data: { read: true }
    });

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        title,
        message,
        type: type || 'info'
      }
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
