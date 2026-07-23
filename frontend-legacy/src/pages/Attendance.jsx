import React, { useEffect, useState, useRef, useMemo } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import { Building2, AlertTriangle, Clock, Users, UserX, Wifi, ChevronDown } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchLogs = async () => {
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
      const { data } = await api.get('/attendance', { params });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute real KPI values from logs
  const kpis = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayLogs = logs.filter(l => l.date?.slice(0, 10) === todayStr || logs.length > 0);
    // Use all logs as "today's" if date field isn't set (API returns today's by default)
    const activeLogs = logs;

    const presentLogs = activeLogs.filter(l => l.checkIn);
    const absentLogs = activeLogs.filter(l => !l.checkIn || l.status === 'absent');
    const lateLogs = presentLogs.filter(l => {
      const checkInHour = new Date(l.checkIn).getHours();
      return checkInHour >= 10;
    });
    const overtimeLogs = presentLogs.filter(l => {
      if (!l.checkIn || !l.checkOut) return false;
      const diffHrs = (new Date(l.checkOut) - new Date(l.checkIn)) / (1000 * 60 * 60);
      return diffHrs > 9;
    });
    const remoteLogs = presentLogs.filter(l => {
      return l.employee?.address && !l.employee.address.toLowerCase().includes('office');
    });
    const officeLogs = presentLogs.filter(l => {
      return !l.employee?.address || l.employee.address.toLowerCase().includes('office');
    });

    return {
      inOffice: officeLogs.length,
      lateArrivals: lateLogs.length,
      overtime: overtimeLogs.length,
      presentToday: presentLogs.length,
      totalAbsent: absentLogs.length,
      remoteClockin: remoteLogs.length,
      attendanceRate: activeLogs.length > 0 ? Math.round((presentLogs.length / activeLogs.length) * 100) : 0
    };
  }, [logs]);

  // Build chart from real data
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();

      // Group logs by day-of-week
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const presentByDay = [0, 0, 0, 0, 0];
      const absentByDay = [0, 0, 0, 0, 0];

      logs.forEach(log => {
        const date = new Date(log.date || log.checkIn || Date.now());
        const dayIdx = date.getDay(); // 0=Sun, 1=Mon...
        if (dayIdx >= 1 && dayIdx <= 5) {
          if (log.checkIn) {
            presentByDay[dayIdx - 1]++;
          } else {
            absentByDay[dayIdx - 1]++;
          }
        }
      });

      const maxVal = Math.max(...presentByDay, ...absentByDay, 10);

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dayNames,
          datasets: [
            {
              label: 'Present',
              data: presentByDay,
              backgroundColor: '#111827',
              borderRadius: 4,
              barThickness: 32
            },
            {
              label: 'Absent',
              data: absentByDay,
              backgroundColor: '#EF4444',
              borderRadius: 4,
              barThickness: 32
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { grid: { color: '#F3F4F6' }, min: 0, suggestedMax: maxVal + 5, ticks: { color: '#6B7280' } },
            x: { grid: { display: false }, ticks: { color: '#6B7280' } }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [logs]);

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '--';
    const diffMs = new Date(outTime) - new Date(inTime);
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHrs} hours`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'text-success border-success/30 bg-success/10';
      case 'absent': return 'text-danger border-danger/30 bg-danger/10';
      case 'half-day': return 'text-warning border-warning/30 bg-warning/10';
      default: return 'text-text-secondary border-border bg-background';
    }
  };

  const getStatusText = (log) => {
    if (log.status === 'absent') return 'Absent';
    if (!log.checkIn) return 'Absent';
    const checkInTime = new Date(log.checkIn).getHours();
    if (checkInTime >= 10) return 'Late';
    return 'Present';
  };

  const getStatusPillColor = (statusText) => {
    switch(statusText) {
      case 'Present': return 'text-success border-success/50 bg-success/10';
      case 'Late': return 'text-warning border-warning/50 bg-warning/10';
      case 'Absent': return 'text-danger border-danger/50 bg-danger/10';
      default: return 'text-text-secondary border-border bg-background';
    }
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Attendance</h2>
        <p className="text-sm text-text-secondary mt-1">Today's attendance overview - {today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-3xl font-bold text-text-primary">{kpis.inOffice}</h4>
            <p className="text-sm font-medium text-text-secondary mt-1">In Office</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-3xl font-bold text-text-primary">{kpis.lateArrivals}</h4>
            <p className="text-sm font-medium text-text-secondary mt-1">Late Arrivals</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-dark/10 text-primary-dark flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-3xl font-bold text-text-primary">{kpis.overtime}</h4>
            <p className="text-sm font-medium text-text-secondary mt-1">Over time</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-3xl font-bold text-text-primary">{kpis.presentToday}</h4>
            <p className="text-sm font-medium text-text-secondary mt-1">Present Today</p>
          </div>
          <div className="flex flex-col items-end h-full justify-between">
            <span className="text-success text-xs font-bold flex items-center gap-1">{kpis.attendanceRate}% attendance</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h4 className="text-3xl font-bold text-text-primary">{kpis.totalAbsent}</h4>
            <p className="text-sm font-medium text-text-secondary mt-1">Total Absent</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <h4 className="text-3xl font-bold text-text-primary">{kpis.remoteClockin}</h4>
            <p className="text-sm font-medium text-text-secondary mt-1">Remote Clock-in</p>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-primary">Weekly Attendance</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-bold text-text-secondary"><span className="w-3 h-3 rounded-full bg-primary"></span> Present</div>
            <div className="flex items-center gap-2 text-sm font-bold text-text-secondary"><span className="w-3 h-3 rounded-full bg-danger"></span> Absent</div>
          </div>
        </div>
        <div className="h-[250px] w-full relative">
          {logs.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full text-text-secondary text-sm">No attendance data to display</div>
          ) : (
            <canvas ref={chartRef}></canvas>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-text-primary">Today's Login's</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/40 border-b border-border text-xs text-secondary font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Employee name</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Check in</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Check out</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-text-secondary">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-text-secondary">No logs for today.</td></tr>
              ) : (
                logs.map((log) => {
                  const statusText = getStatusText(log);
                  const isRemote = log.employee.address && !log.employee.address.toLowerCase().includes('office');
                  return (
                    <tr key={log.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-bold text-text-secondary">{log.employee.empId}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{log.employee.firstName} {log.employee.lastName}</td>
                      <td className="px-6 py-4 text-text-secondary">{log.employee.designation}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{formatTime(log.checkIn)}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{formatTime(log.checkOut)}</td>
                      <td className="px-6 py-4 font-bold text-warning">{calculateHours(log.checkIn, log.checkOut)}</td>
                      <td className="px-6 py-4 text-text-secondary">{isRemote ? 'Remote' : 'Office'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusPillColor(statusText)}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}