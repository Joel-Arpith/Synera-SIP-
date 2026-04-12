import React from 'react';

const EmptyState = ({ icon: Icon, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-fade">
      <div className="p-5 rounded-2xl bg-[#111118] border border-[#2a2a3a] mb-6 text-[#1e1e2e]">
        <Icon size={48} />
      </div>
      <h3 className="text-lg font-bold text-[#f8fafc] mb-2">{title}</h3>
      <p className="text-sm text-[#94a3b8] max-w-[300px] leading-relaxed">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
