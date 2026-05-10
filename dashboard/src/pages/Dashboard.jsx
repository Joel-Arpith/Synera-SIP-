import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
  Shield, Activity, Ban, Zap,
  TrendingUp, PieChart as PieIcon, ShieldCheck, Globe
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import AlertRow from '../components/AlertRow';
import EmptyState from '../components/EmptyState';

const CHART_COLORS = {
  recon:   'var(--info)',
  dos:     'var(--danger)',
  exploit: 'var(--warning)',
  malware: 'oklch(67% 0.18 305)',
};

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  boxShadow: 'var(--shadow-elevated)',
};

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, activeThreats: 0, blockedCount: 0, explanationCount: 0 });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchAlerts();
    fetchStats();

    const ch = supabase
      .channel('live-alerts')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
        setAlerts(prev => [payload.new, ...prev].slice(0, 10));
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          activeThreats: ['critical', 'high'].includes(payload.new.severity)
            ? prev.activeThreats + 1
            : prev.activeThreats,
        }));
      })
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts').select('*')
      .order('timestamp', { ascending: false }).limit(10);
    if (data) setAlerts(data);
  };

  const fetchStats = async () => {
    const { data: alertsData } = await supabase.from('alerts').select('severity');
    const { count: blockedCount } = await supabase
      .from('blocked_ips').select('*', { count: 'exact', head: true });
    const { count: explanationCount } = await supabase
      .from('alerts').select('*', { count: 'exact', head: true })
      .eq('explanation_status', 'generated');

    if (alertsData) {
      setStats({
        total: alertsData.length,
        blockedCount: blockedCount || 0,
        explanationCount: explanationCount || 0,
        activeThreats: alertsData.filter(a => ['critical', 'high'].includes(a.severity)).length,
      });
    }
  };

  const barData = [
    { name: 'Recon',   value: alerts.filter(a => a.attack_type === 'RECONNAISSANCE').length, color: CHART_COLORS.recon },
    { name: 'DoS',     value: alerts.filter(a => a.attack_type === 'DOS').length,             color: CHART_COLORS.dos },
    { name: 'Exploit', value: alerts.filter(a => a.attack_type === 'EXPLOIT').length,         color: CHART_COLORS.exploit },
    { name: 'Malware', value: alerts.filter(a => a.attack_type === 'MALWARE').length,         color: CHART_COLORS.malware },
  ];

  const pieData = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: CHART_COLORS.dos },
    { name: 'High',     value: alerts.filter(a => a.severity === 'high').length,     color: CHART_COLORS.exploit },
    { name: 'Medium',   value: alerts.filter(a => a.severity === 'medium').length,   color: CHART_COLORS.recon },
    { name: 'Low',      value: alerts.filter(a => a.severity === 'low').length,      color: 'var(--text-3)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade pb-12">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
          Security overview
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-2)' }}>
          Live detection data from your network sensor.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Events detected" value={stats.total}           icon={Shield}   />
        <StatCard label="High severity"   value={stats.activeThreats}   icon={Activity} trend={stats.activeThreats > 0 ? `+${stats.activeThreats}` : undefined} />
        <StatCard label="IPs blocked"     value={stats.blockedCount}     icon={Ban}      />
        <StatCard label="AI analyses"     value={stats.explanationCount} icon={Zap}      />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card
          title="Attack type distribution"
          subtitle="Last 10 events"
          icon={TrendingUp}
          className="lg:col-span-8"
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-3)"
                  fontSize={11}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="var(--text-3)"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--bg-elevated)' }}
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: 'var(--text-1)', fontWeight: 600, marginBottom: 4, fontSize: 12 }}
                  itemStyle={{ color: 'var(--text-2)', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={36}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Severity breakdown"
          subtitle="Current window"
          icon={PieIcon}
          className="lg:col-span-4"
        >
          <div className="h-64 w-full flex flex-col items-center justify-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={6}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={{ color: 'var(--text-2)', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No data yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Live table */}
      <Card
        title="Recent alerts"
        subtitle="Live from your sensor"
        icon={Globe}
        action={
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: 'var(--success-dim)', color: 'var(--success)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse-soft" style={{ background: 'var(--success)' }} />
            Live
          </div>
        }
      >
        <div className="overflow-x-auto min-h-[320px] pt-2">
          <table className="soc-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Time</th>
                <th style={{ width: 130 }}>Type</th>
                <th>Signature</th>
                <th style={{ width: 150 }}>Source</th>
                <th style={{ width: 120 }}>Country</th>
                <th style={{ width: 48 }} />
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
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
              title="All clear"
              message="No alerts detected. Your network sensor is active and watching."
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
