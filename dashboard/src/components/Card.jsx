import React from 'react';

const Card = ({ title, subtitle, icon: Icon, action, children, className = "" }) => {
  return (
    <div className={`glass-card p-6 flex flex-col gap-4 group transition-all duration-150 ease-out border-[#2a2a3a] hover:border-[#3a3a4a] ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-[#6366f110] text-[#6366f1]">
              <Icon size={20} />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-[#f8fafc]">{title}</h3>
            {subtitle && <p className="text-xs text-[#94a3b8]">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default Card;
