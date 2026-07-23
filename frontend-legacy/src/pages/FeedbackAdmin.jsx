import React, { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const { data } = await api.get('/feedback');
      setFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const markResolved = async (id) => {
    try {
      await api.put(`/feedback/${id}`, { status: 'RESOLVED' });
      fetchFeedback();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Queries & Feedback
        </h2>
        <p className="text-sm text-text-secondary mt-1">Review and manage queries submitted by employees and anonymous users.</p>
      </div>

      {loading ? (
        <div className="h-64 bg-surface rounded-xl border border-border animate-pulse"></div>
      ) : feedback.length === 0 ? (
        <div className="p-12 bg-surface rounded-xl border border-border text-center text-text-secondary font-bold">
          No feedback or queries found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedback.map((f) => (
            <div key={f.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-text-primary">{f.name || 'Anonymous'}</h3>
                    <p className="text-xs text-text-secondary">{f.contact || 'No contact provided'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    f.status === 'RESOLVED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <div className="bg-background p-4 rounded-lg border border-border mb-4">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{f.message}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
                
                {f.status !== 'RESOLVED' && (
                  <button
                    onClick={() => markResolved(f.id)}
                    className="flex items-center gap-1 text-xs font-bold text-success hover:text-success/80 transition-colors bg-success/10 px-3 py-1.5 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
