import React, { useState, useEffect } from 'react';
import { Bell, User, Clock } from 'lucide-react';
import { supabase } from '../supabase';
import { format } from 'date-fns';

const TopBar = ({ title = "Dashboard" }) => {
  const [lastAlert, setLastAlert] = useState(null);
  const [systemOnline, setSystemOnline] = useState(true);

  useEffect(() => {
    // Check most recent alert for timestamp
    supabase.from('alerts')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]) setLastAlert(new Date(data[0].timestamp));
      });

    // Real-time listener for status
    const channel = supabase.channel('system-status')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, () => {
        setLastAlert(new Date());
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <header className="h-[56px] border-b border-[#2a2a3a] bg-[#0a0a0f] flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#f8fafc]">{title}</h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#111118] border border-[#2a2a3a]">
            <span className={`h-1.5 w-1.5 rounded-full ${systemOnline ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />
            <span className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase">
                SYSTEM {systemOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {lastAlert && (
          <div className="hidden md:flex items-center gap-2 text-[#475569]">
            <Clock size={14} />
            <span className="text-xs">Last Activity: {format(lastAlert, 'HH:mm:ss')}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1a24] rounded-lg transition-smooth relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-[#ef4444] rounded-full" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-[#2a2a3a]">
            <div className="p-2 bg-[#6366f115] text-[#6366f1] rounded-lg">
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
