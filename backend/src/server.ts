import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import payrollRoutes from './routes/payroll.routes';
import taskRoutes from './routes/task.routes';
import recruitmentRoutes from './routes/recruitment.routes';
import helpdeskRoutes from './routes/helpdesk.routes';
import aiRoutes from './routes/ai.routes';
import dashboardRoutes from './routes/dashboard.routes';
import feedbackRoutes from './routes/feedback.routes';
import notificationRoutes from './routes/notification.routes';

import { createServer } from 'http';
import { initSocket } from './socket';
import { initCronJobs } from './utils/cronJobs';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Initialize Cron Jobs
initCronJobs();

// Middlewares
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/recruitment', recruitmentRoutes);
app.use('/api/v1/helpdesk', helpdeskRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Base route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

const PORT = env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 VirtualNest Backend running on port ${PORT} in ${env.NODE_ENV} mode`);
});
