import React from 'react';
import { ChevronDown, Globe, Cpu, Zap, Activity } from 'lucide-react';
import Badge from './Badge';
import { format } from 'date-fns';

const AlertRow = ({ alert, isExpanded, onToggle }) => {
  const renderExplanation = (explanationJson) => {
    let parsed;
    try { 
        parsed = typeof explanationJson === 'string' ? JSON.parse(explanationJson) : explanationJson; 
    } catch { 
        return <div className="text-[#ef4444] text-xs font-mono italic">AI Metadata Corrupted</div>; 
    }
    
    const threatLevel = parsed.threat_level || parsed.situation?.split(' ')[0] || 'Unknown';
    const threatMapping = {
       'Low': 'low', 'Moderate': 'medium', 'High': 'high', 'Critical': 'critical'
    };
    const badgeType = threatMapping[threatLevel] || 'info';

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <Badge type={badgeType}>{threatLevel} Threat Detected</Badge>
           <div className="flex items-center gap-2 text-[10px] text-[#475569] font-mono">
              <Zap size={10} className="text-[#6366f1]" />
              PROCESSED BY CLAUDE 3.5 HAIKU
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: '🔍 Situation', value: parsed.situation || parsed.what_happened },
             { label: '⚠️ Exposure', value: parsed.exposure || parsed.why_it_matters },
             { label: '✅ Action', value: parsed.guidance || parsed.action }
           ].map(({ label, value }) => (
             <div key={label} className="space-y-2">
               <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">{label}</p>
               <p className="text-sm text-[#f8fafc] leading-relaxed">{value}</p>
             </div>
           ))}
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      <tr 
        onClick={onToggle}
        className={`group transition-smooth ${isExpanded ? 'bg-[#1a1a24] border-l-2 border-[#6366f1]' : ''}`}
      >
        <td className="font-mono text-[11px] text-[#94a3b8]">
          {format(new Date(alert.timestamp), 'HH:mm:ss')}
        </td>
        <td>
           <Badge type={alert.severity}>{alert.attack_type}</Badge>
        </td>
        <td className="max-w-[400px] truncate font-medium text-[#f8fafc]">
           {alert.signature}
        </td>
        <td className="font-mono text-[#6366f1]">
           {alert.src_ip}
        </td>
        <td>
           <div className="flex items-center gap-2 text-[#94a3b8]">
              <Globe size={14} className="opacity-50" />
              <span>{alert.country || 'N/A'}</span>
           </div>
        </td>
        <td className="text-right">
          <button className={`p-1 rounded transition-all ${isExpanded ? 'rotate-180 text-[#6366f1]' : 'text-[#475569] group-hover:text-[#94a3b8]'}`}>
            <ChevronDown size={18} />
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-[#0a0a0f] border-b border-[#2a2a3a] shadow-inner">
           <td colSpan={6} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade">
                 {/* Raw Metadata */}
                 <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-2">
                       <Cpu size={14} className="text-[#06b6d4]" />
                       <span className="text-[10px] font-bold text-[#06b6d4] tracking-[0.2em] uppercase">Telemetry Snapshot</span>
                    </div>
                    <div className="bg-[#111118] border border-[#2a2a3a] rounded-lg p-5 font-mono text-[11px] text-[#94a3b8] space-y-3">
                       <div className="flex justify-between border-b border-[#1e1e2e] pb-2">
                          <span>Target:</span>
                          <span className="text-[#f8fafc]">{alert.dest_ip}:{alert.dest_port}</span>
                       </div>
                       <div className="flex justify-between border-b border-[#1e1e2e] pb-2">
                          <span>Protocol:</span>
                          <span className="text-[#f8fafc]">{alert.proto}</span>
                       </div>
                       <div className="flex justify-between border-b border-[#1e1e2e] pb-2">
                          <span>Category:</span>
                          <span className="text-[#f8fafc] truncate max-w-[150px]">{alert.category}</span>
                       </div>
                       <div className="flex justify-between">
                          <span>Deduplicated:</span>
                          <span className={alert.grouped ? 'text-[#10b981]' : 'text-gray-600'}>
                             {alert.grouped ? `ACTIVE (${alert.count}x)` : 'OFF'}
                          </span>
                       </div>
                    </div>
                 </div>

                 {/* AI Intelligence */}
                 <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-2">
                       <Activity size={14} className="text-[#6366f1]" />
                       <span className="text-[10px] font-bold text-[#6366f1] tracking-[0.2em] uppercase">AI Threat Intel</span>
                    </div>
                    <div className="bg-[#111118] border border-[#6366f120] rounded-xl p-6 min-h-[160px] flex flex-col justify-center">
                       {alert.explanation_status === 'pending' ? (
                          <div className="flex flex-col items-center gap-3">
                             <div className="h-4 w-4 border-2 border-[#6366f130] border-t-[#6366f1] rounded-full animate-spin" />
                             <p className="text-xs text-[#475569] italic">Contextualizing telemetry patterns...</p>
                          </div>
                       ) : alert.explanation_status === 'generated' ? (
                          renderExplanation(alert.explanation)
                       ) : (
                          <p className="text-xs text-[#475569] text-center italic">Advanced threat insights unavailable for this severity level</p>
                       )}
                    </div>
                 </div>
              </div>
           </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default AlertRow;
