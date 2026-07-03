import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.get('/metrics', restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), getDashboardMetrics);

export default router;
