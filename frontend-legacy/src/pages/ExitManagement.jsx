import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { LogOut } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function ExitManagement() {
  const [exits, setExits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ employeeId: '', resignationDate: '', lastWorkingDay: '', reason: '' });

  const loadData = () => {
    api.get('/exit').then(res => setExits(res.data)).catch(console.error);
    api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);
  };
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.employeeId) return alert('Please select an employee');
      const payload = { 
        ...formData, 
        employeeId: Number(formData.employeeId),
        resignationDate: new Date(formData.resignationDate).toISOString(),
        lastWorkingDay: new Date(formData.lastWorkingDay).toISOString(),
      };
      await api.post('/exit', payload);
      setShowModal(false);
      setFormData({ employeeId: '', resignationDate: '', lastWorkingDay: '', reason: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Exit Management</h2>
          <p className="text-sm text-text-secondary">Resignations & Clearances</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold">Log Resignation</button>
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        {exits.length === 0 ? (
          <EmptyState icon={LogOut} title="No Exit Records" description="No resignations logged." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="py-3">Employee</th>
                <th className="py-3">Resignation Date</th>
                <th className="py-3">Last Day</th>
                <th className="py-3">Reason</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {exits.map(x => (
                <tr key={x.id} className="border-b border-border text-sm">
                  <td className="py-4 font-bold">{x.employee?.firstName} {x.employee?.lastName}</td>
                  <td className="py-4">{new Date(x.resignationDate).toLocaleDateString()}</td>
                  <td className="py-4">{new Date(x.lastWorkingDay).toLocaleDateString()}</td>
                  <td className="py-4">{x.reason}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded text-xs bg-gray-100">{x.fnfStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Log Resignation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">Employee</label>
                <select required className="w-full p-2 border rounded" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div><label className="block text-sm mb-1">Resignation Date</label><input type="date" required className="w-full p-2 border rounded" value={formData.resignationDate} onChange={e => setFormData({...formData, resignationDate: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Last Working Day</label><input type="date" required className="w-full p-2 border rounded" value={formData.lastWorkingDay} onChange={e => setFormData({...formData, lastWorkingDay: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Reason</label><textarea required className="w-full p-2 border rounded" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} /></div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
