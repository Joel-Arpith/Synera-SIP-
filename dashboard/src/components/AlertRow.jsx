import React, { useState } from 'react';
import { ChevronDown, Globe, Target, Activity, Ban, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';
import { format } from 'date-fns';
import { supabase } from '../supabase';

const renderExplanation = (raw) => {
  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return <p className="text-[12px] italic" style={{ color: 'var(--danger)' }}>Could not parse AI response.</p>;
  }

  const sections = [
    { label: 'What happened', value: parsed.situation || parsed.what_happened },
    { label: 'Business risk',  value: parsed.exposure  || parsed.why_it_matters },
    { label: 'Next step',      value: parsed.guidance  || parsed.action },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sections.map(({ label, value }) => (
        <div
          key={label}
          className="p-4 rounded-[var(--radius-md)] space-y-2"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
            {label}
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-1)' }}>
            {value ?? 'Unavailable'}
          </p>
        </div>
      ))}
    </div>
  );
};

const BlockButton = ({ ip }) => {
  const [state, setState] = useState('idle'); // idle | confirm | blocking | done | error

  const handleBlock = async () => {
    setState('blocking');
    const { error } = await supabase.from('blocked_ips').upsert({
      ip,
      reason: 'Blocked from alert log',
      timestamp: new Date().toISOString(),
      alert_count: 1,
      unblocked: false,
    });
    setState(error ? 'error' : 'done');
  };

  if (state === 'done') return (
    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--success)' }}>
      <CheckCircle2 size={13} /> Blocked
    </div>
  );

  if (state === 'error') return (
    <span className="text-[11px]" style={{ color: 'var(--danger)' }}>Block failed</span>
  );

  if (state === 'confirm') return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleBlock}
        className="text-[11px] font-semibold px-3 py-1 rounded-[var(--radius-sm)]"
        style={{ background: 'var(--danger)', color: '#fff' }}
      >
        Confirm
      </button>
      <button
        onClick={() => setState('idle')}
        className="text-[11px] px-3 py-1 rounded-[var(--radius-sm)]"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <button
      onClick={() => setState('confirm')}
      className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-[var(--radius-sm)] transition-colors"
      style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-dim)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
    >
      <Ban size={12} /> Block IP
    </button>
  );
};

const AlertRow = ({ alert, isExpanded, onToggle }) => (
  <React.Fragment>
    <tr
      onClick={onToggle}
      className="cursor-pointer transition-colors duration-100"
      style={{ background: isExpanded ? 'var(--bg-elevated)' : undefined }}
      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
    >
      <td className="mono text-[11.5px]" style={{ color: 'var(--text-3)' }}>
        {format(new Date(alert.timestamp), 'HH:mm:ss')}
      </td>
      <td>
        <Badge type={alert.severity}>{alert.attack_type || 'UNKNOWN'}</Badge>
      </td>
      <td
        className="max-w-[360px] truncate text-[13px] font-medium"
        style={{ color: 'var(--text-1)' }}
      >
        {alert.signature}
      </td>
      <td>
        <span
          className="mono text-[11.5px] px-2 py-0.5 rounded-[var(--radius-sm)]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border-subtle)' }}
        >
          {alert.src_ip}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-3)' }}>
          <Globe size={13} />
          {alert.country || 'Unknown'}
        </div>
      </td>
      <td className="text-right pr-4">
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-3)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}
        />
      </td>
    </tr>

    {isExpanded && (
      <tr style={{ background: 'var(--bg-elevated)', borderBottom: `1px solid var(--border)` }}>
        <td colSpan={6} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade">
            {/* Technical details */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-2">
                <Target size={13} style={{ color: 'var(--text-3)' }} />
                <span className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                  Technical details
                </span>
              </div>
              <div
                className="rounded-[var(--radius-md)] p-4 space-y-3 mono text-[12px]"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
              >
                {[
                  ['Destination', `${alert.dest_ip}:${alert.dest_port}`],
                  ['Protocol',    alert.proto],
                  ['Category',    alert.category],
                  ['Occurrences', alert.grouped ? `${alert.count} times` : 'Single'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span style={{ color: 'var(--text-3)' }}>{k}</span>
                    <span className="font-medium truncate" style={{ color: 'var(--text-1)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="pt-1">
                <BlockButton ip={alert.src_ip} />
              </div>
            </div>

            {/* AI explanation */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <Activity size={13} style={{ color: 'var(--text-3)' }} />
                <span className="text-[10.5px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                  AI analysis
                </span>
              </div>

              {alert.explanation_status === 'pending' && (
                <div
                  className="rounded-[var(--radius-md)] p-6 flex items-center gap-3"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                  />
                  <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                    Generating explanation...
                  </p>
                </div>
              )}

              {alert.explanation_status === 'generated' && renderExplanation(alert.explanation)}

              {(alert.explanation_status === 'skipped' || alert.explanation_status === 'failed' || !alert.explanation_status) && (
                <div
                  className="rounded-[var(--radius-md)] p-5"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                >
                  <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                    AI analysis is enabled for high and critical severity events only.
                  </p>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    )}
  </React.Fragment>
);

export default AlertRow;
