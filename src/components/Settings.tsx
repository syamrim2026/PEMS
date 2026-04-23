import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { NotificationSetting } from '../types';
import { Bell, Mail, Smartphone, ShieldCheck, Save, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await notificationService.getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await notificationService.updateSettings(settings);
    setSaving(false);
  };

  if (loading || !settings) {
     return <div className="max-w-2xl bg-white p-10 rounded-[2.5rem] border border-stone-100 animate-pulse h-96" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900">System Preferences</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Alert configuration and modes</p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-2">
                <Clock size={14} />
                Expiration Window
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-indigo-600">{settings.thresholdDays}</span>
                <span className="text-[10px] text-gray-400 font-bold">DAYS</span>
              </div>
            </div>
            <input 
              type="range" 
              min="7" 
              max="180" 
              step="1"
              value={settings.thresholdDays}
              onChange={e => setSettings({...settings, thresholdDays: Number(e.target.value)})}
              className="w-full accent-indigo-600 h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer"
            />
            <p className="mt-3 text-[11px] text-gray-400 leading-relaxed italic">
              Controls when batches are flagged as "Expiring Soon" in your dashboard and reports.
            </p>
          </div>

          <div className="pt-8 border-t border-gray-100 space-y-4">
            <label className="block text-[11px] font-bold uppercase text-gray-500 tracking-widest mb-4">
              Active Delivery Channels
            </label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-700">Relational Email Service</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Verified Contact Ready</p>
                  </div>
                </div>
                <Toggle 
                  enabled={settings.emailEnabled} 
                  onChange={v => setSettings({...settings, emailEnabled: v})} 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-400">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-700">Native Push Notifications</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter italic font-mono">Sync Pending</p>
                  </div>
                </div>
                <Toggle enabled={false} onChange={() => {}} />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="mt-10 w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} />
              Save System Settings
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex gap-4">
        <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center shrink-0">
          <ShieldCheck size={16} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-xs mb-0.5 tracking-tight">Security Standard V2</p>
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
            Configurations are isolated per-tenant and synchronized using zero-trust relational logic.
          </p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean, onChange: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!enabled)}
      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
      <motion.div 
        animate={{ x: enabled ? 22 : 3 }}
        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
      />
    </button>
  );
}
