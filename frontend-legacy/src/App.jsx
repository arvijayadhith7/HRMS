import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './hooks/useAuth';
import AnnouncementsAdmin from './pages/AnnouncementsAdmin';
import AnnouncementsEmployee from './pages/AnnouncementsEmployee';
import Attendance from './pages/Attendance';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leave from './pages/Leave';
import Login from './pages/Login';
import MyProfile from './pages/MyProfile';
import MyTasks from './pages/MyTasks';
import Payroll from './pages/Payroll';
import Recruitment from './pages/Recruitment';
import Reports from './pages/Reports';
import SettingsAdmin from './pages/SettingsAdmin';

// New HR Modules
import Performance from './pages/Performance';
import Training from './pages/Training';
import Assets from './pages/Assets';
import Expenses from './pages/Expenses';
import Documents from './pages/Documents';
import ExitManagement from './pages/ExitManagement';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Common Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/leave" element={<PrivateRoute><Leave /></PrivateRoute>} />

          {/* Admin / HR Only Routes */}
          <Route path="/employees" element={<PrivateRoute roles={['admin', 'hr']}><Employees /></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute roles={['admin', 'hr']}><Payroll /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['admin', 'hr']}><Reports /></PrivateRoute>} />
          <Route path="/tasks/manage" element={<PrivateRoute roles={['admin', 'hr']}><Recruitment /></PrivateRoute>} />
          <Route path="/announcements/manage" element={<PrivateRoute roles={['admin', 'hr']}><AnnouncementsAdmin /></PrivateRoute>} />
          
          <Route path="/performance" element={<PrivateRoute roles={['admin', 'hr']}><Performance /></PrivateRoute>} />
          <Route path="/training" element={<PrivateRoute roles={['admin', 'hr']}><Training /></PrivateRoute>} />
          <Route path="/assets" element={<PrivateRoute roles={['admin', 'hr']}><Assets /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute roles={['admin', 'hr']}><Expenses /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute roles={['admin', 'hr']}><Documents /></PrivateRoute>} />
          <Route path="/exit" element={<PrivateRoute roles={['admin', 'hr']}><ExitManagement /></PrivateRoute>} />
          
          <Route path="/settings" element={<PrivateRoute roles={['admin', 'hr']}><SettingsAdmin /></PrivateRoute>} />

          {/* Employee Only Routes */}
          <Route path="/my-tasks" element={<PrivateRoute roles={['employee']}><MyTasks /></PrivateRoute>} />
          <Route path="/my-profile" element={<PrivateRoute roles={['employee']}><MyProfile /></PrivateRoute>} />
          <Route path="/announcements" element={<PrivateRoute roles={['employee']}><AnnouncementsEmployee /></PrivateRoute>} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
