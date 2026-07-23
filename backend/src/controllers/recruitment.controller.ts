import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const createJobOpening = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, department, requirements, status } = req.body;

    const job = await prisma.jobOpening.create({
      data: {
        title,
        description,
        department,
        requirements,
        status: status || 'OPEN'
      }
    });

    res.status(201).json({ status: 'success', data: { job } });
  } catch (error) {
    next(error);
  }
};

export const getJobOpenings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const jobs = await prisma.jobOpening.findMany({
      include: {
        candidates: { select: { id: true, status: true } }
      },
      orderBy: { postedAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const applyForJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This could be a public endpoint where companyId is passed via params or headers
    const { companyId } = req.body;
    const { jobId } = req.params;
    const { firstName, lastName, email, phone, resumeUrl } = req.body;

    const candidate = await prisma.candidate.create({
      data: {
        companyId,
        jobId: Number(jobId),
        firstName,
        lastName,
        email,
        phone,
        resumeUrl,
        stage: 'APPLIED'
      }
    });

    res.status(201).json({ status: 'success', data: { candidate } });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: candidateId } = req.params;
    const { status } = req.body;

    const candidate = await prisma.candidate.findFirst({ where: { id: Number(candidateId) } });
    if (!candidate) return next(new AppError('Candidate not found', 404));

    const updated = await prisma.candidate.update({
      where: { id: Number(candidateId) },
      data: { status }
    });

    res.status(200).json({ status: 'success', data: { candidate: updated } });
  } catch (error) {
    next(error);
  }
};
