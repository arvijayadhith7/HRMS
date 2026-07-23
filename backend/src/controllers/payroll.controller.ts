import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const processPayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.body;

    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      include: {
        attendances: {
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0)
            }
          }
        }
      }
    });

    const payrolls = await Promise.all(employees.map(async (emp) => {
      const grossSalary = emp.salary || 0;
      const basicSalary = grossSalary * 0.5;
      const hra = basicSalary * 0.4;
      const conveyance = 1000;
      const medical = 1250;
      const special = grossSalary - (basicSalary + hra + conveyance + medical);
      
      const totalAllowances = conveyance + medical + (special > 0 ? special : 0);
      const deductions = 0; // PF, ESI, PT not applicable for now
      const netSalary = grossSalary - deductions;

      return prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month,
          year,
          basicSalary: basicSalary,
          hra: hra,
          allowances: totalAllowances,
          deductions: deductions,
          netSalary: netSalary,
          status: 'DRAFT'
        }
      });
    }));

    res.status(201).json({ status: 'success', data: { payrolls } });
  } catch (error) {
    next(error);
  }
};

export const getPayrolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;

    let filter: any = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const payrolls = await prisma.payroll.findMany({
      where: filter,
      include: { employee: { select: { firstName: true, lastName: true, empId: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { payrolls } });
  } catch (error) {
    next(error);
  }
};

export const getMyPayrolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = (req as any).user || {};
    
    const payrolls = await prisma.payroll.findMany({
      where: { employeeId, status: { in: ['PROCESSED', 'PAID'] } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    res.status(200).json({ status: 'success', data: { payrolls } });
  } catch (error) {
    next(error);
  }
};
