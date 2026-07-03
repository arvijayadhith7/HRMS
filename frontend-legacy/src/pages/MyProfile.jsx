import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { User, Lock, Save, Key, UserCircle, Briefcase, Mail, Calendar, Phone, Home, Building } from 'lucide-react';

export default function MyProfile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for editable fields
  const [formData, setFormData] = useState({
    phone: '', address: '', emergencyContact: '', bankDetails: ''
  });

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [passMessage, setPassMessage] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: emps } = await api.get('/employees');
      const matched = emps.find(e => e.email === user.email);
      if (matched) {
        setEmployee(matched);
        setFormData({
          phone: matched.phone || '',
          address: matched.address || '',
          emergencyContact: matched.emergencyContact || '',
          bankDetails: matched.bankDetails || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    try {
      await api.put(`/employees/${employee.id}`, formData);
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMessage('New passwords do not match');
      return;
    }
    setPassMessage('Loading...');
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPassMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMessage(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">My Profile</h2>
        <p className="text-sm text-text-secondary mt-1">View your professional details and manage personal information.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-48 bg-surface border border-border rounded-xl animate-pulse"></div>
          <div className="h-64 bg-surface border border-border rounded-xl animate-pulse"></div>
        </div>
      ) : !employee ? (
        <div className="p-8 bg-surface rounded-xl border border-border text-center text-text-secondary font-bold">
          Employee record not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Read-Only Info */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* ID Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden relative group">
              <div className="h-28 bg-primary"></div>
              <div className="px-6 pb-6 pt-0 relative">
                <div className="w-24 h-24 rounded-full border-4 border-surface bg-background mx-auto -mt-12 mb-4 overflow-hidden shadow-lg flex items-center justify-center text-3xl font-bold text-primary">
                  {employee.photo ? (
                    <img src={employee.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    employee.firstName[0]
                  )}
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-text-primary">{employee.firstName} {employee.lastName}</h3>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">{employee.designation}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Employee ID</p>
                      <p className="text-sm text-text-primary font-bold">{employee.empId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Department</p>
                      <p className="text-sm text-text-primary font-bold">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Company Email</p>
                      <p className="text-sm text-text-primary font-bold truncate">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Date of Joining</p>
                      <p className="text-sm text-text-primary font-bold">{new Date(employee.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <UsersIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Reporting Manager</p>
                      <p className="text-sm text-text-primary font-bold">{employee.reportingManager || 'Not Assigned'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Editable Info & Password */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Personal Information Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface rounded-xl border border-border shadow-sm">
              <div className="px-6 py-5 border-b border-border bg-surface rounded-t-xl">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Editable Information
                </h3>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Emergency Contact</label>
                    <input type="text" placeholder="Name - Phone" value={formData.emergencyContact} onChange={e => setFormData(p => ({ ...p, emergencyContact: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Residential Address</label>
                    <textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors resize-none"></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Bank Details</label>
                    <input type="text" placeholder="Account Number / IFSC" value={formData.bankDetails} onChange={e => setFormData(p => ({ ...p, bankDetails: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button disabled={saving} type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Change Password Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface rounded-xl border border-border shadow-sm">
              <div className="px-6 py-5 border-b border-border bg-surface rounded-t-xl">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Lock className="w-5 h-5 text-warning" />
                  Change Password
                </h3>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
                {passMessage && (
                  <div className={`p-4 rounded-xl text-sm font-bold ${passMessage.includes('success') ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                    {passMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Current Password</label>
                  <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">New Password</label>
                    <input type="password" required minLength={6} value={passwordData.newPassword} onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input type="password" required minLength={6} value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button type="submit" className="px-6 py-2.5 bg-background border border-border hover:bg-surface text-text-primary text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>

          </div>
        </div>
      )}

    </div>
  );
}

// Quick component for users icon missing
function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}