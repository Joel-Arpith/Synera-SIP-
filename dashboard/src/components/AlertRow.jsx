import React from 'react';
import { ChevronDown, Globe, Cpu, Zap, Activity, Target } from 'lucide-react';
import Badge from './Badge';
import { format } from 'date-fns';

const AlertRow = ({ alert, isExpanded, onToggle }) => {
  const renderExplanation = (explanationJson) => {
    let parsed;
    try { 
        parsed = typeof explanationJson === 'string' ? JSON.parse(explanationJson) : explanationJson; 
    } catch { 
        return <div className="text-[#ff3b30] text-xs font-medium italic">AI Metadata Unreadable</div>; 
    }
    
    const threatLevel = parsed.threat_level || parsed.situation?.split(' ')[0] || 'Unknown';
    const threatMapping = {
       'Low': 'low', 'Moderate': 'medium', 'High': 'high', 'Critical': 'critical'
    };
    const badgeType = threatMapping[threatLevel] || 'info';

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
           <Badge type={badgeType}>{threatLevel} Risk Severity</Badge>
           <div className="flex items-center gap-2 text-[11px] text-[#86868b] font-semibold">
              <Zap size={11} className="text-black" />
              ANALYSED BY CLAUDE 3.5
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Situation', value: parsed.situation || parsed.what_happened, icon: '🔍' },
             { label: 'Exposure', value: parsed.exposure || parsed.why_it_matters, icon: '⚠️' },
             { label: 'Correction', value: parsed.guidance || parsed.action, icon: '✅' }
           ].map(({ label, value, icon }) => (
             <div key={label} className="bg-[#f5f5f7]/50 p-5 rounded-2xl border border-[#d2d2d7]/20 space-y-3">
               <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wide flex items-center gap-2">
                 <span>{icon}</span> {label}
               </p>
               <p className="text-[14px] text-black leading-relaxed font-medium">{value}</p>
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
        className={`group cursor-pointer transition-all duration-300 ${isExpanded ? 'bg-[#f5f5f7]' : 'hover:bg-[#fbfbfd]'}`}
      >
        <td className="font-mono text-[12px] text-[#86868b] font-medium">
          {format(new Date(alert.timestamp), 'HH:mm:ss')}
        </td>
        <td>
           <Badge type={alert.severity}>{alert.attack_type}</Badge>
        </td>
        <td className="max-w-[400px] truncate font-semibold text-black text-[14px]">
           {alert.signature}
        </td>
        <td className="font-mono text-black font-semibold text-[13px]">
           <span className="bg-[#f5f5f7] px-2 py-0.5 rounded-md border border-[#d2d2d7]/10">{alert.src_ip}</span>
        </td>
        <td>
           <div className="flex items-center gap-2 text-[#86868b] font-medium text-[13px]">
              <Globe size={14} className="opacity-80" />
              <span>{alert.country || 'Global'}</span>
           </div>
        </td>
        <td className="text-right pr-6">
          <div className={`inline-flex p-1.5 rounded-full transition-all ${isExpanded ? 'bg-black text-white rotate-180' : 'text-[#afafb6] group-hover:text-black hover:bg-[#f5f5f7]'}`}>
            <ChevronDown size={18} />
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-[#f5f5f7]/30 border-b border-[#d2d2d7]/20">
           <td colSpan={6} className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade">
                 {/* Technical Breakdown */}
                 <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-2">
                       <Target size={15} className="text-black" />
                       <span className="text-[12px] font-bold text-black tracking-wide uppercase">Technical Vector</span>
                    </div>
                    <div className="bg-white border border-[#d2d2d7]/40 rounded-2xl p-6 font-mono text-[12px] text-[#86868b] space-y-4 shadow-sm">
                       <div className="flex justify-between border-b border-[#f5f5f7] pb-3">
                          <span className="font-semibold">Endpoint:</span>
                          <span className="text-black font-bold">{alert.dest_ip}:{alert.dest_port}</span>
                       </div>
                       <div className="flex justify-between border-b border-[#f5f5f7] pb-3">
                          <span className="font-semibold">Transport:</span>
                          <span className="text-black font-bold">{alert.proto}</span>
                       </div>
                       <div className="flex justify-between border-b border-[#f5f5f7] pb-3">
                          <span className="font-semibold">Domain:</span>
                          <span className="text-black font-bold truncate max-w-[150px]">{alert.category}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="font-semibold">Frequency:</span>
                          <span className={alert.grouped ? 'text-[#34c759] font-bold' : 'text-[#86868b]'}>
                             {alert.grouped ? `Burst (${alert.count} instances)` : 'Individual'}
                          </span>
                       </div>
                    </div>
                 </div>

                 {/* AI Contextualisation */}
                 <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-2">
                       <Activity size={15} className="text-black" />
                       <span className="text-[12px] font-bold text-black tracking-wide uppercase">Intelligence Narrative</span>
                    </div>
                    <div className="bg-white border border-[#d2d2d7]/40 rounded-2xl p-8 min-h-[200px] flex flex-col justify-center shadow-sm">
                       {alert.explanation_status === 'pending' ? (
                          <div className="flex flex-col items-center gap-4 text-center">
                             <div className="h-6 w-6 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                             <p className="text-[13px] text-[#86868b] font-medium">Decrypting pattern metadata & contextualising exposure...</p>
                          </div>
                       ) : alert.explanation_status === 'generated' ? (
                          renderExplanation(alert.explanation)
                       ) : (
                          <div className="text-center py-4">
                            <p className="text-[13px] text-[#86868b] font-medium leading-relaxed italic opacity-60">High-fidelity intelligence is prioritised for elevated risk incursions. This event is currently mapped to standard signature telemetry.</p>
                          </div>
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
