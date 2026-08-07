const router = require('express').Router();
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

// Optional auth: allow both logged-in + anonymous submissions.
// If a token is present, verify it and attach user; otherwise skip.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ') && JWT_SECRET) {
    try {
      req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    } catch {
      // Token invalid — still allow anonymous submission, just don't set req.user
    }
  }
  next();
}

// POST /api/feedback — public/anonymous query box (QueryBox model)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message, name, contact, isAnonymous } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let finalName = typeof name === 'string' && name.trim() ? name.trim() : null;
    let finalContact = typeof contact === 'string' && contact.trim() ? contact.trim() : null;
    const anon = isAnonymous === true || isAnonymous === 'true' || isAnonymous === 1;

    if (!anon && req.user && req.user.userId) {
      try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (user) {
          if (!finalName) finalName = user.username;
          if (!finalContact) finalContact = user.email;
        }
      } catch {
        // ignore — proceed with submitted values only
      }
    }

    const row = await prisma.queryBox.create({
      data: {
        message: message.trim(),
        name: finalName,
        contact: finalContact,
        isAnonymous: !!anon || !finalName,
        status: 'pending',
      },
    });

    return res.status(201).json(row);
  } catch (err) {
    console.error('[feedback POST] Error:', err.message || err);
    return res.status(500).json({ error: 'Failed to submit query. Please try again.' });
  }
});

module.exports = router;
