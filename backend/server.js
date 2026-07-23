const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Process-level Crash Prevention
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] 🔥 Shutting down gracefully...', err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] 💥 Shutting down gracefully...', err.name, err.message);
  process.exit(1);
});

// Supabase handles DB connection via .env now
const app = express();
const PORT = process.env.PORT || 3001;

// Helmet config: Allow unsafe-inline for Dev and styles, disable contentSecurityPolicy in Dev mode if needed
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({ origin: true, credentials: true }));
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

// New HR Modules
app.use('/api/performance', require('./routes/performance'));
app.use('/api/training', require('./routes/training'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/exit', require('./routes/exit'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Global Error Handling Middleware (Crash Prevention at the Route Level)
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: 'error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[VirtualNest Backend] Running on http://0.0.0.0:${PORT}`);
});
