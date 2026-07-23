const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.json([]);
    
    let allNotifs = [];

    // Find matching employee by email (case insensitive matching)
    const employees = await prisma.employee.findMany();
    const employee = employees.find(e => e.email.toLowerCase().trim() === user.email.toLowerCase().trim());
    
    if (employee) {
      const notifs = await prisma.notification.findMany({
        where: { userId: employee.id },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      allNotifs = [...notifs];
    }
    
    // If the logged in user is Admin or HR, also fetch pending queries from QueryBox
    if (user.role === 'admin' || user.role === 'hr') {
      const queries = await prisma.queryBox.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      
      const queryNotifs = queries.map(q => ({
        id: `query-${q.id}`, // Unique ID key for frontend mapping
        title: q.isAnonymous ? 'Anonymous Query/Feedback' : `Query from ${q.name || 'User'}`,
        message: q.message,
        type: 'warning', // Shows in amber
        createdAt: q.createdAt,
        read: false,
        isQuery: true
      }));
      
      allNotifs = [...queryNotifs, ...allNotifs];
    }

    // Sort combined list by createdAt descending
    allNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(allNotifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.json({ success: true });

    const employees = await prisma.employee.findMany();
    const employee = employees.find(e => e.email.toLowerCase().trim() === user.email.toLowerCase().trim());
    
    if (employee) {
      await prisma.notification.updateMany({
        where: { userId: employee.id, read: false },
        data: { read: true }
      });
    }

    if (user.role === 'admin' || user.role === 'hr') {
      await prisma.queryBox.updateMany({
        where: { status: 'pending' },
        data: { status: 'reviewed' }
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const idStr = req.params.id;
    if (idStr.startsWith('query-')) {
      const realId = parseInt(idStr.replace('query-', ''));
      const updated = await prisma.queryBox.update({
        where: { id: realId },
        data: { status: 'reviewed' }
      });
      res.json(updated);
    } else {
      const id = parseInt(idStr);
      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
      res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
