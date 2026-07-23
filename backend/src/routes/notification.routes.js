import { Router } from 'express';
import { getNotifications, markAsRead, createNotification } from '../controllers/notification.controller';
import { protect, restrictTo } from '../middlewares/auth';
const router = Router();
router.use(protect);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/', restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), createNotification);
export default router;
//# sourceMappingURL=notification.routes.js.map