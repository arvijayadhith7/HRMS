import { Router } from 'express';
import { createTask, getTasks, getMyTasks, updateTaskStatus } from '../controllers/task.controller';
import { protect, restrictTo } from '../middlewares/auth';
const router = Router();
router.use(protect);
router.get('/my', getMyTasks);
router.put('/:id/status', updateTaskStatus);
router.post('/', restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), createTask);
router.get('/', restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), getTasks);
export default router;
//# sourceMappingURL=task.routes.js.map