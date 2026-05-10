import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Ban, Globe, ShieldAlert, Search, CheckCircle2, Plus, X } from 'lucide-react';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { format } from 'date-fns';

const BlockedIPs = () => {
  const [blocked, setBlocked]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [confirm, setConfirm]       = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [newIP, setNewIP]           = useState('');
  const [newReason, setNewReason]   = useState('');
  const [blocking, setBlocking]     = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => { fetchBlocked(); }, [search]);

  const fetchBlocked = async () => {
    let q = supabase.from('blocked_ips').select('*').order('timestamp', { ascending: false });
    if (search) q = q.ilike('ip', `%${search}%`);
    const { data } = await q;
    if (data) setBlocked(data);
    setLoading(false);
  };

  const handleBlock = async () => {
    setError('');
    const ip = newIP.trim();
    if (!ip) { setError('Enter an IP address'); return; }
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) { setError('Invalid IP format'); return; }

    setBlocking(true);
    const { error: err } = await supabase.from('blocked_ips').upsert({
      ip,
      reason: newReason.trim() || 'Manual block',
      timestamp: new Date().toISOString(),
      alert_count: 1,
      unblocked: false,
    });

    setBlocking(false);
    if (err) { setError(err.message); return; }
    setNewIP('');
    setNewReason('');
    setShowForm(false);
    fetchBlocked();
  };

  const handleUnblock = async (ip) => {
    await supabase.from('blocked_ips').update({ unblocked: true }).eq('ip', ip);
    setBlocked(prev => prev.filter(b => b.ip !== ip));
    setConfirm(null);
  };

  const filtered = blocked.filter(b => !b.unblocked);

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Blocked IPs
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-2)' }}>
            IPs currently blocked by iptables on your sensor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search IPs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 text-[13px] rounded-[var(--radius-md)] outline-none w-56"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
              }}
            />
          </div>

          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] text-[13px] font-semibold transition-colors"
            style={{ background: 'var(--danger)', color: '#fff' }}
          >
            <Plus size={14} />
            Block IP
          </button>
        </div>
      </div>

      {/* Manual block form */}
      {showForm && (
        <div
          className="p-5 rounded-[var(--radius-lg)] space-y-4 animate-fade"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-1)' }}>Block an IP address</h3>
            <button onClick={() => { setShowForm(false); setError(''); }} style={{ color: 'var(--text-3)' }}>
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="IP address  e.g. 1.2.3.4"
              value={newIP}
              onChange={e => setNewIP(e.target.value)}
              className="flex-1 h-9 px-3 text-[13px] rounded-[var(--radius-md)] outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
              className="flex-1 h-9 px-3 text-[13px] rounded-[var(--radius-md)] outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
            <button
              onClick={handleBlock}
              disabled={blocking}
              className="h-9 px-5 text-[13px] font-semibold rounded-[var(--radius-md)] transition-opacity disabled:opacity-50"
              style={{ background: 'var(--danger)', color: '#fff' }}
            >
              {blocking ? 'Blocking...' : 'Block'}
            </button>
          </div>

          {error && (
            <p className="text-[12px]" style={{ color: 'var(--danger)' }}>{error}</p>
          )}
          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
            The Pi will receive the block command via Supabase Realtime and run iptables automatically.
          </p>
        </div>
      )}

      {/* Table */}
      <Card title="Active blocks" icon={ShieldAlert}>
        <div className="overflow-x-auto min-h-[320px] pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3" style={{ color: 'var(--text-3)' }}>
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--danger)' }} />
              <span className="text-[12px]">Loading...</span>
            </div>
          ) : (
            <table className="soc-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Country</th>
                  <th>Reason</th>
                  <th>Blocked at</th>
                  <th>Alerts</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.ip}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td>
                      <span className="mono text-[12px] font-medium" style={{ color: 'var(--danger)' }}>
                        {b.ip}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-2)' }}>
                        <Globe size={13} />
                        {b.country || 'Unknown'}
                      </div>
                    </td>
                    <td className="max-w-[220px] truncate text-[12px]" style={{ color: 'var(--text-3)' }}>
                      {b.reason || 'Threshold exceeded'}
                    </td>
                    <td className="mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                      {b.timestamp ? format(new Date(b.timestamp), 'yyyy-MM-dd HH:mm') : '—'}
                    </td>
                    <td>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}
                      >
                        {b.alert_count || 1}x
                      </span>
                    </td>
                    <td className="text-right pr-2">
                      {confirm === b.ip ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUnblock(b.ip)}
                            className="text-[11px] font-semibold px-3 py-1 rounded-[var(--radius-sm)] transition-colors"
                            style={{ background: 'var(--danger)', color: '#fff' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirm(null)}
                            className="text-[11px] font-semibold px-3 py-1 rounded-[var(--radius-sm)]"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirm(b.ip)}
                          className="text-[12px] font-medium px-3 py-1 rounded-[var(--radius-sm)] transition-colors"
                          style={{ color: 'var(--text-3)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--success)'; e.currentTarget.style.background = 'var(--success-dim)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="No active blocks"
              message="No IPs are currently blocked. Use the button above to block one manually."
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default BlockedIPs;
