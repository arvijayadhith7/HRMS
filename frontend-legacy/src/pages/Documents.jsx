import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { FileText, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'id_proof', fileUrl: '', employeeId: '' });

  const loadData = () => {
    let url = '/documents';
    if (user?.role === 'employee' && user?.id) {
       // Ideally filter by employeeId in backend, but we'll fetch all and filter for now if endpoint isn't ready
       // Wait, documents GET endpoint probably already returns all docs. Let's just filter client side for employee
    }
    api.get('/documents').then(res => {
      if (user?.role === 'employee') {
        setDocuments(res.data.filter(d => d.employee?.email === user.email));
      } else {
        setDocuments(res.data);
      }
    }).catch(console.error);
    if (user?.role !== 'employee') {
      api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);
    } else {
      // employee can only upload for themselves
      api.get('/employees').then(res => {
        const me = res.data.find(e => e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim());
        setEmployees(me ? [me] : []);
        if (me) setFormData(p => ({ ...p, employeeId: me.id }));
      }).catch(console.error);
    }
  };
  useEffect(() => { loadData(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.employeeId) return alert('Please select an employee');
      const payload = { ...formData, employeeId: Number(formData.employeeId) };
      
      if (formData.id) {
        // Resubmission (update)
        await api.put(`/documents/${formData.id}`, { ...payload, verificationStatus: 'PENDING', rejectionReason: null });
      } else {
        // New upload
        await api.post('/documents', payload);
      }
      
      setShowModal(false);
      setFormData({ id: null, title: '', type: 'id_proof', fileUrl: '', employeeId: user?.role === 'employee' ? employees[0]?.id || '' : '' });
      loadData();
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  const handleStatusChange = async (id, status, reason = null) => {
    try {
      let promptReason = reason;
      if (status === 'REJECTED' && !reason) {
        promptReason = prompt('Enter reason for rejection:');
        if (!promptReason) return;
      }
      await api.put(`/documents/${id}`, { verificationStatus: status, rejectionReason: promptReason });
      loadData();
    } catch (err) {
      alert('Failed to update document status');
    }
  };

  const handleResubmit = (doc) => {
    setFormData({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      fileUrl: doc.fileUrl,
      employeeId: doc.employeeId
    });
    setShowModal(true);
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
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(d => (
                <tr key={d.id} className="border-b border-border text-sm">
                  <td className="py-4 font-bold">{d.employee?.firstName} {d.employee?.lastName}</td>
                  <td className="py-4">
                    {d.title}
                    {d.rejectionReason && <p className="text-[10px] text-danger mt-1">Reason: {d.rejectionReason}</p>}
                  </td>
                  <td className="py-4">{d.type}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      d.verificationStatus === 'APPROVED' ? 'bg-success/10 text-success' : 
                      d.verificationStatus === 'REJECTED' ? 'bg-danger/10 text-danger' : 
                      'bg-warning/10 text-warning'
                    }`}>
                      {d.verificationStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-bold transition-colors">View</a>
                      
                      {user?.role === 'employee' && d.verificationStatus === 'REJECTED' && (
                        <button onClick={() => handleResubmit(d)} className="flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning hover:bg-warning/20 rounded text-xs font-bold transition-colors">
                          <RefreshCw className="w-3 h-3" /> Resubmit
                        </button>
                      )}

                      {user?.role !== 'employee' && d.verificationStatus === 'PENDING' && (
                        <>
                          <button onClick={() => handleStatusChange(d.id, 'APPROVED')} className="p-1 text-success hover:bg-success/10 rounded transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusChange(d.id, 'REJECTED')} className="p-1 text-danger hover:bg-danger/10 rounded transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
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
            <h3 className="text-xl font-bold mb-4">{formData.id ? 'Resubmit Document' : 'Upload Document'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">Employee</label>
                <select required disabled={user?.role === 'employee' || formData.id} className="w-full p-2 border rounded bg-background" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
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
              <div>
                <label className="block text-sm mb-1">Upload File</label>
                <input 
                  type="file" 
                  required={!formData.fileUrl} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, fileUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full p-2 border rounded bg-background" 
                />
                {formData.fileUrl && (
                  <p className="text-xs text-text-secondary mt-1 truncate">
                    Selected file: {formData.fileUrl.startsWith('data:') ? 'Base64 File Data' : formData.fileUrl}
                  </p>
                )}
              </div>
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
