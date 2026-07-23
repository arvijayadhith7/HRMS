import { Router } from 'express';
import { processPayroll, getPayrolls, getMyPayrolls } from '../controllers/payroll.controller';
import { protect, restrictTo } from '../middlewares/auth';
const router = Router();
router.use(protect);
router.get('/my', getMyPayrolls);
router.use(restrictTo('HR_MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN'));
router.post('/process', processPayroll);
router.get('/', getPayrolls);
export default router;
//# sourceMappingURL=payroll.routes.js.map