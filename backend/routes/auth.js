const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'virtualnest-secret-change-in-prod';
const SALT_ROUNDS = 12;

// Check and seed default accounts on load
async function ensureDefaultAccountsExist() {
  try {
    const adminHash = await bcrypt.hash('admin@vn', SALT_ROUNDS);
    await prisma.user.upsert({
      where: { email: 'admin@virtualnest.com' },
      update: { passwordHash: adminHash, role: 'admin' },
      create: {
        username: 'admin',
        email: 'admin@virtualnest.com',
        passwordHash: adminHash,
        role: 'admin'
      }
    });
    console.log('[Auth] Admin account verified/updated: admin@virtualnest.com / admin@vn');
  } catch (err) {
    console.error('[Auth] Failed to seed default accounts: ', err);
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role: role || 'employee' }
    });
    res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    await ensureDefaultAccountsExist(); // Ensure default accounts exist
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },
      JWT_SECRET, { expiresIn: '8h' }
    );
    res.json({ accessToken, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect current password' });
    
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash: newHash }
    });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
