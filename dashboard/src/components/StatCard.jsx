import React, { useState, useEffect } from 'react';

const StatCard = ({ value, label, icon: Icon, trend }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = parseInt(value);
    if (isNaN(end)) { setDisplay(value); return; }
    if (end === 0) { setDisplay(0); return; }

    let current = 0;
    const step = end / (800 / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="flex items-start justify-between p-5 rounded-[var(--radius-lg)]"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="space-y-3">
        <p
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-3)' }}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className="text-[28px] font-bold leading-none tracking-tight"
            style={{ color: 'var(--text-1)' }}
          >
            {typeof display === 'number' ? display.toLocaleString() : display}
          </span>
          {trend && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: trend.startsWith('+') ? 'var(--success-dim)' : 'var(--danger-dim)',
                color:      trend.startsWith('+') ? 'var(--success)'     : 'var(--danger)',
              }}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      <div
        className="p-2.5 rounded-[var(--radius-md)] mt-0.5"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)' }}
      >
        <Icon size={18} strokeWidth={1.75} />
      </div>
    </div>
  );
};

export default StatCard;
