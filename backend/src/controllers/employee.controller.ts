import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        payrolls: true,
      },
    });

    res.status(200).json({ status: 'success', data: { employees } });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user || {};
    const { id } = req.params;

    // Enforce data isolation for regular employees
    if (user.role === 'employee' && user.employeeId !== Number(id)) {
      return next(new AppError('Forbidden: You can only view your own profile.', 403));
    }

    const employee = await prisma.employee.findFirst({
      where: { id: Number(id) }
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
    const {
      empId, firstName, lastName, email, phone, department,
      designation, joinDate, salary
    } = req.body;

    const existingEmp = await prisma.employee.findFirst({
      where: { OR: [{ email }, { empId }] }
    });

    if (existingEmp) {
      return next(new AppError('Employee with this email or empId already exists', 400));
    }

    const employee = await prisma.employee.create({
      data: {
        empId,
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        joinDate: new Date(joinDate),
        salary: Number(salary)
      }
    });

    res.status(201).json({ status: 'success', data: { employee } });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({ where: { id: Number(id) } });
    if (!employee) return next(new AppError('Employee not found', 404));

    const updated = await prisma.employee.update({
      where: { id: Number(id) },
      data: req.body,
    });

    res.status(200).json({ status: 'success', data: { employee: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findFirst({ where: { id: Number(id) } });
    if (!employee) return next(new AppError('Employee not found', 404));

    await prisma.employee.update({
      where: { id: Number(id) },
      data: { status: 'inactive' },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
