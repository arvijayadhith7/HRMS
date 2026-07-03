import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BookOpen } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Training() {
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', duration: '', instructor: '' });

  const loadPrograms = () => api.get('/training').then(res => setPrograms(res.data)).catch(console.error);
  
  useEffect(() => { loadPrograms(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/training', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', duration: '', instructor: '' });
      loadPrograms();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Training & Development</h2>
          <p className="text-sm text-text-secondary">Programs, Courses & Skill Tracking</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-primary text-white rounded-lg font-bold">New Program</button>
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        {programs.length === 0 ? (
          <EmptyState icon={BookOpen} title="No Training Programs" description="Add training courses here." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="py-3">Title</th>
                <th className="py-3">Duration</th>
                <th className="py-3">Instructor</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id} className="border-b border-border text-sm">
                  <td className="py-4 font-bold">{p.title}</td>
                  <td className="py-4">{p.duration}</td>
                  <td className="py-4">{p.instructor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Training Program</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">Title</label><input required className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Description</label><input required className="w-full p-2 border rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Duration</label><input required className="w-full p-2 border rounded" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Instructor</label><input className="w-full p-2 border rounded" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} /></div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
