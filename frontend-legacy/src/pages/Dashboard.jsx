import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import AdminDashboardView from './AdminDashboardView';
import EmployeeDashboardView from './EmployeeDashboardView';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    todayAttendance: 0,
    absentToday: 0,
    employeesOnLeave: 0,
    pendingLeaves: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalPaidPayroll: 0
  });
  const [announcements, setAnnouncements] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState([]);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkedOutToday, setCheckedOutToday] = useState(false);
  const [checking, setChecking] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');
  const [lastCheckInTime, setLastCheckInTime] = useState(null);
  const [personalLeaves, setPersonalLeaves] = useState([]);
  const [personalBalances, setPersonalBalances] = useState({
    sick: { remaining: 0, limit: 0 },
    casual: { remaining: 0, limit: 0 },
    earned: { remaining: 0, limit: 0 },
    unpaid: { remaining: 0, limit: 0 }
  });

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/reports/summary');
      setStats(data);
      const annRes = await api.get('/announcements');
      setAnnouncements(annRes.data.slice(0, 5));
      
      if (user?.role !== 'employee') {
        const depRes = await api.get('/reports/departments');
        setDepartmentCounts(depRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const [myTasks, setMyTasks] = useState([]);

  const loadEmployeeData = async () => {
    try {
      const { data: emps } = await api.get('/employees');
      const matched = emps.find(e => e.email === user.email);
      if (matched) {
        // Fetch last check in
        const { data: logs } = await api.get(`/attendance?employeeId=${matched.id}`);
        const todayStr = new Date().toDateString();
        const todayLog = logs.find(l => new Date(l.date).toDateString() === todayStr);
        if (todayLog) {
          setCheckedInToday(true);
          setLastCheckInTime(todayLog.checkIn);
          if (todayLog.checkOut) {
            setCheckedOutToday(true);
          }
        } else if (logs.length > 0) {
          // Last checkin was a different day
          const lastIn = logs.find(l => l.checkIn);
          if (lastIn) setLastCheckInTime(lastIn.checkIn);
        }

        // Fetch balances
        const { data: bal } = await api.get(`/leave/balances/${matched.id}`);
        setPersonalBalances(bal);

        // Fetch personal leaves
        const { data: lvs } = await api.get(`/leave?employeeId=${matched.id}`);
        setPersonalLeaves(lvs.slice(0, 5));

        // Fetch tasks
        const { data: tsks } = await api.get(`/tasks/my?employeeId=${matched.id}`);
        setMyTasks(tsks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEmployees();
    loadEmployeeData();
  }, []);

  const handleSelfCheckIn = async () => {
    setChecking(true);
    setMessage('');
    try {
      const { data: emps } = await api.get('/employees');
      const matchedEmp = emps.find(e => e.email === user.email);
      if (!matchedEmp) {
        setMessage('No corresponding employee record found.');
        return;
      }
      await api.post('/attendance/check-in', { employeeId: matchedEmp.id });
      setCheckedInToday(true);
      setLastCheckInTime(new Date());
      fetchStats();
      setMessage('Checked in successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Check-in failed');
    } finally {
      setChecking(false);
    }
  };

  const handleSelfCheckOut = async () => {
    setChecking(true);
    setMessage('');
    try {
      const { data: emps } = await api.get('/employees');
      const matchedEmp = emps.find(e => e.email === user.email);
      if (!matchedEmp) {
        setMessage('No corresponding employee record found.');
        return;
      }
      await api.post('/attendance/check-out', { employeeId: matchedEmp.id });
      setCheckedOutToday(true);
      fetchStats();
      setMessage('Checked out successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Check-out failed');
    } finally {
      setChecking(false);
    }
  };

  const formatLogTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      {user?.role === 'employee' ? (
        <EmployeeDashboardView 
          user={user}
          stats={stats}
          checkedInToday={checkedInToday}
          checkedOutToday={checkedOutToday}
          checking={checking}
          lastCheckInTime={lastCheckInTime}
          handleSelfCheckIn={handleSelfCheckIn}
          handleSelfCheckOut={handleSelfCheckOut}
          personalBalances={personalBalances}
          personalLeaves={personalLeaves}
          message={message}
          tasks={myTasks}
          announcements={announcements}
        />
      ) : (
        <AdminDashboardView 
          stats={stats}
          employees={employees}
          announcements={announcements}
          departmentCounts={departmentCounts}
          fetchStats={fetchStats}
        />
      )}
    </div>
  );
}
