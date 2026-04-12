import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Shield, 
  Activity, 
  Ban, 
  Zap, 
  TrendingUp, 
  PieChart as PieIcon,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import AlertRow from '../components/AlertRow';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activeThreats: 0,
    blockedCount: 0,
    explanationCount: 0
  });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchAlerts();
    fetchStats();

    const channel = supabase
      .channel('live-alerts-v3')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
        setAlerts(prev => [payload.new, ...prev].slice(0, 10));
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
      .limit(10);
    if (data) setAlerts(data);
  };

  const fetchStats = async () => {
    const { data: alertsData } = await supabase.from('alerts').select('severity');
    const { count: blockedCount } = await supabase.from('blocked_ips').select('*', { count: 'exact', head: true });
    const { count: explanationCount } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('explanation_status', 'generated');

    if (alertsData) {
        setStats({
            total: alertsData.length,
            blockedCount: blockedCount || 0,
            explanationCount: explanationCount || 0,
            activeThreats: alertsData.filter(a => a.severity === 'critical' || a.severity === 'high').length
        });
    }
  };

  const updateRealtimeStats = (newAlert) => {
    setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        activeThreats: (newAlert.severity === 'critical' || newAlert.severity === 'high') ? prev.activeThreats + 1 : prev.activeThreats
    }));
  };

  const chartData = [
    { name: 'Recon', value: alerts.filter(a => a.attack_type === 'RECONNAISSANCE').length, color: '#007aff' },
    { name: 'DoS', value: alerts.filter(a => a.attack_type === 'DOS').length, color: '#ff3b30' },
    { name: 'Exploit', value: alerts.filter(a => a.attack_type === 'EXPLOIT').length, color: '#ff9500' },
    { name: 'Malware', value: alerts.filter(a => a.attack_type === 'MALWARE').length, color: '#af52de' },
  ];

  const pieData = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: '#ff3b30' },
    { name: 'High', value: alerts.filter(a => a.severity === 'high').length, color: '#ff9500' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium').length, color: '#ffcc00' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length, color: '#8e8e93' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-10 animate-fade pb-10">
      {/* Narrative Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[32px] font-bold text-black tracking-tight">Security Posture</h1>
        <p className="text-[15px] text-[#86868b] font-medium leading-relaxed max-w-2xl">
          Real-time analysis of incursion telemetry across the edge network. Protecting {stats.total.toLocaleString()} unique data points today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Network Loads" value={stats.total} icon={Shield} color="#000000" />
        <StatCard label="Active Incursions" value={stats.activeThreats} icon={Activity} color="#ff3b30" trend="+3 today" />
        <StatCard label="Hard Blocks" value={stats.blockedCount} icon={Ban} color="#000000" />
        <StatCard label="AI Synthesis" value={stats.explanationCount} icon={Zap} color="#af52de" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card title="Traffic Vector Analysis" subtitle="Classification of inbound malicious loads" icon={TrendingUp} className="lg:col-span-8">
           <div className="h-[340px] w-full pt-6">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d2d2d7" opacity={0.3} />
                    <XAxis 
                       dataKey="name" 
                       stroke="#86868b" 
                       fontSize={12} 
                       fontWeight={500}
                       axisLine={false}
                       tickLine={false}
                       dy={10}
                    />
                    <YAxis 
                       stroke="#86868b" 
                       fontSize={12} 
                       fontWeight={500}
                       axisLine={false}
                       tickLine={false}
                    />
                    <Tooltip 
                       cursor={{fill: '#f5f5f7'}}
                       contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(210, 210, 215, 0.5)', 
                          borderRadius: '14px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                       }}
                       labelStyle={{ fontWeight: 700, color: '#1d1d1f', marginBottom: '4px' }}
                       itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={44}>
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <Card title="Risk Topography" subtitle="Severity distribution mapping" icon={PieIcon} className="lg:col-span-4">
           <div className="h-[340px] w-full relative flex flex-col items-center justify-center pt-4">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={pieData}
                       innerRadius={75}
                       outerRadius={105}
                       paddingAngle={10}
                       dataKey="value"
                       animationBegin={0}
                       animationDuration={1500}
                    >
                       {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                       ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(210, 210, 215, 0.5)', 
                          borderRadius: '14px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                       }}
                    />
                 </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4 absolute bottom-6 w-full">
                 {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                       <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                       <span className="text-[12px] font-bold text-black opacity-60">{d.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      {/* Live Table */}
      <Card 
        title="Live Incursion Telemetry" 
        subtitle="Real-time detection logs from edge sensors"
        icon={Globe} 
        action={
           <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#34c759]/10 border border-[#34c759]/20">
              <span className="h-2 w-2 rounded-full bg-[#34c759] animate-pulse-soft shadow-[0_0_10px_rgba(52,199,89,0.5)]" />
              <span className="text-[11px] font-bold text-[#1c7b30] tracking-widest uppercase">Streaming Live</span>
           </div>
        }
      >
        <div className="overflow-x-auto min-h-[440px] pt-4">
          <table className="soc-table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Timestamp</th>
                <th style={{ width: 140 }}>Vector</th>
                <th>Signature Pattern</th>
                <th style={{ width: 160 }}>Origin Host</th>
                <th style={{ width: 140 }}>Geo Location</th>
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
          {alerts.length === 0 && (
             <EmptyState 
               icon={ShieldCheck} 
               title="Perimeter Secured" 
               message="Our edge nodes are currently reporting zero active vulnerabilities. Network integrity is maintained." 
             />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
