const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings
router.post('/', async (req, res) => {
  try {
    const { key, value, settings } = req.body;
    if (settings && Array.isArray(settings)) {
      const results = [];
      for (const s of settings) {
        const setting = await prisma.setting.upsert({
          where: { key: s.key },
          update: { value: s.value !== undefined && s.value !== null ? String(s.value) : '' },
          create: { key: s.key, value: s.value !== undefined && s.value !== null ? String(s.value) : '' }
        });
        results.push(setting);
      }
      return res.status(200).json(results);
    } else {
      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
      }
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value: value !== undefined && value !== null ? String(value) : '' },
        create: { key, value: value !== undefined && value !== null ? String(value) : '' }
      });
      return res.status(200).json(setting);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
