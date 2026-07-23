const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// GET /api/employees - Get all employees with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const where = {};

    if (department) {
      where.department = department;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { empId: { contains: search } },
        { email: { contains: search } },
        { designation: { contains: search } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { empId: 'asc' }
    });
    if (req.user.role === 'employee') {
      employees.forEach(e => {
        delete e.salary;
      });
    }
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        payrolls: true,
        leaves: true,
        attendances: true
      }
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (req.user.role === 'employee') {
      const authUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!authUser || employee.email.toLowerCase().trim() !== authUser.email.toLowerCase().trim()) {
        delete employee.salary;
        delete employee.payrolls;
      }
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const bcrypt = require('bcryptjs');

// POST /api/employees - Add employee
router.post('/', restrictTo('admin', 'hr'), async (req, res) => {
  try {
    let { 
      firstName, lastName, email, phone, department, designation, joinDate, 
      salary, status, photo, temporaryPassword, address, emergencyContact, 
      bankDetails, reportingManager 
    } = req.body;
    
    // Auto-generate employee ID (e.g. EMP-001) if not supplied
    let empId = req.body.empId;
    if (!empId) {
      const lastEmp = await prisma.employee.findFirst({ orderBy: { id: 'desc' } });
      const nextNum = lastEmp ? lastEmp.id + 1 : 1;
      empId = `EMP-${String(nextNum).padStart(3, '0')}`;
    }

    // Auto-generate company email if not supplied
    if (!email) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`;
    }

    const emailExists = await prisma.employee.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ error: 'Email already exists for an employee' });

    const empIdExists = await prisma.employee.findUnique({ where: { empId } });
    if (empIdExists) return res.status(400).json({ error: 'Employee ID already exists' });

    // Transaction to create both Employee and User if temporary password is provided
    const result = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          empId, firstName, lastName, email, phone, department, designation,
          joinDate: new Date(joinDate),
          salary: parseFloat(salary),
          status: status || 'active',
          photo, address, emergencyContact, bankDetails, reportingManager
        }
      });

      if (temporaryPassword) {
        const userExists = await tx.user.findUnique({ where: { email } });
        if (!userExists) {
          const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
          await tx.user.create({
            data: { username: email.split('@')[0], email, passwordHash: hashedPassword, role: 'employee' }
          });
        }
      }
      return employee;
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Security check: if employee, they can only update their own non-confidential details
    if (req.user.role === 'employee') {
      const authUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!authUser || employee.email !== authUser.email) {
        return res.status(403).json({ error: 'Unauthorized to edit this profile' });
      }
      
      const { phone, address, emergencyContact, bankDetails, photo } = req.body;
      const updated = await prisma.employee.update({
        where: { id },
        data: { phone, address, emergencyContact, bankDetails, photo }
      });
      return res.json(updated);
    }

    // Admin full update path
    const { 
      firstName, lastName, email, phone, department, designation, joinDate, 
      salary, status, photo, address, emergencyContact, bankDetails, reportingManager 
    } = req.body;

    if (email && email !== employee.email) {
      const emailExists = await prisma.employee.findUnique({ where: { email } });
      if (emailExists) return res.status(400).json({ error: 'Email already exists' });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        firstName, lastName, email, phone, department, designation,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        salary: salary ? parseFloat(salary) : undefined,
        status, photo, address, emergencyContact, bankDetails, reportingManager
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', restrictTo('admin', 'hr'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    // Delete cascading dependencies manually to avoid FK constraint errors
    await prisma.payroll.deleteMany({ where: { employeeId: id } });
    await prisma.leave.deleteMany({ where: { employeeId: id } });
    await prisma.attendance.deleteMany({ where: { employeeId: id } });
    await prisma.task.deleteMany({ where: { assignedTo: id } });
    await prisma.task.deleteMany({ where: { assignedBy: id } });
    await prisma.announcement.deleteMany({ where: { createdBy: id } });
    await prisma.jobOpening.deleteMany({ where: { postedBy: id } });

    // Also delete the associated User account so they can no longer log in
    await prisma.user.deleteMany({ where: { email: emp.email } });

    await prisma.employee.delete({ where: { id } });
    res.json({ success: true, message: 'Employee and related records deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
