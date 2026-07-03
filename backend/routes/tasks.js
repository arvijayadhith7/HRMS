const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/tasks (Admin: all tasks)
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/my (Employee: my tasks)
router.get('/my', async (req, res) => {
  try {
    const { employeeId } = req.query; // Would normally come from JWT
    const tasks = await prisma.task.findMany({
      where: { assignedTo: Number(employeeId) },
      orderBy: { dueDate: 'asc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        priority: req.body.priority || 'medium'
      }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: req.body
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
