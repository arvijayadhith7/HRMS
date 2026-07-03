import { Router } from 'express';
import { applyLeave, getMyLeaves, getLeaveBalances, updateLeaveStatus } from '../controllers/leave.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/balances', getLeaveBalances);

router.put('/:id/status', restrictTo('HR_MANAGER', 'COMPANY_ADMIN'), updateLeaveStatus);

export default router;
