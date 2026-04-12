import React, { useState, useEffect } from 'react';

const StatCard = ({ value, label, icon: Icon, trend, color = "#000000" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) {
        setDisplayValue(value);
        return;
    }
    if (start === end) return;

    let totalDuration = 1000;
    let increment = end / (totalDuration / 16);
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="apple-card p-6 flex items-center justify-between transition-all duration-300">
      <div className="space-y-1">
        <p className="text-[12px] font-bold text-[#86868b] uppercase tracking-wide">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-[28px] font-bold text-black tracking-tight">{displayValue.toLocaleString()}</h3>
          {trend && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
      <div 
        className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-[#d2d2d7]/20 flex items-center justify-center text-black"
      >
        <Icon size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default StatCard;
