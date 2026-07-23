import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
export const createTask = async (req, res, next) => {
    try {
        const { id: assignedBy } = req.user;
        const { title, description, priority, dueDate, assignedTo } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority,
                status: 'TODO',
                dueDate: new Date(dueDate),
                assignedTo,
                assignedBy
            }
        });
        res.status(201).json({ status: 'success', data: { task } });
    }
    catch (error) {
        next(error);
    }
};
export const getTasks = async (req, res, next) => {
    try {
        const { employeeId } = req.user;
        const tasks = await prisma.task.findMany({
            where: {
                assignedTo: Number(employeeId)
            },
            include: {
                assigner: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ status: 'success', data: { tasks } });
    }
    catch (error) {
        next(error);
    }
};
export const getMyTasks = async (req, res, next) => {
    try {
        const { employeeId } = req.user;
        if (!employeeId)
            return next(new AppError('No employee profile linked', 400));
        const tasks = await prisma.task.findMany({
            where: { assignedTo: employeeId },
            include: {
                assigner: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { dueDate: 'asc' }
        });
        res.status(200).json({ status: 'success', data: { tasks } });
    }
    catch (error) {
        next(error);
    }
};
export const updateTaskStatus = async (req, res, next) => {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const { status } = req.body;
        const task = await prisma.task.findFirst({ where: { id: Number(id) } });
        if (!task)
            return next(new AppError('Task not found', 404));
        const updated = await prisma.task.update({
            where: { id: Number(id) },
            data: { status }
        });
        // A10/B6: Award 10 points on task completion
        if (status === 'COMPLETED' || status === 'completed') {
            if (task.assignedTo) {
                await prisma.employee.update({
                    where: { id: task.assignedTo },
                    data: { points: { increment: 10 } }
                });
            }
        }
        res.status(200).json({ status: 'success', data: { task: updated } });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=task.controller.js.map