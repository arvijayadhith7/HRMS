import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { Megaphone, Calendar, AlertTriangle, X, Trash2, Plus, Pin } from 'lucide-react';

export default function AnnouncementsAdmin() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', type: 'news', isPinned: false, photo: ''
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { ...formData, createdBy: user.id });
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'holiday': return { icon: <Calendar className="w-6 h-6" />, color: 'text-warning bg-warning/10' };
      case 'notice': return { icon: <AlertTriangle className="w-6 h-6" />, color: 'text-danger bg-danger/10' };
      default: return { icon: <Megaphone className="w-6 h-6" />, color: 'text-primary bg-primary/10' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Company Announcements</h2>
          <p className="text-sm text-text-secondary mt-1">Broadcast news, holidays, and important notices to the entire workforce.</p>
        </div>
        
        <button
          onClick={() => {
            setFormData({ title: '', content: '', type: 'news', isPinned: false, photo: '' });
            setShowModal(true);
          }}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-opacity-90 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="bg-surface border border-border rounded-xl h-[120px] animate-pulse"></div>)
        ) : announcements.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border shadow-sm p-12 flex justify-center">
            <EmptyState icon="campaign" title="No Announcements" description="No active broadcasts. Create one to notify the team." />
          </div>
        ) : (
          announcements.map((ann, index) => {
            const { icon, color } = getIconForType(ann.type);
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={ann.id} className="bg-surface p-6 rounded-xl border border-border shadow-sm flex gap-6 items-start relative overflow-hidden group">
                {ann.isPinned && (
                  <div className="absolute top-0 right-0 bg-warning text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                  {icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-text-primary">{ann.title}</h3>
                    <span className="text-xs font-bold text-text-secondary bg-background px-3 py-1.5 rounded-full border border-border">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  {ann.photo && (
                    <div className="mt-4 max-w-xl rounded-xl overflow-hidden border border-border shadow-sm bg-background">
                      <img src={ann.photo} alt="Attachment" className="max-h-[300px] w-auto max-w-full object-contain mx-auto" />
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg absolute bottom-4 right-4"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b border-border bg-surface">
              <h4 className="text-xl font-bold text-text-primary tracking-tight">Post New Announcement</h4>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-secondary hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Content / Message</label>
                <textarea required rows={6} value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Photo Attachment (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, photo: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                />
                {formData.photo && (
                  <div className="mt-4 relative w-40 h-24 rounded-lg overflow-hidden border border-border bg-background">
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, photo: '' }))} 
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Type</label>
                  <select required value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors">
                    <option value="news">General News</option>
                    <option value="holiday">Holiday</option>
                    <option value="notice">Important Notice</option>
                  </select>
                </div>

                <div className="flex items-center mt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isPinned} onChange={e => setFormData(p => ({ ...p, isPinned: e.target.checked }))} className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background" />
                    <span className="text-sm font-bold text-text-primary">Pin to top of feed</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-background text-text-primary text-sm font-bold rounded-lg border border-border transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4" /> Post Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}