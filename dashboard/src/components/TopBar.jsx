import React, { useState, useEffect } from 'react';
import { Bell, User, Clock, Search } from 'lucide-react';
import { supabase } from '../supabase';
import { format } from 'date-fns';

const TopBar = ({ title = "Dashboard" }) => {
  const [lastAlert, setLastAlert] = useState(null);
  const [systemOnline, setSystemOnline] = useState(true);

  useEffect(() => {
    supabase.from('alerts')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]) setLastAlert(new Date(data[0].timestamp));
      });

    const channel = supabase.channel('system-status')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, () => {
        setLastAlert(new Date());
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <header className="h-16 border-b border-[#d2d2d7]/20 bg-white/70 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-6">
        <h2 className="text-[20px] font-bold text-black tracking-tight">{title}</h2>
        
        <div className="h-4 w-[1px] bg-[#d2d2d7]/50 hidden md:block" />
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/30">
            <span className={`h-1.5 w-1.5 rounded-full ${systemOnline ? 'bg-[#34c759]' : 'bg-[#ff3b30]'} shadow-sm`} />
            <span className="text-[10px] font-bold text-[#86868b] tracking-wider uppercase">
                {systemOnline ? 'Active Shield' : 'System Halted'}
            </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {lastAlert && (
          <div className="hidden lg:flex items-center gap-2 text-[#86868b] bg-[#f5f5f7]/50 px-4 py-1.5 rounded-full border border-[#d2d2d7]/10">
            <Clock size={14} className="opacity-60" />
            <span className="text-[12px] font-medium">Synced: {format(lastAlert, 'HH:mm:ss')}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" size={15} />
            <input 
              type="text" 
              placeholder="Search telemetry..." 
              className="bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-[#d2d2d7] rounded-full h-9 pl-10 pr-4 text-[13px] w-48 transition-all duration-300 outline-none"
            />
          </div>

          <button className="p-2.5 text-[#86868b] hover:text-black hover:bg-[#f5f5f7] rounded-full transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-[#ff3b30] border-2 border-white rounded-full" />
          </button>
          
          <div className="h-6 w-[1px] bg-[#d2d2d7]/50 ml-1" />
          
          <button className="flex items-center gap-3 pl-2 transition-all group">
            <div className="p-1.5 bg-[#f5f5f7] group-hover:bg-[#e8e8ed] text-black rounded-full border border-[#d2d2d7]/20 transition-all">
              <User size={18} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
