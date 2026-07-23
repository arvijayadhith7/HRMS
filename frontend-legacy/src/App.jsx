import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PrivateRoute from './components/PrivateRoute';
import QueriesBox from './components/QueriesBox';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';

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
import FeedbackAdmin from './pages/FeedbackAdmin';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoutes() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Common Routes */}
          <Route path="/" element={<PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><PageTransition><Attendance /></PageTransition></PrivateRoute>} />
          <Route path="/leave" element={<PrivateRoute><PageTransition><Leave /></PageTransition></PrivateRoute>} />

          {/* Admin / HR Only Routes */}
          <Route path="/employees" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Employees /></PageTransition></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Payroll /></PageTransition></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Reports /></PageTransition></PrivateRoute>} />
          <Route path="/tasks/manage" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Recruitment /></PageTransition></PrivateRoute>} />
          <Route path="/announcements/manage" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><AnnouncementsAdmin /></PageTransition></PrivateRoute>} />
          
          <Route path="/performance" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Performance /></PageTransition></PrivateRoute>} />
          <Route path="/training" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Training /></PageTransition></PrivateRoute>} />
          <Route path="/assets" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Assets /></PageTransition></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Expenses /></PageTransition></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><Documents /></PageTransition></PrivateRoute>} />
          <Route path="/exit" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><ExitManagement /></PageTransition></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><FeedbackAdmin /></PageTransition></PrivateRoute>} />
          
          <Route path="/settings" element={<PrivateRoute roles={['admin', 'hr']}><PageTransition><SettingsAdmin /></PageTransition></PrivateRoute>} />

          {/* Employee Only Routes */}
          <Route path="/my-tasks" element={<PrivateRoute roles={['employee']}><PageTransition><MyTasks /></PageTransition></PrivateRoute>} />
          <Route path="/my-profile" element={<PrivateRoute roles={['employee']}><PageTransition><MyProfile /></PageTransition></PrivateRoute>} />
          <Route path="/announcements" element={<PrivateRoute roles={['employee']}><PageTransition><AnnouncementsEmployee /></PageTransition></PrivateRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={
        <PrivateRoute>
          <ProtectedRoutes />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <QueriesBox />
      </BrowserRouter>
    </AuthProvider>
  );
}
