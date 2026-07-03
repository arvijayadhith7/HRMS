import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    
    const employees = await prisma.employee.findMany({
      where: { companyId, deletedAt: null },
      include: {
        department: true,
        location: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });

    res.status(200).json({ status: 'success', data: { employees } });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        department: true,
        location: true,
        reportingManager: { select: { id: true, firstName: true, lastName: true } },
        subordinates: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    res.status(200).json({ status: 'success', data: { employee } });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const {
      empId, firstName, lastName, email, phone, departmentId,
      designation, joinDate, locationId, reportingManagerId
    } = req.body;

    const existingEmp = await prisma.employee.findFirst({
      where: { companyId, OR: [{ email }, { empId }] }
    });

    if (existingEmp) {
      return next(new AppError('Employee with this email or empId already exists', 400));
    }

    const employee = await prisma.employee.create({
      data: {
        companyId,
        empId,
        firstName,
        lastName,
        email,
        phone,
        departmentId,
        designation,
        joinDate: new Date(joinDate),
        locationId,
        reportingManagerId,
      }
    });

    res.status(201).json({ status: 'success', data: { employee } });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return next(new AppError('Employee not found', 404));

    const updated = await prisma.employee.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({ status: 'success', data: { employee: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({ where: { id, companyId } });
    if (!employee) return next(new AppError('Employee not found', 404));

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'TERMINATED' },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
