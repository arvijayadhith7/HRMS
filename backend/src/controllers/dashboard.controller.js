import { prisma } from '../config/db';
export const getDashboardMetrics = async (req, res, next) => {
    try {
        const { employeeId } = req.user || {};
        const [totalEmployees, leaves, pendingQueries, openJobs] = await Promise.all([
            prisma.employee.count({ where: { status: 'active' } }),
            prisma.leave.findMany({ where: { status: 'pending' } }),
            prisma.queryBox.count({ where: { status: 'pending' } }),
            prisma.jobOpening.count({ where: { status: 'open' } })
        ]);
        // Generate actionable insights
        let message = 'All systems operational.';
        if (leaves.length > 5) {
            message = `You have ${leaves.length} pending leave requests requiring attention.`;
        }
        else if (pendingQueries > 3) {
            message = `There are ${pendingQueries} unresolved queries from employees/public.`;
        }
        res.status(200).json({
            status: 'success',
            data: {
                totalEmployees,
                pendingLeaves: leaves.length,
                openTickets: pendingQueries,
                openJobs,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const getDashboardSummary = async (req, res, next) => {
    try {
        const totalEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
        const leaves = await prisma.leave.findMany({ where: { status: 'PENDING' } });
        const topEmployees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { points: 'desc' },
            take: 3,
            select: { id: true, firstName: true, lastName: true, points: true, designation: true }
        });
        // Stub some stats for the UI
        res.status(200).json({
            totalEmployees,
            activeEmployees: totalEmployees,
            inactiveEmployees: 0,
            todayAttendance: totalEmployees - leaves.length,
            absentToday: leaves.length,
            employeesOnLeave: leaves.length,
            pendingLeaves: leaves.length,
            pendingTasks: 5,
            completedTasks: 12,
            totalPaidPayroll: 150000,
            attendanceTrend: [85, 88, 92, 90, 95, 0, 0],
            topEmployees
        });
    }
    catch (error) {
        next(error);
    }
};
export const getDepartmentDistribution = async (req, res, next) => {
    try {
        const counts = await prisma.employee.groupBy({
            by: ['department'],
            _count: { id: true },
            where: { status: 'ACTIVE' }
        });
        // Filter out null departments just in case
        const validCounts = counts.filter(c => c.department);
        res.status(200).json(validCounts);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=dashboard.controller.js.map