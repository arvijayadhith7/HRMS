import React from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Bell, HelpCircle } from 'lucide-react';

export default function Topbar() {
  const location = useLocation();
  
  // Generate breadcrumb from pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].replace(/-/g, ' ') 
    : 'Dashboard';

  return (
    <header className="h-16 bg-white sticky top-0 z-40 flex items-center justify-between px-8 border-b border-border shadow-sm">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-secondary font-medium">VirtualNest</span>
        <span className="text-secondary">/</span>
        <span className="text-text-primary font-semibold capitalize">{pageTitle}</span>
      </div>

      {/* Right Side Icons & Profile Info */}
      <div className="flex items-center gap-4">
        <button 
          title="Notifications"
          className="relative p-1.5 text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
        <button 
          title="Support"
          className="p-1.5 text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
