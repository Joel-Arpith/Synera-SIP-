import React from 'react';

const Card = ({ title, subtitle, icon: Icon, action, children, className = '' }) => (
  <div
    className={`flex flex-col gap-5 p-6 rounded-[var(--radius-lg)] ${className}`}
    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="p-2 rounded-[var(--radius-md)]"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)' }}
          >
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

export default Card;
