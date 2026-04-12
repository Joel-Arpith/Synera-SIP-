import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Shield, 
  Activity, 
  Ban, 
  Zap, 
  TrendingUp, 
  PieChart as PieIcon,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
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
      .channel('live-alerts-v2')
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
    { name: 'RECON', value: alerts.filter(a => a.attack_type === 'RECONNAISSANCE').length, color: '#6366f1' },
    { name: 'DOS', value: alerts.filter(a => a.attack_type === 'DOS').length, color: '#ef4444' },
    { name: 'EXPLOIT', value: alerts.filter(a => a.attack_type === 'EXPLOIT').length, color: '#f59e0b' },
    { name: 'MALWARE', value: alerts.filter(a => a.attack_type === 'MALWARE').length, color: '#8b5cf6' },
  ];

  const pieData = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: alerts.filter(a => a.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Alerts" value={stats.total} icon={Shield} color="#94a3b8" />
        <StatCard label="Active Threats" value={stats.activeThreats} icon={Activity} color="#ef4444" trend="+3 today" />
        <StatCard label="Blocked IPs" value={stats.blockedCount} icon={Ban} color="#f97316" />
        <StatCard label="AI Insights" value={stats.explanationCount} icon={Zap} color="#6366f1" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card title="Threat Classification" subtitle="Alerts by type (Last 50 events)" icon={TrendingUp} className="lg:col-span-8">
           <div className="h-[320px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      fontSize={11} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={11} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.03)'}}
                      contentStyle={{ backgroundColor: '#111118', border: '1px solid #2a2a3a', borderRadius: '10px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <Card title="Risk Topology" subtitle="Severity distribution" icon={PieIcon} className="lg:col-span-4">
           <div className="h-[320px] w-full relative flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                 <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#111118', border: '1px solid #2a2a3a', borderRadius: '10px' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                 {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                       <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{d.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      {/* Live Stream Table */}
      <Card 
        title="Live Threat Stream" 
        icon={Zap} 
        action={
           <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#10b98110] border border-[#10b98120]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-[#10b981] tracking-widest uppercase">Real-Time Active</span>
           </div>
        }
      >
        <div className="overflow-x-auto min-h-[400px]">
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
          {alerts.length === 0 && (
             <EmptyState 
               icon={ShieldCheck} 
               title="Secure Perimeter" 
               message="No active threats detected on the network. All systems operational." 
             />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
