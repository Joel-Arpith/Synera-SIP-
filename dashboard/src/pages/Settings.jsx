import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
  Settings as SettingsIcon,
  Ban,
  Zap,
  Save,
  Info,
  Cpu,
  Clock,
  Layers,
  BrainCircuit,
  Lock,
  RefreshCw,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/Card';

const Settings = () => {
  const [config, setConfig] = useState({
    auto_block: true,
    strike_threshold: 3,
    time_window_minutes: 60,
    llm_enabled: true,
    llm_min_severity: 'high'
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase.from('system_config').select('*').single();
    if (data) setConfig(data);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('system_config')
      .upsert({ id: config.id || 1, ...config });

    setSaving(false);
    setSaveStatus(error ? 'Error saving configuration' : 'Saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-[#94a3b8]" />
            System Control
          </h1>
          <p className="text-[#94a3b8] text-sm">Fine-tune detection sensitivity and automated response logic</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-5 text-[13px] font-semibold rounded-[var(--radius-md)] flex items-center gap-2 transition-opacity disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Synchronizing...' : 'Commit Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
        {/* Left Column: Core IDS Settings */}
        <div className="lg:col-span-7 space-y-8">
           <Card 
             title="Automated Defense Pipeline" 
             subtitle="Configure real-time IP restriction rules" 
             icon={Ban}
            >
              <div className="space-y-10 py-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-[#f8fafc]">Active Remediation</p>
                       <p className="text-xs text-[#94a3b8]">Immediately drop traffic from flagged IP addresses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.auto_block}
                        onChange={(e) => setConfig({...config, auto_block: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#1a1a24] border border-[#2a2a3a] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#475569] peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366f1] peer-checked:border-[#6366f130]"></div>
                    </label>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-[#f8fafc]">Strike Threshold</p>
                          <p className="text-xs text-[#94a3b8]">Number of alerts before IP is quarantined</p>
                       </div>
                       <span className="font-mono text-lg font-bold text-[#6366f1] bg-[#6366f110] px-3 py-1 rounded-lg border border-[#6366f120]">
                          {config.strike_threshold} Event(s)
                       </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={config.strike_threshold}
                      onChange={(e) => setConfig({...config, strike_threshold: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-[#1a1a24] rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-[#475569] uppercase tracking-widest px-1">
                       <span>Aggressive (1)</span>
                       <span>Medium (5)</span>
                       <span>Relaxed (10)</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-[#f8fafc]">Observation Window</p>
                          <p className="text-xs text-[#94a3b8]">Rolling window for event correlation</p>
                       </div>
                       <span className="font-mono text-lg font-bold text-[#94a3b8] bg-[#1a1a24] px-3 py-1 rounded-lg border border-[#2a2a3a]">
                          {config.time_window_minutes} Minutes
                       </span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      step="5"
                      value={config.time_window_minutes}
                      onChange={(e) => setConfig({...config, time_window_minutes: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-[#1a1a24] rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
                    />
                 </div>
              </div>
           </Card>

           <Card title="Database & Storage" icon={Layers}>
              <div className="space-y-6 py-2">
                 <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-xl border border-[#2a2a3a]">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-lg bg-[#3b82f610] text-[#3b82f6]">
                          <Info size={20} />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#f8fafc]">Alert Retention Policy</p>
                          <p className="text-[11px] text-[#475569]">Log artifacts are purged every 30 days automatically</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-bold text-[#6366f1] uppercase tracking-widest hover:underline">Change</button>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-[#ef444405] border border-[#ef444415] rounded-xl group hover:border-[#ef444430] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-lg bg-[#ef444410] text-[#ef4444]">
                          <Trash2 size={20} />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#ef4444]">Flush Alert Database</p>
                          <p className="text-[11px] text-[#475569]">Destructive action: removes all historical security records</p>
                       </div>
                    </div>
                    <button className="h-8 px-4 bg-[#ef4444]/10 text-[#ef4444] text-[10px] font-bold uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-[#ef444420]">Clear Logs</button>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Column: AI & Metadata */}
        <div className="lg:col-span-5 space-y-8">
           <Card
             title="LLM Cognitive Analysis"
             subtitle="OpenRouter Integration"
             icon={BrainCircuit}
             className="border-[#6366f120] shadow-glow"
           >
              <div className="space-y-8 py-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-[#f8fafc]">Explain Potential Incursions</p>
                       <p className="text-[11px] text-[#94a3b8]">Convert complex telemetry into human-readable intel</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.llm_enabled}
                        onChange={(e) => setConfig({...config, llm_enabled: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#1a1a24] border border-[#2a2a3a] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#475569] peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6366f1] peer-checked:border-[#6366f130]"></div>
                    </label>
                 </div>

                 <div className="space-y-3">
                    <p className="text-xs font-bold text-[#475569] uppercase tracking-widest pl-1">Threshold Activation</p>
                    <select 
                      className="w-full bg-[#0a0a0f] border border-[#2a2a3a] text-[#f8fafc] h-11 px-4 rounded-[12px] text-sm focus:border-[#6366f1] outline-none"
                      value={config.llm_min_severity}
                      onChange={(e) => setConfig({...config, llm_min_severity: e.target.value})}
                    >
                       <option value="critical">Critical Threats Only (Fastest)</option>
                       <option value="high">High + Critical (Recommended)</option>
                       <option value="medium">Medium and Above (Comprehensive)</option>
                       <option value="low">Examine All Traffic (High API Usage)</option>
                    </select>
                 </div>

                 <div className="p-5 bg-[#6366f110] border border-[#6366f120] rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap size={18} className="text-[#6366f1]" />
                       <span className="text-xs font-bold text-[#f8fafc]">Active Intelligence Model</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[11px]">
                          <span className="text-[#475569]">Model ID:</span>
                          <span className="text-[#f8fafc] font-mono">mistral-7b-instruct:free</span>
                       </div>
                       <div className="flex justify-between text-[11px]">
                          <span className="text-[#475569]">Latent Response Time:</span>
                          <span className="text-[#10b981]">~1.4s</span>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Environment Hardware" icon={Cpu}>
              <div className="space-y-4 pt-2">
                 {[
                   { icon: Clock, label: 'IDS Runtime', value: '14 Days, 22 Hours' },
                   { icon: Layers, label: 'Memory Pressure', value: '42%' },
                   { icon: Lock, label: 'Traffic Isolation', value: 'Level 4 (Promisc)' }
                 ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#111118] border border-[#2a2a3a] rounded-lg">
                       <div className="flex items-center gap-3">
                          <stat.icon size={14} className="text-[#475569]" />
                          <span className="text-xs text-[#94a3b8]">{stat.label}</span>
                       </div>
                       <span className="text-xs font-bold font-mono text-[#f8fafc]">{stat.value}</span>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* Floating Status Notification */}
      {saveStatus && (
        <div
          className="fixed bottom-8 right-8 px-5 py-3 rounded-[var(--radius-lg)] flex items-center gap-3 animate-slide-up z-[100]"
          style={{ background: saveStatus === 'Saved' ? 'var(--success)' : 'var(--danger)', color: '#fff', boxShadow: 'var(--shadow-elevated)' }}
        >
          <CheckCircle2 size={16} />
          <span className="text-[13px] font-semibold">{saveStatus}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
