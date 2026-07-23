import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import { Calendar, Briefcase, Clock, Plane, Check, X, AlertCircle } from 'lucide-react';

export default function Leave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveToApprove, setLeaveToApprove] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const monthlyChartRef = useRef(null);
  const monthlyChartInstance = useRef(null);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      if (user?.role === 'employee') {
        const matched = data.find(e => e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim());
        const filtered = matched ? [matched] : [];
        setEmployees(filtered);
        if (filtered.length > 0) {
          setSelectedEmpId(filtered[0].id);
          setFormData(prev => ({ ...prev, employeeId: filtered[0].id }));
        }
      } else {
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmpId(data[0].id);
          setFormData(prev => ({ ...prev, employeeId: data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.role === 'employee') {
        const { data: emps } = await api.get('/employees');
        const matched = emps.find(e => e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim());
        if (matched) {
          params.employeeId = matched.id;
        }
      }
      const { data } = await api.get('/leave', { params });
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, []);

  const getDaysDiff = (from, to) => {
    const diffTime = Math.abs(new Date(to) - new Date(from));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      
      const monthlyData = new Array(12).fill(0);
      leaves.filter(l => l.status === 'approved').forEach(l => {
        const from = new Date(l.fromDate);
        const to = new Date(l.toDate);
        monthlyData[from.getMonth()] += getDaysDiff(from, to);
      });

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Leave Taken (Days)',
              data: monthlyData,
              borderColor: '#111827',
              backgroundColor: 'rgba(17, 24, 39, 0.03)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#111827',
              pointBorderWidth: 1.5,
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#F3F4F6' }, min: 0, suggestedMax: 10, ticks: { color: '#6B7280', stepSize: 5 } },
            x: { grid: { display: false }, ticks: { color: '#6B7280' } }
          }
        }
      });
    }

    if (monthlyChartRef.current) {
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
      const ctx2 = monthlyChartRef.current.getContext('2d');
      
      const typeData = [0, 0, 0, 0];
      const currMonth = new Date().getMonth();
      leaves.filter(l => l.status === 'approved').forEach(l => {
        const from = new Date(l.fromDate);
        if (from.getMonth() === currMonth) {
          const days = getDaysDiff(from, new Date(l.toDate));
          if (l.leaveType === 'sick') typeData[0] += days;
          else if (l.leaveType === 'casual') typeData[1] += days;
          else if (l.leaveType === 'earned') typeData[2] += days;
          else typeData[3] += days;
        }
      });

      monthlyChartInstance.current = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Sick', 'Casual', 'Earned', 'Unpaid'],
          datasets: [{
            data: typeData,
            backgroundColor: ['#F59E0B', '#8B5CF6', '#10B981', '#6B7280'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 20, color: '#6B7280' } }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
    };
  }, [leaves]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/leave/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update leave status');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/leave', formData);
      fetchLeaves();
      setShowApplyModal(false);
      setFormData(prev => ({
        ...prev,
        fromDate: '',
        toDate: '',
        reason: ''
      }));
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to apply for leave');
    }
  };

  // getDaysDiff moved up for charts

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedLeaves = leaves.filter(l => l.status === 'approved');
  const leaveTakenDays = approvedLeaves.reduce((acc, l) => acc + getDaysDiff(l.fromDate, l.toDate), 0);
  const upcomingTrips = approvedLeaves.filter(l => new Date(l.fromDate) > new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Leave Management</h2>
          <p className="text-sm text-text-secondary mt-1">Manage requests and Company Policies</p>
        </div>
        
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-opacity-90 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm"
        >
          <span>Apply Leave</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6 min-w-0">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-3xl font-bold text-text-primary">0</h4>
                <p className="text-sm font-medium text-text-secondary mt-1">Total Leave Balance</p>
              </div>
              <div className="flex flex-col items-end h-full justify-between">
                <span className="text-text-secondary text-xs font-bold">days left</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-3xl font-bold text-text-primary">{leaveTakenDays}</h4>
                <p className="text-sm font-medium text-text-secondary mt-1">Leave Taken</p>
              </div>
              <div className="flex flex-col items-end h-full justify-between">
                <span className="text-text-secondary text-xs font-bold">days</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-3xl font-bold text-text-primary">{pendingCount}</h4>
                <p className="text-sm font-medium text-text-secondary mt-1">Pending Approvals</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4">
                  <Plane className="w-6 h-6" />
                </div>
                <h4 className="text-3xl font-bold text-text-primary">{upcomingTrips}</h4>
                <p className="text-sm font-medium text-text-secondary mt-1">Upcoming Plan's</p>
              </div>
              <div className="flex flex-col items-end h-full justify-between">
                <span className="text-text-secondary text-xs font-bold">Trips</span>
              </div>
            </motion.div>
          </div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary">Leave Approvals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background/40 border-b border-border text-xs text-secondary font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider">Employee ID</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider">Employee Name</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider">Leave Type</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider">Days</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider">Dates From</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider">Status</th>
                    {user?.role !== 'employee' && <th className="px-6 py-4 text-xs font-bold tracking-wider">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {loading ? (
                    <tr><td colSpan="8" className="p-8 text-center text-text-secondary">Loading...</td></tr>
                  ) : leaves.length === 0 ? (
                    <tr><td colSpan="8" className="p-8 text-center text-text-secondary">No leave requests found.</td></tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l.id} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4 font-bold text-text-secondary">{l.employee.empId}</td>
                        <td 
                          className={`px-6 py-4 font-bold text-text-primary ${user?.role !== 'employee' ? 'cursor-pointer hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4' : ''}`}
                          onClick={() => {
                            if (user?.role !== 'employee') {
                              setLeaveToApprove(l);
                            }
                          }}
                        >
                          {l.employee.firstName} {l.employee.lastName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold capitalize ${l.leaveType === 'sick' ? 'text-warning' : l.leaveType === 'casual' ? 'text-[#8B5CF6]' : 'text-success'}`}>
                            {l.leaveType} Leave
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-text-primary">{getDaysDiff(l.fromDate, l.toDate)} Days</td>
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {new Date(l.fromDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-text-secondary truncate max-w-[150px]" title={l.reason}>
                          {l.reason || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            l.status === 'approved' ? 'bg-success/10 text-success border-success/30' :
                            l.status === 'rejected' ? 'bg-danger/10 text-danger border-danger/30' :
                            'bg-warning/10 text-warning border-warning/30'
                          }`}>
                            {l.status === 'pending' ? 'Pending' : l.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        </td>
                        {user?.role !== 'employee' && (
                          <td className="px-6 py-4">
                            {l.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleStatusChange(l.id, 'approved')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-colors">
                                  Approve
                                </button>
                                <button onClick={() => handleStatusChange(l.id, 'rejected')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors">
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-text-secondary text-xs">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Chart Side Panel */}
        <div className="xl:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-6">Yearly Trend</h3>
            <div className="h-[250px] w-full relative">
              <canvas ref={chartRef}></canvas>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-6">This Month (By Type)</h3>
            <div className="h-[250px] w-full relative flex flex-col items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <img src="/logo.png" alt="VN Watermark" className="w-20 h-20 object-contain opacity-100 -translate-y-6" />
              </div>
              <canvas ref={monthlyChartRef} className="relative z-0"></canvas>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Approve Leave Modal */}
      {leaveToApprove && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-surface">
              <h4 className="text-xl font-bold text-text-primary tracking-tight">Leave Request</h4>
              <button onClick={() => setLeaveToApprove(null)} className="p-2 text-text-secondary hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-sm font-bold text-text-secondary uppercase">Employee</span>
                <span className="text-sm font-bold text-text-primary">{leaveToApprove.employee.firstName} {leaveToApprove.employee.lastName} ({leaveToApprove.employee.empId})</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-sm font-bold text-text-secondary uppercase">Leave Type</span>
                <span className="text-sm font-bold text-text-primary capitalize">{leaveToApprove.leaveType}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-sm font-bold text-text-secondary uppercase">Duration</span>
                <span className="text-sm font-bold text-text-primary">{getDaysDiff(leaveToApprove.fromDate, leaveToApprove.toDate)} Days</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-sm font-bold text-text-secondary uppercase">Dates</span>
                <span className="text-sm font-bold text-text-primary">{new Date(leaveToApprove.fromDate).toLocaleDateString()} - {new Date(leaveToApprove.toDate).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col border-b border-border pb-4 gap-2">
                <span className="text-sm font-bold text-text-secondary uppercase">Reason</span>
                <p className="text-sm text-text-primary bg-background p-3 rounded-lg border border-border">{leaveToApprove.reason || 'No reason provided'}</p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setLeaveToApprove(null)}
                  className="px-6 py-2.5 bg-background text-text-primary text-sm font-bold rounded-lg border border-border transition-colors"
                >
                  Close
                </button>
                {leaveToApprove.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(leaveToApprove.id, 'rejected');
                        setLeaveToApprove(null);
                      }}
                      className="px-6 py-2.5 bg-danger/10 text-danger hover:bg-danger hover:text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(leaveToApprove.id, 'approved');
                        setLeaveToApprove(null);
                      }}
                      className="px-6 py-2.5 bg-success hover:bg-success/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-surface">
              <h4 className="text-xl font-bold text-text-primary tracking-tight">Apply Leave</h4>
              <button onClick={() => setShowApplyModal(false)} className="p-2 text-text-secondary hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Requesting Employee</label>
                <select
                  required
                  disabled={user?.role === 'employee'}
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors disabled:opacity-60"
                >
                  <option value="">Select Staff...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.empId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Leave Category</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">From Date</label>
                  <input
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">To Date</label>
                  <input
                    type="date"
                    required
                    value={formData.toDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows="3"
                  className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-6 py-2.5 bg-background text-text-primary text-sm font-bold rounded-lg border border-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}