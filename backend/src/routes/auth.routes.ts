import { Router } from 'express';
import { registerCompany, login, refresh, logout } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { registerCompanySchema, loginSchema } from '../validators/auth.validator';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many attempts from this IP, please try again after 15 minutes',
});

router.post('/register-company', validate(registerCompanySchema), registerCompany);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
