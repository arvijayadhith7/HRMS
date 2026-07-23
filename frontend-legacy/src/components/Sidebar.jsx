import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, Calendar, 
  CalendarOff, CreditCard, Megaphone, 
  BarChart3, Settings, CheckSquare, 
  User, LogOut, Search, Target, BookOpen, 
  Laptop, Receipt, FileText, XCircle
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const allLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employee Data', icon: Users, roles: ['admin', 'hr'] },
    { to: '/attendance', label: 'Attendance', icon: Calendar },
    { to: '/leave', label: 'Leave', icon: CalendarOff },
    { to: '/payroll', label: 'Payroll', icon: CreditCard, roles: ['admin', 'hr'] },
    { to: '/tasks/manage', label: 'Recruitment', icon: Users, roles: ['admin', 'hr'] },
    { to: '/announcements/manage', label: 'LMS', icon: Megaphone, roles: ['admin', 'hr'] },
    
    // New HR Modules
    { to: '/performance', label: 'Performance', icon: Target, roles: ['admin', 'hr'] },
    { to: '/training', label: 'Training', icon: BookOpen, roles: ['admin', 'hr'] },
    { to: '/assets', label: 'Assets', icon: Laptop, roles: ['admin', 'hr'] },
    { to: '/expenses', label: 'Expenses', icon: Receipt, roles: ['admin', 'hr'] },
    { to: '/documents', label: 'Documents', icon: FileText, roles: ['admin', 'hr'] },
    { to: '/exit', label: 'Exit Mgmt', icon: XCircle, roles: ['admin', 'hr'] },

    { to: '/reports', label: 'Report & Analysis', icon: BarChart3, roles: ['admin', 'hr'] },
    { to: '/settings', label: 'Setting', icon: Settings, roles: ['admin', 'hr'] },

    // Employee
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare, roles: ['employee'] },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['employee'] },
    { to: '/my-profile', label: 'Employee Service', icon: User, roles: ['employee'] }
  ];

  const filteredLinks = allLinks
    .filter(link => {
      if (!link.roles) return true;
      return link.roles.includes(user?.role || 'employee');
    })
    .filter(link => 
      link.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-border flex flex-col z-50 overflow-hidden"
    >
      {/* Brand Header */}
      <div className="flex items-center px-6 mt-6 h-16">
        <h1 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
          <img src="/logo.png" alt="VirtualNest Logo" className="h-12 w-12 object-contain" />
          VIRTUAL NEST
        </h1>
      </div>

      {/* Search Input */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input 
            type="text"
            placeholder="Search tabs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-text-primary placeholder-secondary focus:outline-none focus:border-secondary focus:ring-0 transition-colors"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar px-2 mt-4">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-secondary hover:text-primary hover:bg-background/50 rounded-lg mx-2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
                  )}
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
        {filteredLinks.length === 0 && (
          <p className="text-xs text-secondary text-center py-4">No tabs found</p>
        )}
      </nav>

      {/* Footer User Pill Card */}
      <div className="p-4 border-t border-border bg-white">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold overflow-hidden shrink-0">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary uppercase">{user?.username?.[0] || 'U'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-primary truncate">{user?.username || 'Sai Kumar'}</p>
            <p className="text-[10px] text-secondary truncate capitalize font-medium">{user?.role || 'HR Admin'}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
