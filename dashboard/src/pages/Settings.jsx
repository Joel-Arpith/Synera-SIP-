import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Mail, 
  Save, 
  AlertTriangle,
  Info,
  CheckCircle,
  Database
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    auto_block_enabled: true,
    strike_threshold: 5,
    window_minutes: 5,
    email_notifications: false,
    alert_email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('system_config')
      .select('*')
      .eq('id', 'settings')
      .single();
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase
      .from('system_config')
      .update(settings)
      .eq('id', 'settings');

    if (error) {
        setMessage({ type: 'error', text: error.message });
    } else {
        setMessage({ type: 'success', text: 'System configuration updated successfully.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500 p-10 animate-pulse">Loading system configuration...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-gray-400" />
          General Settings
        </h1>
        <p className="text-gray-400 text-sm">Configure global IDS parameters and response policies</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
        }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Threat Response Configuration */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">Automated Threat Response</h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Auto-Blocking Engine</h3>
                <p className="text-xs text-gray-400 max-w-sm">Automatically execute IP-tables DROP commands for verified threats.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={settings.auto_block_enabled}
                    onChange={(e) => setSettings({...settings, auto_block_enabled: e.target.checked})}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-primary shadow-inner"></div>
              </label>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity ${!settings.auto_block_enabled && 'opacity-30 pointer-events-none'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-400">Strike Threshold</label>
                    <span className="text-cyan-primary font-mono font-bold text-lg">{settings.strike_threshold} Alerts</span>
                </div>
                <input 
                    type="range" 
                    min="1" max="20" 
                    value={settings.strike_threshold}
                    onChange={(e) => setSettings({...settings, strike_threshold: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-cyan-primary"
                />
                <p className="text-[10px] text-gray-600">Number of High/Critical alerts before an IP is blocked.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-400">Detection Window</label>
                    <span className="text-cyan-primary font-mono font-bold text-lg">{settings.window_minutes} Minutes</span>
                </div>
                <input 
                    type="range" 
                    min="1" max="60" 
                    value={settings.window_minutes}
                    onChange={(e) => setSettings({...settings, window_minutes: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-cyan-primary"
                />
                <p className="text-[10px] text-gray-600">Rolling timeframe for counting strikes per source IP.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-border flex items-center gap-2">
            <Mail className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-300">Global Notifications</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Email Alerts</h3>
                <p className="text-xs text-gray-400">Receive critical security summaries and block reports.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={settings.email_notifications}
                    onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning shadow-inner"></div>
              </label>
            </div>

            <div className={`space-y-2 transition-opacity ${!settings.email_notifications && 'opacity-30 pointer-events-none'}`}>
                <label className="text-xs font-bold text-gray-400 ml-1">Destination Address</label>
                <input 
                    type="email" 
                    placeholder="security-ops@enterprise.com"
                    value={settings.alert_email}
                    onChange={(e) => setSettings({...settings, alert_email: e.target.value})}
                    className="w-full bg-border/20 border border-border text-white px-4 py-3 rounded-xl focus:outline-none focus:border-warning transition-all text-sm font-mono"
                />
            </div>
          </div>
        </section>

        {/* System Info */}
        <div className="flex items-start gap-3 p-4 bg-cyan-primary/5 border border-cyan-primary/20 rounded-xl">
            <Info className="h-5 w-5 text-cyan-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
                <p className="text-xs font-medium text-cyan-primary/80 leading-relaxed italic">
                    Changes made here update the central Supabase configuration. The Raspberry Pi systemd services will automatically sync new thresholds within their next processing cycle.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    <Database className="h-3 w-3" />
                    <span>Central Config Table Link: system_config [ID: settings]</span>
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-cyan-primary hover:bg-cyan-secondary text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Save className="h-4 w-4" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
