import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, Calendar, CreditCard, Settings, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockResults = [
  { id: 1, title: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 2, title: 'Manage Employees', icon: User, path: '/employees' },
  { id: 3, title: 'View Attendance', icon: Calendar, path: '/attendance' },
  { id: 4, title: 'Run Payroll', icon: CreditCard, path: '/payroll' },
  { id: 5, title: 'System Settings', icon: Settings, path: '/settings' },
  { id: 6, title: 'Generate Reports', icon: FileText, path: '/reports' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const filtered = query === '' 
    ? mockResults 
    : mockResults.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl glass-card border border-border shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-text-secondary mr-3" />
              <input 
                autoFocus
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..." 
                className="w-full bg-transparent border-none text-text-primary focus:ring-0 placeholder:text-text-secondary outline-none text-lg"
              />
              <div className="flex items-center gap-1 bg-surface border border-border rounded px-2 py-1 text-xs text-text-secondary font-medium ml-3">
                ESC
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.path)}
                        className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left group"
                      >
                        <Icon className="w-5 h-5 text-text-secondary group-hover:text-primary mr-3" />
                        <span className="text-text-primary group-hover:text-primary font-medium">{item.title}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
