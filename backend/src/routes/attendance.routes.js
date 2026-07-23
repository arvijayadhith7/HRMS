import { Router } from 'express';
import { checkIn, checkOut, getMyAttendance } from '../controllers/attendance.controller';
import { protect, restrictTo } from '../middlewares/auth';
const router = Router();
router.use(protect);
router.use(restrictTo('EMPLOYEE', 'HR_MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN'));
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);
export default router;
//# sourceMappingURL=attendance.routes.js.map