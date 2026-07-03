import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export const processPayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.user as any;
    const { month, year } = req.body;

    // Very simplified payroll generation based on active employees
    const employees = await prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE', deletedAt: null },
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
      // In a real scenario, basicSalary would come from SalaryComponent mappings or Employee fields.
      // Here we assume a fixed base salary for demonstration.
      const baseSalary = 5000; 
      
      return prisma.payroll.create({
        data: {
          companyId,
          employeeId: emp.id,
          month,
          year,
          basicSalary: baseSalary,
          netSalary: baseSalary, // Assuming no deductions for MVP
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
    const { companyId } = req.user as any;
    const { month, year } = req.query;

    let filter: any = { companyId };
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
    const { companyId, employeeId } = req.user as any;
    
    const payrolls = await prisma.payroll.findMany({
      where: { companyId, employeeId, status: { in: ['PROCESSED', 'PAID'] } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    res.status(200).json({ status: 'success', data: { payrolls } });
  } catch (error) {
    next(error);
  }
};
