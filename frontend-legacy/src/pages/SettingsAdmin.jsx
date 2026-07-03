import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Building2, Clock, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    COMPANY_NAME: '',
    TIMEZONE: 'Asia/Kolkata',
    WORK_HOURS_START: '09:00',
    WORK_HOURS_END: '18:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && data.length > 0) {
          const s = {};
          data.forEach(item => { s[item.key] = item.value });
          setSettings(prev => ({ ...prev, ...s }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.keys(settings).map(k => ({ key: k, value: settings[k] }));
      await api.post('/settings', { settings: payload });
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">System Settings</h2>
        <p className="text-sm text-text-secondary mt-1">Configure company details and platform defaults.</p>
      </div>

      {loading ? (
        <div className="bg-surface border border-border h-[400px] rounded-xl animate-pulse"></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden max-w-4xl">
          <div className="p-8 space-y-8">
            
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                Company Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Company Name</label>
                  <input 
                    type="text" 
                    name="COMPANY_NAME"
                    value={settings.COMPANY_NAME} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" 
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Regional Settings */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                Time & Attendance Defaults
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Timezone</label>
                  <select 
                    name="TIMEZONE"
                    value={settings.TIMEZONE}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors"
                  >
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                    <option value="America/New_York">EST (America/New_York)</option>
                    <option value="Europe/London">GMT (Europe/London)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Work Start</label>
                    <input 
                      type="time" 
                      name="WORK_HOURS_START"
                      value={settings.WORK_HOURS_START} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Work End</label>
                    <input 
                      type="time" 
                      name="WORK_HOURS_END"
                      value={settings.WORK_HOURS_END} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border text-text-primary text-sm rounded-xl outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="px-8 py-5 bg-background border-t border-border flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}