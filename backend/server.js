require('dotenv').config();

// Programmatic fallback for DATABASE_URL if Render env is not set
// NOTE: Set DATABASE_URL in your hosting platform (Render/Vercel env vars or .env file
// Example Supabase format: postgresql://user:password@pooler.supabase.com:5432/postgres
if (!process.env.DATABASE_URL) {
  console.warn('[WARN] DATABASE_URL not set. Please configure it in your environment before starting.');
}

// Auto-upgrade direct IPv6 host to IPv4 pooler if used on port 5432, since Render does not support IPv6 outbound.
if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('.supabase.co:5432') || process.env.DATABASE_URL.includes('.supabase.co:6543'))) {
  const match = process.env.DATABASE_URL.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:(?:5432|6543)\/postgres/);
  if (match) {
    const [, user, pass, ref] = match;
    // Map project refs to their correct regions (otadwpqtlkngcphhcprh is ap-southeast-1, others default to ap-northeast-1 Tokyo)
    const region = ref === 'otadwpqtlkngcphhcprh' ? 'ap-southeast-1' : 'ap-northeast-1';
    process.env.DATABASE_URL = `postgresql://${user}.${ref}:${pass}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
  }
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const prisma = require('./lib/prisma');

// Process-level Resilience: log errors but keep the server alive so
// transient DB / Prisma issues don't cause crash-loops.
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err?.name, err?.message, err?.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err?.name, err?.message);
});

// Supabase handles DB connection via .env now
const app = express();
app.set('trust proxy', 1); // Trust Render's proxy to get real client IP
const PORT = process.env.PORT || 3001;

// Helmet config: Allow unsafe-inline for Dev and styles, disable contentSecurityPolicy in Dev mode if needed
app.use(helmet({
  contentSecurityPolicy: false
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('file://')) {
      callback(null, true);
    } else if (/\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// Global Rate Limiter for DDoS mitigation
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/helpdesk', require('./routes/helpdesk'));
app.use('/api/feedback', require('./routes/feedback'));

// New HR Modules
app.use('/api/performance', require('./routes/performance'));
app.use('/api/training', require('./routes/training'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/exit', require('./routes/exit'));

// Health endpoint for Render / load balancer health checks.
app.get('/api/health', async (req, res) => {
  let db = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    db = 'down';
  }
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    db,
    time: new Date().toISOString(),
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handling Middleware (Crash Prevention at the Route Level)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : err.message,
    status: 'error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[VirtualNest Backend] Running on http://0.0.0.0:${PORT}`);
});
