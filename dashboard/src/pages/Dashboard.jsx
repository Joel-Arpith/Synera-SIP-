import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  ShieldAlert, 
  Activity, 
  Target, 
  Globe, 
  TrendingUp, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activeThreats: 0,
    blockedCount: 0,
    mostAttackedPort: '80'
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();

    // Real-time subscription
    const channel = supabase
      .channel('live-alerts')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
        setAlerts(prev => [payload.new, ...prev].slice(0, 50));
        updateRealtimeStats(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    if (data) setAlerts(data);
  };

  const fetchStats = async () => {
    const { data: alertsData } = await supabase.from('alerts').select('severity, dest_port');
    const { count: blockedCount } = await supabase.from('blocked_ips').select('*', { count: 'exact' });

    if (alertsData) {
        // Simple logic for stats
        setStats(prev => ({
            ...prev,
            total: alertsData.length,
            blockedCount: blockedCount || 0,
            activeThreats: alertsData.filter(a => a.severity === 'critical' || a.severity === 'high').length
        }));
    }
  };

  const updateRealtimeStats = (newAlert) => {
    setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        activeThreats: (newAlert.severity === 'critical' || newAlert.severity === 'high') ? prev.activeThreats + 1 : prev.activeThreats
    }));
  };

  // Chart Data preparation
  const chartData = [
    { name: 'RECON', value: alerts.filter(a => a.attack_type === 'RECONNAISSANCE').length },
    { name: 'DOS', value: alerts.filter(a => a.attack_type === 'DOS').length },
    { name: 'EXPLOIT', value: alerts.filter(a => a.attack_type === 'EXPLOIT').length },
    { name: 'MALWARE', value: alerts.filter(a => a.attack_type === 'MALWARE').length },
  ];

  const SEVERITY_COLORS = { 
    critical: '#ef4444', 
    high: '#f59e0b', 
    medium: '#facc15', 
    low: '#9ca3af' 
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: stats.total, icon: ShieldAlert, color: 'text-cyan-primary', bg: 'bg-cyan-primary/10' },
          { label: 'Active Threats', value: stats.activeThreats, icon: Activity, color: 'text-danger', bg: 'bg-danger/10' },
          { label: 'Blocked IPs', value: stats.blockedCount, icon: Target, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Top Port', value: stats.mostAttackedPort, icon: Globe, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center justify-between group hover:border-white/20 transition-all">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold font-mono text-white">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-primary" />
              Alert Frequency (Last 50 Events)
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#4b5563" />
                <YAxis stroke="#4b5563" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Severity Dist.
          </h2>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length },
                    { name: 'High', value: alerts.filter(a => a.severity === 'high').length },
                    { name: 'Med', value: alerts.filter(a => a.severity === 'medium').length },
                    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={SEVERITY_COLORS.critical} />
                  <Cell fill={SEVERITY_COLORS.high} />
                  <Cell fill={SEVERITY_COLORS.medium} />
                  <Cell fill={SEVERITY_COLORS.low} />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Alerts Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-primary animate-pulse" />
            Live Threat Stream
          </h2>
          <span className="text-[10px] bg-white/5 border border-border px-2 py-1 rounded text-gray-500 uppercase tracking-widest font-bold">
            Real-time Enabled
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Signature</th>
                <th>Src IP</th>
                <th>Dest IP</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <td className="text-gray-400">{format(new Date(alert.timestamp), 'HH:mm:ss')}</td>
                  <td>
                    <span className="text-xs font-bold text-gray-300">{alert.attack_type}</span>
                  </td>
                  <td className="max-w-xs truncate font-medium">{alert.signature}</td>
                  <td className="text-cyan-primary">{alert.src_ip}</td>
                  <td>{alert.dest_ip}</td>
                  <td>
                    <span className={`badge badge-${alert.severity}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td>
                    {alert.count > 1 ? (
                        <span className="text-[10px] bg-cyan-primary/20 text-cyan-primary px-1.5 py-0.5 rounded font-bold">
                            X{alert.count}
                        </span>
                    ) : (
                        <span className="h-2 w-2 rounded-full bg-success inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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

export default Dashboard;
