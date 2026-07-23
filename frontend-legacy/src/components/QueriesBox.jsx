import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function QueriesBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const { user } = useAuth(); // Might be null if anonymous

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('');

    try {
      await api.post('/feedback', {
        name: user ? `${user.username} (Logged In)` : name,
        contact: user ? user.email : contact,
        message
      });
      setStatusMsg('Query submitted successfully!');
      setTimeout(() => {
        setIsOpen(false);
        setStatusMsg('');
        setMessage('');
        setName('');
        setContact('');
      }, 2000);
    } catch (err) {
      setStatusMsg('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-border w-80 mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <h3 className="font-bold text-sm">Queries / Opinion Box</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {statusMsg && (
              <div className={`p-2 text-xs font-bold rounded-lg ${statusMsg.includes('success') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {statusMsg}
              </div>
            )}
            
            {!user && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Name (Optional)</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Contact (Email/Phone) (Optional)</label>
                  <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Your Query / Opinion</label>
              <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary resize-none"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-sm py-2 rounded-lg flex justify-center items-center gap-2 transition-colors">
              {isSubmitting ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4" /> Send
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
