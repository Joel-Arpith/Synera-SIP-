import React from 'react';

const Card = ({ title, subtitle, icon: Icon, action, children, className = "" }) => {
  return (
    <div className={`apple-card p-8 flex flex-col gap-6 group ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-[#f5f5f7] border border-[#d2d2d7]/20 text-black">
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}
          <div>
            <h3 className="text-[17px] font-bold text-black tracking-tight">{title}</h3>
            {subtitle && <p className="text-[13px] text-[#86868b] font-medium">{subtitle}</p>}
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
