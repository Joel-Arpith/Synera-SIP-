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
  const pageSize = 50;

  useEffect(() => {
    fetchAlerts();
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
                <tr key={alert.id}>
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
                    <button className="p-1 hover:bg-white/5 rounded text-gray-500">
                        <SearchCode className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
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
