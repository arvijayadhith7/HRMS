import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { FileText } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'id_proof', fileUrl: 'https://example.com/doc.pdf', employeeId: '' });

  const loadData = () => {
    api.get('/documents').then(res => setDocuments(res.data)).catch(console.error);
    api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);
  };
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.employeeId) return alert('Please select an employee');
      const payload = { ...formData, employeeId: Number(formData.employeeId) };
      await api.post('/documents', payload);
      setShowModal(false);
      setFormData({ title: '', type: 'id_proof', fileUrl: 'https://example.com/doc.pdf', employeeId: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Document Management</h2>
          <p className="text-sm text-text-secondary">Company policies & ID proofs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-primary text-white rounded-lg font-bold">Upload Doc</button>
      </div>
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        {documents.length === 0 ? (
          <EmptyState icon={FileText} title="No Documents" description="Upload employee files here." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="py-3">Employee</th>
                <th className="py-3">Title</th>
                <th className="py-3">Type</th>
                <th className="py-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(d => (
                <tr key={d.id} className="border-b border-border text-sm">
                  <td className="py-4 font-bold">{d.employee?.firstName} {d.employee?.lastName}</td>
                  <td className="py-4">{d.title}</td>
                  <td className="py-4">{d.type}</td>
                  <td className="py-4"><a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload Document</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">Employee</label>
                <select required className="w-full p-2 border rounded" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div><label className="block text-sm mb-1">Title</label><input required className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Document Type</label>
                <select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="id_proof">ID Proof</option><option value="contract">Contract</option><option value="certificate">Certificate</option><option value="policy">Policy</option>
                </select>
              </div>
              <div><label className="block text-sm mb-1">File URL</label><input required className="w-full p-2 border rounded" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} /></div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
