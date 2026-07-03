import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Laptop } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Laptop', serialNo: '', status: 'available', employeeId: '' });

  const loadData = () => {
    api.get('/assets').then(res => setAssets(res.data)).catch(console.error);
    api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);
  };
  
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, employeeId: formData.employeeId ? Number(formData.employeeId) : null };
      await api.post('/assets', payload);
      setShowModal(false);
      setFormData({ name: '', type: 'Laptop', serialNo: '', status: 'available', employeeId: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Asset Management</h2>
          <p className="text-sm text-text-secondary">Laptops, Mobiles & Inventory tracking</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-primary text-white rounded-lg font-bold">Add Asset</button>
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        {assets.length === 0 ? (
          <EmptyState icon={Laptop} title="No Assets" description="Inventory is empty." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="py-3">Name</th>
                <th className="py-3">Type</th>
                <th className="py-3">Serial No</th>
                <th className="py-3">Assigned To</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} className="border-b border-border text-sm">
                  <td className="py-4 font-bold">{a.name}</td>
                  <td className="py-4">{a.type}</td>
                  <td className="py-4">{a.serialNo}</td>
                  <td className="py-4">{a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Unassigned'}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${a.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.status}
                    </span>
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
            <h3 className="text-xl font-bold mb-4">Add Asset</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">Name</label><input required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Type</label>
                <select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option>Laptop</option><option>Mobile</option><option>Monitor</option><option>Other</option>
                </select>
              </div>
              <div><label className="block text-sm mb-1">Serial Number</label><input required className="w-full p-2 border rounded" value={formData.serialNo} onChange={e => setFormData({...formData, serialNo: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Assign to Employee (Optional)</label>
                <select className="w-full p-2 border rounded" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">-- Unassigned --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
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
