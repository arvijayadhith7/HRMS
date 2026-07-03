const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET all job openings
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await prisma.jobOpening.findMany({
      include: { creator: true, candidates: true },
      orderBy: { postedAt: 'desc' }
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET job by ID
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.jobOpening.findUnique({
      where: { id: Number(req.params.id) },
      include: { creator: true, candidates: true }
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new job opening
router.post('/jobs', async (req, res) => {
  try {
    const job = await prisma.jobOpening.create({
      data: {
        title: req.body.title,
        department: req.body.department,
        description: req.body.description,
        requirements: req.body.requirements,
        status: req.body.status || 'open',
        postedBy: req.body.postedBy || null
      }
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update job opening
router.put('/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.jobOpening.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE job opening
router.delete('/jobs/:id', async (req, res) => {
  try {
    await prisma.jobOpening.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET candidates for a job
router.get('/jobs/:id/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { jobId: Number(req.params.id) },
      orderBy: { appliedAt: 'desc' }
    });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new candidate
router.post('/candidates', async (req, res) => {
  try {
    const candidate = await prisma.candidate.create({
      data: {
        jobId: Number(req.body.jobId),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        resumeUrl: req.body.resumeUrl,
        notes: req.body.notes,
        status: req.body.status || 'applied'
      }
    });
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update candidate
router.put('/candidates/:id', async (req, res) => {
  try {
    const candidate = await prisma.candidate.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE candidate
router.delete('/candidates/:id', async (req, res) => {
  try {
    await prisma.candidate.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
