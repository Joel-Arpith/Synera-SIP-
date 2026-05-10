import React from 'react';

const STYLES = {
  critical: { background: 'var(--danger-dim)',  color: 'var(--danger)'  },
  high:     { background: 'var(--warning-dim)', color: 'var(--warning)' },
  medium:   { background: 'oklch(73% 0.16 65 / 0.1)', color: 'oklch(73% 0.16 65)' },
  low:      { background: 'oklch(38% 0.009 258 / 0.3)', color: 'var(--text-2)' },
  info:     { background: 'var(--info-dim)',    color: 'var(--info)'    },
  success:  { background: 'var(--success-dim)', color: 'var(--success)' },
};

const Badge = ({ type = 'info', children }) => {
  const style = STYLES[type?.toLowerCase()] ?? STYLES.info;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
      style={style}
    >
      {children}
    </span>
  );
};

export default Badge;
