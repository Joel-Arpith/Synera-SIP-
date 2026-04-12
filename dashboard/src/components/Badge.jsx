import React from 'react';

const Badge = ({ type = 'info', children }) => {
  const styles = {
    critical: "bg-[#ef444415] text-[#ef4444] border-[#ef444430]",
    high: "bg-[#f9731615] text-[#f97316] border-[#f9731630]",
    medium: "bg-[#f59e0b15] text-[#f59e0b] border-[#f59e0b30]",
    low: "bg-[#94a3b815] text-[#94a3b8] border-[#94a3b830]",
    info: "bg-[#6366f115] text-[#6366f1] border-[#6366f130]",
    success: "bg-[#10b98115] text-[#10b981] border-[#10b98130]"
  };

  const currentStyle = styles[type.toLowerCase()] || styles.info;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-bold font-mono uppercase tracking-wider ${currentStyle}`}>
      {children}
    </span>
  );
};

export default Badge;
