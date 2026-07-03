const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/reports/summary - Dashboard counters
router.get('/summary', async (req, res) => {
  try {
    const totalEmployees = await prisma.employee.count();
    const activeEmployees = await prisma.employee.count({ where: { status: 'active' } });
    const inactiveEmployees = totalEmployees - activeEmployees;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const todayAttendance = await prisma.attendance.count({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: 'present'
      }
    });

    const absentToday = activeEmployees > 0 ? (activeEmployees - todayAttendance) : 0;

    const employeesOnLeave = await prisma.leave.count({
      where: {
        status: 'approved',
        fromDate: { lte: endOfDay },
        toDate: { gte: startOfDay }
      }
    });

    const pendingLeaves = await prisma.leave.count({ where: { status: 'pending' } });
    const pendingTasks = await prisma.task.count({ where: { status: 'pending' } });
    const completedTasks = await prisma.task.count({ where: { status: 'completed' } });

    // Current month payroll sum
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const payrollSumObj = await prisma.payroll.aggregate({
      where: { month: currentMonth, year: currentYear, status: 'paid' },
      _sum: { netSalary: true }
    });
    const totalPaidPayroll = payrollSumObj._sum.netSalary || 0;

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      todayAttendance,
      absentToday,
      employeesOnLeave,
      pendingLeaves,
      pendingTasks,
      completedTasks,
      totalPaidPayroll
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/departments - Headcount by department
router.get('/departments', async (req, res) => {
  try {
    const counts = await prisma.employee.groupBy({
      by: ['department'],
      _count: { id: true },
      where: { status: 'active' }
    });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/payroll-history - Monthly payroll summaries
router.get('/payroll-history', async (req, res) => {
  try {
    const history = await prisma.payroll.groupBy({
      by: ['year', 'month'],
      _sum: { netSalary: true },
      _count: { id: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/leaves - Leave utilization report
router.get('/leaves', async (req, res) => {
  try {
    const leaves = await prisma.leave.groupBy({
      by: ['leaveType', 'status'],
      _count: { id: true }
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
