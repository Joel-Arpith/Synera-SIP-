import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  ShieldAlert, 
  Unlock, 
  Search, 
  Filter, 
  MoreVertical,
  Flag,
  Calendar,
  AlertOctagon
} from 'lucide-react';
import { format } from 'date-fns';

const BlockedIPs = () => {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBlocked();

    const channel = supabase
      .channel('blocked-sync')
      .on('postgres_changes', { event: '*', table: 'blocked_ips' }, () => {
        fetchBlocked();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchBlocked = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blocked_ips')
      .select('*')
      .order('timestamp', { ascending: false });
    if (data) setBlocked(data);
    setLoading(false);
  };

  const handleUnblock = async (ip) => {
    if (!confirm(`Are you sure you want to unblock ${ip}? This will restore its access to the network.`)) return;

    try {
        const response = await fetch('/api/unblock-ip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json.stringify({ ip })
        });
        
        // If local API fails (e.g. Pi is offline), we can still update Supabase directly as a fallback
        const { error } = await supabase
            .from('blocked_ips')
            .update({ unblocked: true })
            .eq('ip', ip);
            
        if (error) throw error;
        alert(`${ip} has been unblocked.`);
    } catch (e) {
        console.error(e);
        alert('Failed to unblock IP. Check console for details.');
    }
  };

  const filtered = blocked.filter(item => 
    item.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-danger" />
            Firewall Controls
          </h1>
          <p className="text-gray-400 text-sm">Manage automated and manual IP blocking rules</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by IP or Reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-border/30 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-primary transition-all w-64"
            />
          </div>
          <button className="p-2 bg-border/50 border border-border rounded-lg hover:bg-white/5 transition-all">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Target IP</th>
                <th>Country</th>
                <th>Trigger Reason</th>
                <th>Strikes</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan="7" className="text-center py-20 text-gray-600">Loading firewall data...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan="7" className="text-center py-20">
                     <div className="flex flex-col items-center gap-2 opacity-30">
                        <AlertOctagon className="h-10 w-10" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Active Blocks Found</p>
                     </div>
                   </td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item.ip} className={item.unblocked ? 'opacity-50' : ''}>
                  <td>
                    <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${item.unblocked ? 'bg-gray-500' : 'bg-danger animate-pulse'}`} />
                        <span className="font-bold text-white tracking-tight">{item.ip}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                        <Flag className="h-3 w-3 text-gray-500" />
                        <span className="text-xs uppercase">{item.country || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="max-w-xs truncate text-xs text-gray-400 italic">
                    {item.reason}
                  </td>
                  <td>
                    <span className="font-mono text-danger font-bold bg-danger/10 px-1.5 py-0.5 rounded">
                        {item.alert_count} Hits
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(item.timestamp), 'MMM dd, HH:mm')}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.unblocked ? 'badge-low' : 'badge-critical'}`}>
                        {item.unblocked ? 'Unblocked' : 'Active'}
                    </span>
                  </td>
                  <td className="text-right">
                    {!item.unblocked && (
                        <button 
                            onClick={() => handleUnblock(item.ip)}
                            className="p-2 hover:bg-danger/10 text-danger rounded-lg transition-all group"
                        >
                            <Unlock className="h-4 w-4 group-hover:-rotate-12 transition-transform" />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockedIPs;
