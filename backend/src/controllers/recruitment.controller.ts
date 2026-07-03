import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const { title, description, departmentId, locationId, status } = req.body;

    const job = await prisma.recruitmentJob.create({
      data: {
        companyId,
        title,
        description,
        departmentId,
        locationId,
        status: status || 'OPEN'
      }
    });

    res.status(201).json({ status: 'success', data: { job } });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    
    const jobs = await prisma.recruitmentJob.findMany({
      where: { companyId, deletedAt: null },
      include: {
        candidates: { select: { id: true, stage: true } }
      },
      orderBy: { createdAt: 'desc' }
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
        jobId,
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
    const { companyId } = req.user as any;
    const { id } = req.params;
    const { stage } = req.body;

    const candidate = await prisma.candidate.findFirst({ where: { id, companyId } });
    if (!candidate) return next(new AppError('Candidate not found', 404));

    const updated = await prisma.candidate.update({
      where: { id },
      data: { stage }
    });

    res.status(200).json({ status: 'success', data: { candidate: updated } });
  } catch (error) {
    next(error);
  }
};
