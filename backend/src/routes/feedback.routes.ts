import { Router } from 'express';
import { createFeedback, getAllFeedback, updateFeedbackStatus } from '../controllers/feedback.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.post('/', createFeedback);
router.get('/', protect, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), getAllFeedback);
router.put('/:id/status', protect, restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), updateFeedbackStatus);

export default router;
