import React from 'react';

const Badge = ({ type = 'info', children }) => {
  const styles = {
    critical: "bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20",
    high: "bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20",
    medium: "bg-[#ffcc00]/10 text-[#af9700] border-[#ffcc00]/30",
    low: "bg-[#8e8e93]/10 text-[#8e8e93] border-[#8e8e93]/20",
    info: "bg-[#007aff]/10 text-[#007aff] border-[#007aff]/20",
    success: "bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20"
  };

  const currentStyle = styles[type.toLowerCase()] || styles.info;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-tight ${currentStyle}`}>
      {children}
    </span>
  );
};

export default Badge;
