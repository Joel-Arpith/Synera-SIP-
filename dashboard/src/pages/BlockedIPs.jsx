import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Ban, 
  Trash2, 
  Globe, 
  Calendar, 
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { format } from 'date-fns';

const BlockedIPs = () => {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    fetchBlocked();
  }, [searchTerm]);

  const fetchBlocked = async () => {
    let query = supabase
      .from('blocked_ips')
      .select('*')
      .order('blocked_at', { ascending: false });

    if (searchTerm) {
      query = query.ilike('ip_address', `%${searchTerm}%`);
    }

    const { data } = await query;
    if (data) setBlocked(data);
    setLoading(false);
  };

  const handleUnblock = async (ip) => {
    const { error } = await supabase
      .from('blocked_ips')
      .delete()
      .eq('ip_address', ip);
    
    if (!error) {
       setBlocked(prev => prev.filter(b => b.ip_address !== ip));
       setShowConfirm(null);
       // Also log unblock activity or refresh stats if needed
    }
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Ban className="h-6 w-6 text-[#ef4444]" />
            Firewall Policy
          </h1>
          <p className="text-[#94a3b8] text-sm">Active IP blocks currently being enforced by the edge IDS</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <input 
            type="text" 
            placeholder="Search restricted IPs..."
            className="bg-[#111118] border border-[#2a2a3a] text-[#f8fafc] h-11 pl-10 pr-4 w-[320px] rounded-[12px] text-sm focus:border-[#ef4444] outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card 
        title="Restricted Access List" 
        icon={ShieldAlert}
        action={
           <div className="flex items-center gap-2 text-[10px] font-bold text-[#ef4444] tracking-[0.2em] uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-[#ef4444] animate-pulse" />
              Active Quarantine
           </div>
        }
      >
        <div className="overflow-x-auto min-h-[400px]">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Origin / Network Address</th>
                <th>Region</th>
                <th>Violation Reason</th>
                <th>Enforced Since</th>
                <th>Attack Count</th>
                <th className="text-right">Management</th>
              </tr>
            </thead>
            <tbody>
              {blocked.map((block) => (
                <tr key={block.id} className="group hover:bg-[#ef444405]">
                  <td>
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#ef444410] text-[#ef4444]">
                           <ShieldAlert size={16} />
                        </div>
                        <span className="font-mono text-sm font-bold text-[#ef4444]">{block.ip_address}</span>
                     </div>
                  </td>
                  <td>
                     <div className="flex items-center gap-2 text-[#94a3b8]">
                        <Globe size={14} className="opacity-40" />
                        <span className="text-sm font-medium">{block.country || 'N/A'}</span>
                     </div>
                  </td>
                  <td className="max-w-[240px] truncate text-xs text-[#94a3b8]">
                     {block.reason || 'Threshold Exceeded'}
                  </td>
                  <td>
                     <div className="flex items-center gap-2 text-[#475569] font-mono text-[11px]">
                        <Calendar size={12} />
                        {format(new Date(block.blocked_at), 'yyyy-MM-dd HH:mm')}
                     </div>
                  </td>
                  <td>
                     <Badge type="high">{block.alert_count || 1}x Alerts</Badge>
                  </td>
                  <td className="text-right">
                     {showConfirm === block.ip_address ? (
                        <div className="flex items-center justify-end gap-2 animate-fade">
                           <button 
                             onClick={() => handleUnblock(block.ip_address)}
                             className="p-1 px-3 bg-[#ef4444] text-white text-[10px] font-bold uppercase rounded hover:bg-[#dc2626] transition-colors"
                           >
                              Confirm
                           </button>
                           <button 
                             onClick={() => setShowConfirm(null)}
                             className="p-1 px-3 bg-[#111118] border border-[#2a2a3a] text-[#94a3b8] text-[10px] font-bold uppercase rounded hover:text-white transition-colors"
                           >
                              Cancel
                           </button>
                        </div>
                     ) : (
                        <button 
                          onClick={() => setShowConfirm(block.ip_address)}
                          className="p-2 text-[#475569] hover:text-[#ef4444] hover:bg-[#ef444410] rounded-lg transition-all"
                        >
                           <Trash2 size={18} />
                        </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && blocked.length === 0 && (
            <EmptyState 
              icon={CheckCircle2} 
              title="Clean Perimeter" 
              message="No IP addresses are currently flagged for blocking. All traffic is being routed normally." 
            />
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-8 w-8 border-2 border-[#ef444430] border-t-[#ef4444] rounded-full animate-spin" />
                <p className="text-xs font-mono text-[#475569] uppercase tracking-[0.3em]">Synching Policy Engine...</p>
             </div>
          )}
        </div>
      </Card>

      {/* Warning Alert */}
      {blocked.length > 50 && (
         <div className="p-4 bg-[#f59e0b10] border border-[#f59e0b30] rounded-xl flex items-center gap-4 text-[#f59e0b]">
            <span className="h-10 w-10 shrink-0 rounded-lg bg-[#f59e0b15] flex items-center justify-center">
               <ShieldAlert size={20} />
            </span>
            <div className="space-y-1">
               <p className="text-sm font-bold tracking-tight">Large Quarantine Warning</p>
               <p className="text-xs opacity-80">You have over {blocked.length} active blocks. Consider reviewing older restrictions to optimize network performance.</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default BlockedIPs;
