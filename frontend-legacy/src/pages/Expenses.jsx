import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Receipt } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Travel', employeeId: '' });

  const loadData = () => {
    api.get('/expenses').then(res => setExpenses(res.data)).catch(console.error);
    api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);
  };
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.employeeId) return alert('Please select an employee');
      const payload = { ...formData, amount: parseFloat(formData.amount), employeeId: Number(formData.employeeId) };
      await api.post('/expenses', payload);
      setShowModal(false);
      setFormData({ title: '', amount: '', category: 'Travel', employeeId: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Expense Claims</h2>
          <p className="text-sm text-text-secondary">Reimbursements & Travel</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-primary text-white rounded-lg font-bold">New Claim</button>
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        {expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="No Expense Claims" description="No reimbursements filed." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="py-3">Employee</th>
                <th className="py-3">Title</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Category</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b border-border text-sm">
                  <td className="py-4 font-bold">{e.employee?.firstName} {e.employee?.lastName}</td>
                  <td className="py-4">{e.title}</td>
                  <td className="py-4">${e.amount}</td>
                  <td className="py-4">{e.category}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Expense Claim</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">Employee</label>
                <select required className="w-full p-2 border rounded" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div><label className="block text-sm mb-1">Title</label><input required className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Amount ($)</label><input type="number" step="0.01" required className="w-full p-2 border rounded" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Category</label>
                <select className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Travel</option><option>Food</option><option>Supplies</option><option>Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
