import React, { useState, useEffect } from 'react';

const StatCard = ({ value, label, icon: Icon, trend, color = "#6366f1" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) {
        setDisplayValue(value);
        return;
    }
    if (start === end) return;

    let totalDuration = 800;
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
    <div className="glass-card p-6 flex items-center justify-between group transition-all duration-150">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-[32px] font-bold font-mono text-[#f8fafc]">{displayValue}</h3>
          {trend && (
            <span className={`text-[11px] font-bold ${trend.startsWith('+') ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
      <div 
        className="p-4 rounded-[10px] transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
