import { Router } from 'express';
import { createJobOpening, getJobOpenings, updateCandidateStage } from '../controllers/recruitment.controller';
import { protect, restrictTo } from '../middlewares/auth';
const router = Router();
router.use(protect);
router.post('/jobs', restrictTo('HR_MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN'), createJobOpening);
router.get('/jobs', getJobOpenings);
router.put('/candidates/:id/stage', updateCandidateStage);
export default router;
//# sourceMappingURL=recruitment.routes.js.map