import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../supabase';
import { format } from 'date-fns';

const TopBar = ({ title = 'Dashboard' }) => {
  const [lastAlert, setLastAlert] = useState(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    supabase
      .from('alerts')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setLastAlert(new Date(data[0].timestamp)); });

    const ch = supabase
      .channel('topbar-status')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, () => setLastAlert(new Date()))
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []);

  return (
    <header
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
          {title}
        </h2>

        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase"
          style={{
            background: online ? 'var(--success-dim)' : 'var(--danger-dim)',
            color: online ? 'var(--success)' : 'var(--danger)',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse-soft"
            style={{ background: online ? 'var(--success)' : 'var(--danger)' }}
          />
          {online ? 'Active' : 'Halted'}
        </div>
      </div>

      {/* Right */}
      {lastAlert && (
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-3)' }}>
          <Clock size={13} />
          <span>Last event {format(lastAlert, 'HH:mm:ss')}</span>
        </div>
      )}
    </header>
  );
};

export default TopBar;
