import { Router } from 'express';
import { askAssistant } from '../controllers/ai.controller';
import { protect } from '../middlewares/auth';
const router = Router();
router.use(protect);
router.post('/ask', askAssistant);
export default router;
//# sourceMappingURL=ai.routes.js.map