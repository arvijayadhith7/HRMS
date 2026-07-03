import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Target } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ employeeId: '', reviewerId: '1', period: '2026-Q1', goals: '', kpis: '', rating: '5', comments: '' });

  const loadData = () => {
    api.get('/performance').then(res => setReviews(res.data)).catch(console.error);
    api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);
  };
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.employeeId) return alert('Please select an employee');
      const payload = { ...formData, employeeId: Number(formData.employeeId), reviewerId: Number(formData.reviewerId), rating: Number(formData.rating) };
      await api.post('/performance', payload);
      setShowModal(false);
      setFormData({ employeeId: '', reviewerId: '1', period: '2026-Q1', goals: '', kpis: '', rating: '5', comments: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Performance Management</h2>
          <p className="text-sm text-text-secondary">Appraisals, Goals & KPIs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-primary text-white rounded-lg font-bold">New Review</button>
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        {reviews.length === 0 ? (
          <EmptyState icon={Target} title="No Reviews" description="Start employee performance reviews." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="py-3">Employee</th>
                <th className="py-3">Period</th>
                <th className="py-3">Rating</th>
                <th className="py-3">Goals</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} className="border-b border-border text-sm">
                  <td className="py-4 font-bold">{r.employee?.firstName} {r.employee?.lastName}</td>
                  <td className="py-4">{r.period}</td>
                  <td className="py-4">{r.rating} / 5</td>
                  <td className="py-4 truncate max-w-xs">{r.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">New Performance Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">Employee</label>
                <select required className="w-full p-2 border rounded" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div><label className="block text-sm mb-1">Period</label><input required className="w-full p-2 border rounded" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Rating (1-5)</label><input type="number" min="1" max="5" required className="w-full p-2 border rounded" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Goals</label><textarea required className="w-full p-2 border rounded" value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">KPIs</label><textarea required className="w-full p-2 border rounded" value={formData.kpis} onChange={e => setFormData({...formData, kpis: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Comments</label><textarea className="w-full p-2 border rounded" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} /></div>
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
