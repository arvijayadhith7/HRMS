import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initCronJobs = () => {
  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily birthday check...');
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentDay = today.getDate(); // 1-31

      // Fetch all active employees
      const employees = await prisma.employee.findMany({
        where: {
          status: 'active',
          dateOfBirth: { not: null }
        }
      });

      for (const emp of employees) {
        if (!emp.dateOfBirth) continue;
        
        const dob = new Date(emp.dateOfBirth);
        if (dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay) {
          console.log(`It's ${emp.firstName} ${emp.lastName}'s birthday today!`);
          
          // Create an announcement
          await prisma.announcement.create({
            data: {
              title: `🎉 Happy Birthday, ${emp.firstName}! 🎂`,
              content: `Join us in wishing ${emp.firstName} ${emp.lastName} a very happy birthday today!`,
              priority: 'high',
              isPinned: false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error running daily birthday check:', error);
    }
  });
};
