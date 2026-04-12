import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Calendar,
  Zap,
  ShieldCheck
} from 'lucide-react';
import Card from '../components/Card';
import AlertRow from '../components/AlertRow';
import EmptyState from '../components/EmptyState';

const AlertLog = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [page, searchTerm, severityFilter, typeFilter]);

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
    if (severityFilter !== 'all') {
      query = query.eq('severity', severityFilter);
    }
    if (typeFilter !== 'all') {
      query = query.eq('attack_type', typeFilter);
    }

    const { data, error } = await query;
    if (data) setAlerts(data);
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Type', 'Signature', 'Source IP', 'Dest IP', 'Severity', 'Country'];
    const rows = alerts.map(a => [
        a.timestamp, a.attack_type, a.signature, a.src_ip, a.dest_ip, a.severity, a.country
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `synera_alerts_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Database className="h-6 w-6 text-[#6366f1]" />
            Alert Archive
          </h1>
          <p className="text-[#94a3b8] text-sm">Comprehensive history of all detected security events</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
            <input 
              type="text" 
              placeholder="Filter by IP or Signature..."
              className="bg-[#111118] border border-[#2a2a3a] text-[#f8fafc] h-10 pl-10 pr-4 w-[280px] rounded-[10px] text-sm focus:border-[#6366f1] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 h-10 px-4 bg-[#111118] border border-[#2a2a3a] text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] rounded-[10px] text-sm font-medium transition-all"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center bg-[#111118]/40">
        <div className="flex items-center gap-2 text-xs font-bold text-[#475569] uppercase tracking-widest mr-2">
            <Filter size={14} />
            Refine Search:
        </div>
        
        <select 
          className="bg-[#0a0a0f] border border-[#2a2a3a] text-[#94a3b8] h-9 px-3 rounded-[8px] text-xs font-medium outline-none hover:border-[#475569]"
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
        >
          <option value="all">Any Severity</option>
          <option value="critical">Critical Only</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>

        <select 
          className="bg-[#0a0a0f] border border-[#2a2a3a] text-[#94a3b8] h-9 px-3 rounded-[8px] text-xs font-medium outline-none hover:border-[#475569]"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
        >
          <option value="all">Any Attack Type</option>
          <option value="RECONNAISSANCE">Reconnaissance</option>
          <option value="DOS">Denial of Service</option>
          <option value="EXPLOIT">System Exploit</option>
          <option value="MALWARE">Malware Detection</option>
        </select>

        <div className="h-4 w-[1px] bg-[#2a2a3a] hidden md:block" />

        <div className="flex items-center gap-2 text-[11px] text-[#475569]">
           <Calendar size={14} />
           <span>Showing page {page + 1}</span>
        </div>
      </div>

      {/* Results Table */}
      <Card icon={Zap} title="Historical Telemetry">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="soc-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Time</th>
                <th style={{ width: 120 }}>Incursion</th>
                <th>Threat Signature</th>
                <th style={{ width: 140 }}>Origin IP</th>
                <th style={{ width: 140 }}>Location</th>
                <th style={{ width: 64 }}></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <AlertRow 
                  key={alert.id} 
                  alert={alert} 
                  isExpanded={expandedRow === alert.id}
                  onToggle={() => setExpandedRow(expandedRow === alert.id ? null : alert.id)}
                />
              ))}
            </tbody>
          </table>
          
          {loading && (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-8 w-8 border-2 border-[#6366f130] border-t-[#6366f1] rounded-full animate-spin" />
                <p className="text-xs font-mono text-[#475569] uppercase tracking-[0.3em]">Querying Alert Database...</p>
             </div>
          )}

          {!loading && alerts.length === 0 && (
             <EmptyState 
               icon={ShieldCheck} 
               title="Zero Records Found" 
               message="No alerts match your current filter criteria. Try adjusting your parameters." 
             />
          )}
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-[#1e1e2e] flex items-center justify-between">
            <span className="text-xs text-[#475569] font-medium tracking-tight">
               Viewing records {page * pageSize + 1} – {Math.min((page + 1) * pageSize, alerts.length + page * pageSize)}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#111118] border border-[#2a2a3a] rounded-[10px] text-sm text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={alerts.length < pageSize}
                className="flex items-center gap-2 px-4 py-2 bg-[#111118] border border-[#2a2a3a] rounded-[10px] text-sm text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-20 transition-all"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default AlertLog;
