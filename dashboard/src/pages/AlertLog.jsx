import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  SearchCode
} from 'lucide-react';
import { format } from 'date-fns';

const AlertLog = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const pageSize = 50;

  useEffect(() => {
    fetchAlerts();

    // Realtime listener for explanation updates
    const channel = supabase
      .channel('alerts-explanation-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'alerts'
      }, (payload) => {
        setAlerts(prev => prev.map(a =>
          a.id === payload.new.id ? { ...a, ...payload.new } : a
        ));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [page, searchTerm]);

  const fetchAlerts = async () => {
    setLoading(true);
    let query = supabase
      .from('alerts')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (searchTerm) {
        query = query.or(`src_ip.ilike.%${searchTerm}%,signature.ilike.%${searchTerm}%`);
    }

    const { data, count } = await query;
    if (data) setAlerts(data);
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "Attack Type", "Signature", "Src IP", "Dest IP", "Src Port", "Dest Port", "Severity", "Country"];
    const rows = alerts.map(a => [
        a.timestamp,
        a.attack_type,
        a.signature,
        a.src_ip,
        a.dest_ip,
        a.src_port,
        a.dest_port,
        a.severity,
        a.country
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cyberids_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderExplanation = (explanationJson) => {
    let parsed;
    try { parsed = JSON.parse(explanationJson); }
    catch { return <div style={{color:'#ef4444'}}>Parse error</div>; }
    
    const threatColor = {
      'Low Risk': '#10b981',
      'Moderate Risk': '#f59e0b', 
      'High Risk': '#f97316',
      'Critical Threat': '#ef4444'
    }[parsed.threat_level] || '#6b7280';
  
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <span style={{
          display:'inline-block', padding:'2px 10px',
          borderRadius:4, background: threatColor+'22',
          color: threatColor, border:`1px solid ${threatColor}`,
          fontSize:12, fontWeight:'bold', width:'fit-content'
        }}>
          {parsed.threat_level}
        </span>
        {[
          { label:'🔍 What happened', value: parsed.what_happened },
          { label:'⚠️ Why it matters', value: parsed.why_it_matters },
          { label:'✅ Action', value: parsed.action }
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ color:'#9ca3af', fontSize:11, 
                          fontWeight:'bold', marginBottom:2 }}>
              {label}
            </div>
            <div style={{ color:'#e5e7eb', fontSize:13, lineHeight:1.5 }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <History className="h-6 w-6 text-cyan-primary" />
            Alert Archive
          </h1>
          <p className="text-gray-400 text-sm">Comprehensive history of all detected security events</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Filter by IP or Signature..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="bg-border/30 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-primary transition-all w-64"
            />
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-border/50 border border-border rounded-lg hover:bg-white/10 transition-all text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Signature</th>
                <th>Source Address</th>
                <th>Geo</th>
                <th>Severity</th>
                <th className="text-right">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan="7" className="text-center py-20 text-gray-600">Retrieving alert database...</td>
                </tr>
              ) : alerts.map((alert) => (
                <React.Fragment key={alert.id}>
                  <tr>
                  <td className="text-gray-400 text-xs">
                    {format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td>
                    <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded">
                        {alert.attack_type}
                    </span>
                  </td>
                  <td className="max-w-md truncate text-white">{alert.signature}</td>
                  <td>
                     <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-primary">{alert.src_ip}</span>
                        <span className="text-[10px] text-gray-500">:{alert.src_port}</span>
                     </div>
                  </td>
                  <td className="text-xs uppercase text-gray-400">{alert.country || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${alert.severity}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => setExpandedRow(expandedRow === alert.id ? null : alert.id)}
                      className={`p-1 hover:bg-white/5 rounded transition-all ${expandedRow === alert.id ? 'text-cyan-primary rotate-180' : 'text-gray-500'}`}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                {expandedRow === alert.id && (
                  <tr>
                    <td colSpan={7} className="bg-[#0d1117] p-6 border-b border-border shadow-inner">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Raw Alert Data */}
                        <div className="space-y-4">
                          <p className="text-[#06b6d4] text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-cyan-primary" />
                             Raw Telemetry
                          </p>
                          <div className="font-mono text-[11px] text-gray-500 space-y-2 bg-black/20 p-4 rounded-lg border border-white/5">
                            <div className="flex justify-between">
                                <span>Signature:</span> 
                                <span className="text-gray-300">{alert.signature}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Protocol:</span> 
                                <span className="text-gray-300">{alert.proto}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ports:</span> 
                                <span className="text-gray-300">{alert.src_port} → {alert.dest_port}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Category:</span> 
                                <span className="text-gray-300">{alert.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Aggregated:</span> 
                                <span className="text-gray-300">{alert.grouped ? `Yes (×${alert.count})` : 'No'}</span>
                            </div>
                          </div>
                        </div>

                        {/* LLM Explanation */}
                        <div className="space-y-4">
                          <p className="text-[#8b5cf6] text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                             AI Threat Insight
                          </p>
                          <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10 min-h-[150px] flex flex-col justify-center">
                            {alert.explanation_status === 'pending' && (
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <div className="h-5 w-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    <p className="text-xs text-gray-500 italic font-medium">Analyzing threat patterns with AI...</p>
                                </div>
                            )}

                            {alert.explanation_status === 'skipped' && (
                                <p className="text-xs text-gray-500 italic text-center py-6">Insight unavailable (rate limited)</p>
                            )}

                            {alert.explanation_status === 'failed' && (
                                <p className="text-xs text-danger/50 italic text-center py-6">Failed to generate AI insight</p>
                            )}

                            {alert.explanation_status === 'generated' && 
                              renderExplanation(alert.explanation)}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-white/2">
           <span className="text-xs text-gray-500">
             Showing page {page + 1}
           </span>
           <div className="flex gap-2">
             <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 border border-border rounded-lg hover:bg-white/5 disabled:opacity-20"
             >
                <ChevronLeft className="h-4 w-4" />
             </button>
             <button 
                onClick={() => setPage(p => p + 1)}
                disabled={alerts.length < pageSize}
                className="p-2 border border-border rounded-lg hover:bg-white/5 disabled:opacity-20"
             >
                <ChevronRight className="h-4 w-4" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AlertLog;
