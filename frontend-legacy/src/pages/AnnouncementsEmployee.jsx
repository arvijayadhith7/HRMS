import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import EmptyState from '../components/EmptyState';
import { motion } from 'framer-motion';
import { Megaphone, BellRing, Info, Calendar } from 'lucide-react';

export default function AnnouncementsEmployee() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements');
      const active = data.filter(a => a.status === 'published' || a.status === 'active');
      setAnnouncements(active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger/10 text-danger border-danger/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Megaphone className="w-3.5 h-3.5" />;
      case 'medium': return <BellRing className="w-3.5 h-3.5" />;
      default: return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getPrioritySideColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      default: return 'bg-primary';
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Company Announcements</h2>
        <p className="text-sm text-text-secondary mt-1">Stay updated with the latest news and policies.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-surface border border-border rounded-xl h-[120px] animate-pulse"></div>)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border shadow-sm p-12 flex justify-center">
            <EmptyState icon="notifications_off" title="No Announcements" description="You are all caught up. There are no new announcements right now." />
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {announcements.map((item, index) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={item.id} className="bg-surface p-6 md:p-8 rounded-xl border border-border shadow-sm relative overflow-hidden group hover:border-primary transition-colors">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${getPrioritySideColor(item.priority)}`}></div>
              
              <div className="flex justify-between items-start mb-4 pl-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(item.priority)}`}>
                  {getPriorityIcon(item.priority)}
                  {item.priority} Priority
                </span>
                <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-3 pl-3">{item.title}</h3>
              <div className="pl-3 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {item.content}
                {item.photo && (
                  <div className="mt-4 max-w-xl rounded-xl overflow-hidden border border-border shadow-sm bg-background">
                    <img src={item.photo} alt="Attachment" className="max-h-[300px] w-auto max-w-full object-contain mx-auto" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}