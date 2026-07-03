import { Router } from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employee.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), updateEmployee)
  .delete(restrictTo('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'), deleteEmployee);

export default router;
