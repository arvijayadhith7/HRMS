const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Strict Rate Limiter for Login (Brute-force mitigation)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});


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

    // Ensure Admin employee record exists
    const adminEmp = await prisma.employee.findUnique({ where: { email: 'admin@virtualnest.com' } });
    if (!adminEmp) {
      await prisma.employee.create({
        data: {
          empId: 'EMP-ADMIN',
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@virtualnest.com',
          department: 'Administration',
          designation: 'Administrator',
          joinDate: new Date(),
          salary: 0,
          status: 'active'
        }
      });
    }

    // Ensure HR employee record exists
    const hrEmp = await prisma.employee.findUnique({ where: { email: 'HR@vn.com' } });
    if (!hrEmp) {
      await prisma.employee.create({
        data: {
          empId: 'EMP-HR',
          firstName: 'HR',
          lastName: 'Manager',
          email: 'HR@vn.com',
          department: 'Human Resources',
          designation: 'HR Manager',
          joinDate: new Date(),
          salary: 0,
          status: 'active'
        }
      });
    }

    console.log('[Auth] Admin/HR accounts and employee records verified.');
  } catch (err) {
    console.error('[Auth] Failed to seed default accounts/employees: ', err);
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
router.post('/login', loginLimiter, async (req, res) => {
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

    // Alert all HR & Admin employee accounts about password change
    try {
      const hrAdmins = await prisma.user.findMany({
        where: { role: { in: ['admin', 'hr'] } }
      });
      for (const u of hrAdmins) {
        const emp = await prisma.employee.findFirst({
          where: { email: { equals: u.email, mode: 'insensitive' } }
        });
        if (emp) {
          await prisma.notification.create({
            data: {
              userId: emp.id,
              title: 'Security Alert: Password Changed',
              message: `Employee "${user.username}" (${user.email}) has successfully changed their password.`,
              type: 'warning'
            }
          });
        }
      }
    } catch (notifErr) {
      console.error('Failed to send password change notifications:', notifErr);
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
