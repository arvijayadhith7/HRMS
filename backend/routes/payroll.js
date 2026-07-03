const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/payroll - Fetch payroll records
router.get('/', async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    const where = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (employeeId) where.employeeId = parseInt(employeeId);

    const payrolls = await prisma.payroll.findMany({
      where,
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payroll/generate - Generate payroll for all active employees for a given month/year
router.post('/generate', async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ error: 'Month and year are required' });

    const m = parseInt(month);
    const y = parseInt(year);

    // Get active employees
    const employees = await prisma.employee.findMany({
      where: { status: 'active' }
    });

    const generated = [];
    for (const emp of employees) {
      // Check if payroll already exists for this employee, month, and year
      const existing = await prisma.payroll.findFirst({
        where: { employeeId: emp.id, month: m, year: y }
      });

      if (!existing) {
        // HRA is typically 40% of basic, other allowances 10%, deductions 5% (simple defaults inspired by Frappe)
        const basicSalary = emp.salary * 0.5; // Basic is 50% of gross
        const hra = emp.salary * 0.2;         // HRA is 20%
        const allowances = emp.salary * 0.3;  // Allowances 30%
        
        // Let's count unpaid leaves to subtract from salary
        const unpaidLeaves = await prisma.leave.findMany({
          where: {
            employeeId: emp.id,
            leaveType: 'unpaid',
            status: 'approved',
            fromDate: { lte: new Date(y, m, 0) }, // approximate check for month/year
            toDate: { gte: new Date(y, m - 1, 1) }
          }
        });

        // Simple calculation: subtract 1/30th of salary per day of unpaid leave
        let leaveDays = 0;
        unpaidLeaves.forEach(l => {
          const diffTime = Math.abs(l.toDate - l.fromDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          leaveDays += diffDays;
        });

        const deductions = leaveDays > 0 ? (emp.salary / 30) * leaveDays : 0;
        const netSalary = Math.max(0, basicSalary + hra + allowances - deductions);

        const newPayroll = await prisma.payroll.create({
          data: {
            employeeId: emp.id,
            month: m,
            year: y,
            basicSalary,
            hra,
            allowances,
            deductions,
            netSalary,
            status: 'pending'
          },
          include: { employee: true }
        });
        generated.push(newPayroll);
      }
    }

    res.json({
      message: `Payroll generation completed. Generated ${generated.length} payslips.`,
      generated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/payroll/:id - Update payroll status / details
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, hra, allowances, deductions } = req.body;

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: { employee: true }
    });
    if (!payroll) return res.status(404).json({ error: 'Payroll record not found' });

    let data = { status };
    if (status === 'paid') {
      data.paidAt = new Date();
    }

    // Recalculate net salary if values are updated
    if (hra !== undefined || allowances !== undefined || deductions !== undefined) {
      const updatedHra = hra !== undefined ? parseFloat(hra) : payroll.hra;
      const updatedAllowances = allowances !== undefined ? parseFloat(allowances) : payroll.allowances;
      const updatedDeductions = deductions !== undefined ? parseFloat(deductions) : payroll.deductions;
      
      data.hra = updatedHra;
      data.allowances = updatedAllowances;
      data.deductions = updatedDeductions;
      data.netSalary = payroll.basicSalary + updatedHra + updatedAllowances - updatedDeductions;
    }

    const updated = await prisma.payroll.update({
      where: { id },
      data,
      include: { employee: true }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/payroll/:id - Delete payroll record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.payroll.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Payroll record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
