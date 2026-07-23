const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try { res.json(await prisma.document.findMany({ include: { employee: true }})); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await prisma.document.create({ data: req.body })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.document.update({
      where: { id: Number(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try { await prisma.document.delete({ where: { id: Number(req.params.id) } }); res.status(204).send(); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
