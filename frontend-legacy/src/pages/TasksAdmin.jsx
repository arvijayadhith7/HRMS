import { motion } from 'framer-motion';
import { CheckCircle, Clock, Edit3, LayoutTemplate, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

export default function TasksAdmin() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'pending', dueDate: '', assignedTo: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [taskRes, empRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/employees')
      ]);
      setTasks(taskRes.data);
      setEmployees(empRes.data.filter(e => e.status === 'active'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assignedTo: parseInt(formData.assignedTo),
        dueDate: new Date(formData.dueDate).toISOString(),
        assignedBy: user.id
      };
      await api.post('/tasks', payload);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const columns = [
    { id: 'pending', label: 'Pending', icon: <LayoutTemplate className="w-5 h-5 text-primary" />, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'in_progress', label: 'In Progress', icon: <Clock className="w-5 h-5 text-warning" />, color: 'text-warning', bg: 'bg-warning/10' },
    { id: 'review', label: 'In Review', icon: <Edit3 className="w-5 h-5 text-danger" />, color: 'text-danger', bg: 'bg-danger/10' },
    { id: 'completed', label: 'Completed', icon: <CheckCircle className="w-5 h-5 text-success" />, color: 'text-success', bg: 'bg-success/10' }
  ];



  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Task Management</h2>
          <p className="text-sm text-text-secondary mt-1">Assign and monitor operational goals.</p>
        </div>
        
        <button
          onClick={() => {
            setFormData({ title: '', description: '', status: 'pending', dueDate: '', assignedTo: '' });
            setShowModal(true);
          }}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-opacity-90 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
          {[1,2,3,4].map(i => <div key={i} className="bg-surface border border-border rounded-xl h-full min-h-[500px] animate-pulse"></div>)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-surface border border-border rounded-xl p-12">
          <EmptyState icon="assignment" title="No tasks found" description="Create a task to get your team moving." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 items-start">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="bg-background rounded-xl border border-border p-4 flex flex-col min-h-[60vh]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${col.color}`}>
                    <div className={`p-1.5 rounded-lg ${col.bg}`}>
                      {col.icon}
                    </div>
                    {col.label}
                  </h3>
                  <span className="bg-surface px-2.5 py-1 rounded-full text-xs font-bold text-text-secondary border border-border">{colTasks.length}</span>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-4">
                  {colTasks.map((task, index) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={task.id} className="bg-surface p-4 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-text-secondary">{new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary mb-2 leading-tight">{task.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                      
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        {task.employee?.photo ? (
                          <img src={task.employee.photo} alt="Assignee" className="w-6 h-6 rounded-full object-cover border border-border" title={task.employee.firstName} />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]" title={task.employee?.firstName}>
                            {task.employee?.firstName?.[0]}
                          </div>
                        )}
                        <span className="text-xs font-bold text-text-primary">{task.employee?.firstName} {task.employee?.lastName}</span>
                      </div>
                    </motion.div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-border rounded-xl text-text-secondary text-xs font-medium">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b border-border bg-surface">
              <h4 className="text-xl font-bold text-text-primary tracking-tight">Create New Task</h4>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-secondary hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Task Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Q3 Marketing Report" className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Assign To</label>
                  <select required value={formData.assignedTo} onChange={e => setFormData(p => ({ ...p, assignedTo: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors">
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Due Date</label>
                  <input type="date" required value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
                </div>



                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Initial Status</label>
                  <select required value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-background text-text-primary text-sm font-bold rounded-lg border border-border transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}