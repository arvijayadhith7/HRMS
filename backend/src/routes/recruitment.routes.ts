import { Router } from 'express';
import { createJobOpening, getJobOpenings, updateCandidateStage } from '../controllers/recruitment.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect as any);

router.post('/jobs', restrictTo('HR_MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN') as any, createJobOpening as any);
router.get('/jobs', getJobOpenings as any);
router.put('/candidates/:id/stage', updateCandidateStage);

export default router;
