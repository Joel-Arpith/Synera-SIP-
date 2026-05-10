import React from 'react';

const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-fade">
    <div
      className="p-4 rounded-[var(--radius-lg)] mb-5"
      style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)' }}
    >
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-[14px] font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
      {title}
    </h3>
    <p className="text-[13px] leading-relaxed max-w-[280px]" style={{ color: 'var(--text-3)' }}>
      {message}
    </p>
  </div>
);

export default EmptyState;
