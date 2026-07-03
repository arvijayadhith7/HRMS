import { Router } from 'express';
import { createTicket, getTickets, updateTicketStatus } from '../controllers/helpdesk.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.post('/', createTicket);
router.get('/', getTickets);
router.put('/:id/status', restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), updateTicketStatus);

export default router;
