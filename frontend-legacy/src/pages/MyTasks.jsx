import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { motion } from 'framer-motion';
import { LayoutTemplate, CheckCircle, Calendar } from 'lucide-react';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: emps } = await api.get('/employees');
      const matched = emps.find(e => e.email === user.email);
      if (matched) {
        const { data: tsks } = await api.get(`/tasks/my?employeeId=${matched.id}`);
        setTasks(tsks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-danger/10 text-danger border-danger/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-background text-text-secondary border border-border';
      case 'in_progress': return 'bg-warning/10 text-warning border border-warning/20';
      case 'review': return 'bg-primary/10 text-primary border border-primary/20';
      case 'completed': return 'bg-success/10 text-success border border-success/20';
      default: return 'bg-background text-text-primary border border-border';
    }
  };

  const getPrioritySideColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-primary';
    }
  }

  const pendingTasks = tasks.filter(t => ['pending', 'in_progress', 'review'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">My Tasks</h2>
        <p className="text-sm text-text-secondary mt-1">Manage your operational duties and update their progress.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="bg-surface border border-border rounded-xl h-[120px] animate-pulse"></div>)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border shadow-sm p-12">
          <EmptyState icon="assignment" title="No Assigned Tasks" description="You currently have no tasks. Enjoy your day!" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Pending / Active Tasks */}
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-warning" />
              Active Tasks ({pendingTasks.length})
            </h3>
            
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-text-secondary italic p-4 bg-background rounded-xl border border-border">No active tasks.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingTasks.map((task, index) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={task.id} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${getPrioritySideColor(task.priority)}`}></div>
                    
                    <div className="flex justify-between items-start mb-4 pl-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-text-primary mb-2 pl-3">{task.title}</h4>
                    <p className="text-sm text-text-secondary mb-6 pl-3 flex-1">{task.description}</p>

                    <div className="pl-3 pt-4 border-t border-border flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      
                      <select 
                        value={task.status} 
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border text-text-primary text-xs font-bold rounded-lg outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        <option value="pending">Mark Pending</option>
                        <option value="in_progress">Mark In Progress</option>
                        <option value="review">Submit for Review</option>
                        <option value="completed">Mark Completed</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Completed Tasks ({completedTasks.length})
            </h3>
            
            {completedTasks.length === 0 ? (
              <p className="text-sm text-text-secondary italic p-4 bg-background rounded-xl border border-border">No completed tasks yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTasks.map((task, index) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={task.id} className="bg-background p-6 rounded-xl border border-border flex flex-col opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface text-text-secondary border border-border">
                        {task.priority}
                      </span>
                      <span className="text-xs text-text-secondary line-through flex items-center gap-1">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-text-secondary mb-2 line-through">{task.title}</h4>
                    <p className="text-sm text-text-secondary mb-6 flex-1 line-clamp-2">{task.description}</p>

                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <span className="text-xs font-bold text-success flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                      
                      <select 
                        value={task.status} 
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="px-3 py-1.5 bg-surface border border-border text-text-secondary text-xs font-bold rounded-lg outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        <option value="completed">Completed</option>
                        <option value="in_progress">Reopen (In Progress)</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}