import { Router } from 'express';
import { getDashboardMetrics, getDashboardSummary, getDepartmentDistribution } from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middlewares/auth';
const router = Router();
router.use(protect);
router.get('/metrics', restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), getDashboardMetrics);
router.get('/summary', getDashboardSummary);
router.get('/departments', restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), getDepartmentDistribution);
export default router;
//# sourceMappingURL=dashboard.routes.js.map