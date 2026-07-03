const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/attendance - List attendance logs
router.get('/', async (req, res) => {
  try {
    const { employeeId, date, fromDate, toDate } = req.query;
    const where = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    
    if (date) {
      const d = new Date(date);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      where.date = { gte: start, lte: end };
    } else if (fromDate && toDate) {
      where.date = {
        gte: new Date(fromDate),
        lte: new Date(toDate)
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' }
    });
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/check-in - Check-in for current day
router.post('/check-in', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Check if check-in already exists today
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: parseInt(employeeId),
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already checked in for today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parseInt(employeeId),
        date: startOfDay,
        checkIn: now,
        status: 'present'
      },
      include: { employee: true }
    });

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/check-out - Check-out for current day
router.post('/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Find today's check-in
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: parseInt(employeeId),
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (!existing) {
      return res.status(400).json({ error: 'No check-in record found for today' });
    }

    if (existing.checkOut) {
      return res.status(400).json({ error: 'Already checked out for today' });
    }

    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: now
      },
      include: { employee: true }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/log - Manual log by admin/HR
router.post('/log', async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status } = req.body;
    if (!employeeId || !date) return res.status(400).json({ error: 'Employee and Date are required' });

    const d = new Date(date);
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

    // Check if log already exists
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: parseInt(employeeId),
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    const data = {
      employeeId: parseInt(employeeId),
      date: startOfDay,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status: status || 'present'
    };

    let result;
    if (existing) {
      result = await prisma.attendance.update({
        where: { id: existing.id },
        data,
        include: { employee: true }
      });
    } else {
      result = await prisma.attendance.create({
        data,
        include: { employee: true }
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/attendance/:id - Delete an attendance record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.attendance.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
