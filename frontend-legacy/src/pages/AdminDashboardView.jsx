import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Clock, CreditCard, ChevronRight, Megaphone, Calendar, TrendingUp, X } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';

export default function AdminDashboardView({ stats, employees, announcements, departmentCounts }) {
  const chartRef = useRef(null);
  const deptChartRef = useRef(null);
  const chartInstance = useRef(null);
  const deptChartInstance = useRef(null);

  const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [taskLoading, setTaskLoading] = useState(false);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setTaskLoading(true);
    try {
      await api.post('/tasks', {
        ...taskForm,
        assignedTo: selectedEmployeeForTask.id,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined
      });
      alert('Task assigned successfully!');
      setSelectedEmployeeForTask(null);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign task');
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    // Attendance Trend Chart
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Attendance Rate',
            data: stats?.attendanceTrend || [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#111827',
            backgroundColor: 'rgba(17, 24, 39, 0.03)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#111827',
            pointBorderWidth: 1.5,
            pointRadius: 3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 60, max: 100, grid: { color: '#F3F4F6' }, ticks: { color: '#6B7280' } },
            x: { grid: { display: false }, ticks: { color: '#6B7280' } }
          }
        }
      });
    }

    // Department Distribution Chart
    if (deptChartRef.current && departmentCounts && departmentCounts.length > 0) {
      if (deptChartInstance.current) deptChartInstance.current.destroy();
      const ctx = deptChartRef.current.getContext('2d');
      deptChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: departmentCounts.map(d => d.department),
          datasets: [{
            data: departmentCounts.map(d => d._count.id),
            backgroundColor: ['#111827', '#4B5563', '#9CA3AF', '#10B981', '#EF4444'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#111827', font: { family: 'Inter', size: 11 } } }
          },
          cutout: '75%'
        }
      });
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
      if (deptChartInstance.current) deptChartInstance.current.destroy();
    };
  }, [departmentCounts]);

  const kpiCards = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/5', trend: '+12%', trendUp: true },
    { label: 'Attendance Rate', value: `${Math.round(((stats?.todayAttendance || 0)/(stats?.activeEmployees || 1))*100)}%`, icon: CheckCircle, color: 'text-success', bg: 'bg-success/5', trend: '+2.4%', trendUp: true },
    { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: Clock, color: 'text-warning', bg: 'bg-warning/5', trend: '-5%', trendUp: false },
    { label: 'Monthly Payroll', value: '$' + ((stats?.totalPaidPayroll || 0)/1000).toFixed(1) + 'k', icon: CreditCard, color: 'text-primary', bg: 'bg-primary/5', trend: '+8%', trendUp: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Good Morning, Admin</h2>
          <p className="text-text-secondary mt-1">Here's what's happening at your company today.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-4 md:mt-0 flex items-center gap-4">
          <button className="px-5 py-2.5 bg-surface border border-border text-text-primary rounded-xl font-medium hover:bg-background transition-colors shadow-sm">
            Export Report
          </button>
        </motion.div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${card.trendUp ? 'text-success' : 'text-danger'}`}>
                {card.trend}
                <TrendingUp className={`w-4 h-4 ${!card.trendUp && 'rotate-180'}`} />
              </div>
            </div>
            <div>
              {stats ? (
                <div className="text-3xl font-bold text-text-primary mb-1">{card.value}</div>
              ) : (
                <SkeletonLoader width="80px" height="36px" className="mb-1" />
              )}
              <span className="text-sm text-text-secondary font-medium">{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Analytics Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col h-[420px]"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Attendance Trend</h3>
              <p className="text-sm text-text-secondary">7-day company-wide attendance</p>
            </div>
          </div>
          <div className="relative flex-1 w-full">
            <canvas ref={chartRef}></canvas>
          </div>
        </motion.div>

        {/* Department Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col h-[420px]"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text-primary">Department Performance</h3>
            <p className="text-sm text-text-secondary">Headcount distribution</p>
          </div>
          <div className="relative flex-1 flex items-center justify-center">
            {departmentCounts && departmentCounts.length > 0 ? (
              <canvas ref={deptChartRef}></canvas>
            ) : (
              <EmptyState icon={Users} title="No Data" description="No department data available." />
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hires */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col max-h-[400px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary">Recent Hires</h3>
            <button className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {!employees ? (
              <div className="space-y-4"><SkeletonLoader count={3} height="60px" /></div>
            ) : employees.length > 0 ? (
              <ul className="space-y-3">
                {employees.map((emp, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (idx*0.1) }}
                    key={emp.id} className="p-3 bg-background rounded-xl border border-border flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedEmployeeForTask(emp)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {emp.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-text-secondary">{emp.designation}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                  </motion.li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Users} title="No Recent Hires" description="No new employees." />
            )}
          </div>
        </motion.div>

        {/* Company Announcements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col max-h-[400px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary">Announcements</h3>
            <button className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {!announcements ? (
              <div className="space-y-4"><SkeletonLoader count={3} height="60px" /></div>
            ) : announcements.length > 0 ? (
              <ul className="space-y-3">
                {announcements.map((ann, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + (idx*0.1) }}
                    key={idx} className="p-4 bg-background rounded-xl border border-border flex gap-4 items-start hover:border-primary/50 transition-colors"
                  >
                    <div className="p-2 bg-primary-dark/10 rounded-xl text-primary-dark flex-shrink-0">
                      {ann.type === 'holiday' ? <Calendar className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary mb-1">{ann.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{ann.content}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Megaphone} title="No Announcements" description="All caught up!" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Task Assignment Modal */}
      <AnimatePresence>
        {selectedEmployeeForTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-text-primary">Assign Task</h3>
                <button onClick={() => setSelectedEmployeeForTask(null)} className="p-2 hover:bg-surface rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAssignTask} className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {selectedEmployeeForTask.firstName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{selectedEmployeeForTask.firstName} {selectedEmployeeForTask.lastName}</p>
                    <p className="text-xs text-text-secondary">Assigning to {selectedEmployeeForTask.designation}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Task Title</label>
                  <input required type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm" placeholder="e.g. Complete onboarding docs" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Description</label>
                  <textarea rows="3" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm resize-none" placeholder="Task details..."></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Priority</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Due Date</label>
                    <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full bg-background border border-border text-text-primary rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm" />
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => setSelectedEmployeeForTask(null)} className="px-5 py-2.5 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={taskLoading} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                    {taskLoading ? 'Assigning...' : 'Assign Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
