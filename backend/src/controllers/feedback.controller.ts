import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { name, contact, message, isAnonymous } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const feedback = await prisma.queryBox.create({
      data: {
        name: isAnonymous ? null : name,
        contact: isAnonymous ? null : contact,
        message,
        isAnonymous: Boolean(isAnonymous),
      }
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.queryBox.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const feedback = await prisma.queryBox.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
