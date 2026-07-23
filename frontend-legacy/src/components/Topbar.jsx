import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, HelpCircle, X, Send } from 'lucide-react';
import NotificationBell from './NotificationBell';
import api from '../utils/api';

export default function Topbar() {
  const location = useLocation();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Generate breadcrumb from pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].replace(/-/g, ' ') 
    : 'Dashboard';

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/helpdesk', { message, isAnonymous });
      alert('Your query has been submitted successfully to HR/Admins!');
      setMessage('');
      setShowSupportModal(false);
    } catch (err) {
      alert('Failed to submit query. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white sticky top-0 z-40 flex items-center justify-between px-8 border-b border-border shadow-sm">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <img src="/logo.png" alt="VirtualNest" className="h-5 object-contain" />
          <span className="text-secondary">/</span>
          <span className="text-text-primary font-semibold capitalize">{pageTitle}</span>
        </div>

        {/* Right Side Icons & Profile Info */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button 
            onClick={() => setShowSupportModal(true)}
            title="Support / Query Box"
            className="p-1.5 text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Help & Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-border">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surface">
              <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Help & Support / Query Box
              </h4>
              <button 
                onClick={() => setShowSupportModal(false)} 
                className="p-1.5 text-text-secondary hover:bg-background rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSupportSubmit} className="p-6 space-y-4">
              <p className="text-xs text-text-secondary">
                Submit queries, issues, or suggestions. If submitted anonymously, your identity will not be visible to HR/Admins.
              </p>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Message / Issue / Query</label>
                <textarea 
                  required 
                  rows={4} 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={e => setIsAnonymous(e.target.checked)} 
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background" 
                  />
                  <span className="text-sm font-bold text-text-primary">Submit anonymously</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setShowSupportModal(false)} 
                  className="px-4 py-2 bg-background text-text-primary text-sm font-bold rounded-lg border border-border transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !message.trim()}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Submit Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
