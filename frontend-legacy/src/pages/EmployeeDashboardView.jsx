import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, LogIn, LogOut, Clock, Calendar, CheckSquare, Megaphone, FileText, Activity } from 'lucide-react';

export default function EmployeeDashboardView({ 
  user, 
  stats, 
  checkedInToday, 
  checkedOutToday, 
  checking, 
  lastCheckInTime, 
  handleSelfCheckIn, 
  handleSelfCheckOut, 
  personalBalances, 
  personalLeaves,
  message,
  tasks = [],
  announcements = []
}) {

  const pendingTasks = tasks.filter(t => ['pending', 'in_progress', 'review'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-danger/10 text-danger border-danger/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-surface border-border text-text-secondary';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Greeting Message & Quick Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-border flex items-center justify-center bg-primary/5">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary uppercase">{user?.username?.[0] || 'U'}</span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">
              Good Morning, {user?.username} <span className="text-xl">👋</span>
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Here is your daily snapshot and quick actions.
            </p>
          </div>
        </div>
        
        {/* Quick Check-in Module */}
        <div className="bg-background rounded-xl border border-border p-2 flex items-center gap-4 w-full md:w-auto">
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">Gate Status</p>
            <p className="text-sm font-bold text-text-primary">
              {checkedInToday ? (checkedOutToday ? 'Shift Ended' : 'Checked In') : 'Not Checked In'}
            </p>
          </div>
          <div className="pr-2 flex gap-2">
            <button 
              disabled={checking || checkedInToday} 
              onClick={handleSelfCheckIn} 
              className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 text-sm ${checkedInToday ? 'bg-surface text-text-secondary border border-border opacity-50 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white shadow-sm'}`}
            >
              <LogIn className="w-5 h-5" /> <span>{checking && !checkedInToday ? 'Checking In...' : 'Check In'}</span>
            </button>
            <button 
              disabled={checking || !checkedInToday || checkedOutToday} 
              onClick={handleSelfCheckOut} 
              className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 text-sm ${(!checkedInToday || checkedOutToday) ? 'bg-surface text-text-secondary border border-border opacity-50 cursor-not-allowed' : 'bg-danger hover:bg-danger/90 text-white shadow-sm'}`}
            >
              <LogOut className="w-5 h-5" /> <span>{checking && checkedInToday && !checkedOutToday ? 'Checking Out...' : 'Check Out'}</span>
            </button>
          </div>
        </div>
      </motion.div>
      
      {message && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-primary/5 border border-border rounded-xl text-primary font-medium text-sm">
          {message}
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Assigned Tasks', value: tasks.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/5', link: '/my-tasks' },
          { label: 'Pending Tasks', value: pendingTasks.length, icon: Clock, color: 'text-warning', bg: 'bg-warning/5' },
          { label: 'Work Percentage', value: `${tasks.length === 0 ? 100 : Math.round((completedTasks.length / tasks.length) * 100)}%`, icon: Activity, color: 'text-success', bg: 'bg-success/5' },
          { label: 'Earned Leave', value: personalBalances?.earned?.remaining || 0, icon: Calendar, color: 'text-secondary', bg: 'bg-secondary/5', link: '/leave' }
        ].map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            onClick={() => card.link && (window.location.href = card.link)}
            className={`bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between group transition-shadow hover:shadow-md ${card.link ? 'cursor-pointer' : ''}`}
          >
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">{card.label}</p>
              <h4 className="text-3xl font-bold text-text-primary">{card.value}</h4>
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center ${card.link ? 'group-hover:scale-110' : ''} transition-transform shrink-0`}>
              <card.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed: Tasks & Announcements */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          {/* Active Tasks Widget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface rounded-xl border border-border shadow-sm flex flex-col min-h-[320px]">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Active Tasks
              </h4>
              <a href="/my-tasks" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="flex-1 p-2">
              {pendingTasks.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-background rounded-full border border-border flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-text-secondary" />
                  </div>
                  <h5 className="text-base font-bold text-text-primary mb-1">All Caught Up!</h5>
                  <p className="text-sm text-text-secondary">You have no pending tasks assigned at the moment.</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {pendingTasks.slice(0, 4).map(task => (
                    <div key={task.id} className="p-4 bg-background border border-border rounded-xl transition-colors flex items-center justify-between group cursor-pointer hover:border-primary/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-10 rounded-full ${task.priority === 'critical' ? 'bg-danger' : task.priority === 'high' ? 'bg-warning' : 'bg-primary'}`}></div>
                        <div>
                          <h5 className="text-sm font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">{task.title}</h5>
                          <p className="text-xs text-text-secondary flex items-center gap-3">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Announcements Widget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-secondary" />
                Company Announcements
              </h4>
            </div>
            <div className="p-6">
              {announcements.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-4">No recent announcements.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.slice(0, 3).map(ann => (
                    <div key={ann.id} className="flex gap-4 items-start p-4 bg-background border border-border rounded-xl hover:border-primary/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
                        {ann.type === 'holiday' ? <Calendar className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-text-primary">{ann.title}</h5>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{ann.content}</p>
                        <p className="text-[10px] font-bold text-text-secondary/60 mt-2 uppercase tracking-wider">{new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Sidebar Widgets: Leaves & Balances */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <a href="/leave" className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-secondary transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-text-primary group-hover:text-secondary transition-colors">Apply for Leave</span>
              </a>
              <a href="/attendance" className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">View Shift Logs</span>
              </a>
            </div>
          </motion.div>

          {/* Leave Balances */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-6">Leave Balances</h4>
            <div className="space-y-6">
              {['casual', 'sick', 'earned'].map(k => {
                if (!personalBalances[k]) return null;
                const bal = personalBalances[k];
                const pct = Math.min(100, ((bal.limit - bal.remaining) / bal.limit) * 100);
                const colorClass = k === 'sick' ? 'bg-danger' : k === 'earned' ? 'bg-secondary' : 'bg-primary';
                
                return (
                  <div key={k}>
                    <div className="flex justify-between text-xs font-bold capitalize mb-2">
                      <span className="text-text-primary flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                        {k} Leave
                      </span>
                      <span className="text-text-secondary">{bal.remaining} / {bal.limit}</span>
                    </div>
                    <div className="w-full bg-background border border-border h-2.5 rounded-full overflow-hidden p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                        className={`h-full rounded-full ${colorClass}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
