const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/helpdesk - Submit a support query
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, isAnonymous, contact, name } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let queryName = name;
    let queryContact = contact;
    if (!isAnonymous && req.user) {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (user) {
        queryName = user.username;
        queryContact = user.email;
      }
    }

    const query = await prisma.queryBox.create({
      data: {
        message,
        isAnonymous: !!isAnonymous,
        name: queryName || null,
        contact: queryContact || null,
        status: 'pending'
      }
    });

    res.status(201).json(query);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
