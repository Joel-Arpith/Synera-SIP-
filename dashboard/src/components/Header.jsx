import React, { useState, useEffect } from 'react';
import { Activity, Bell, User as UserIcon, Clock } from 'lucide-react';
import { supabase } from '../supabase';

const Header = ({ user }) => {
  const [lastAlert, setLastAlert] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online');

  useEffect(() => {
    // Fetch last alert timestamp
    const fetchLastAlert = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setLastAlert(data[0].timestamp);
    };

    fetchLastAlert();

    // Subscribe to new alerts to update timestamp
    const channel = supabase
      .channel('header-updates')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
        setLastAlert(payload.new.timestamp);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <header className="h-16 bg-surface/50 backdrop-blur-md border-b border-border px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${systemStatus === 'online' ? 'bg-success animate-pulse' : 'bg-danger'}`} />
          <span className="text-sm font-semibold tracking-wide uppercase text-gray-400">
            System {systemStatus}
          </span>
        </div>
        
        {lastAlert && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-border">
            <Clock className="h-4 w-4 text-cyan-primary" />
            <span className="text-xs text-gray-300">
              Last Alert: {new Date(lastAlert).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/5 rounded-full relative text-gray-400 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full border border-surface" />
        </button>
        
        <div className="h-8 w-[1px] bg-border mx-2" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-gray-200">{user.email}</p>
            <p className="text-[10px] text-cyan-primary font-bold uppercase tracking-widest">Administrator</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-cyan-primary/20 border border-cyan-primary/30 flex items-center justify-center text-cyan-primary">
            <UserIcon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
