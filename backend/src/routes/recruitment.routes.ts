import { Router } from 'express';
import { createJob, getJobs, applyForJob, updateCandidateStage } from '../controllers/recruitment.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public endpoint for applying
router.post('/:jobId/apply', applyForJob);

router.use(protect);
router.use(restrictTo('HR_MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN'));

router.post('/jobs', createJob);
router.get('/jobs', getJobs);
router.put('/candidates/:id/stage', updateCandidateStage);

export default router;
