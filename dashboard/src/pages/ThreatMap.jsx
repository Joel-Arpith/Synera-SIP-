import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabase';
import { Globe, MapPin, AlertTriangle, Crosshair, Zap } from 'lucide-react';
import Badge from '../components/Badge';

const ThreatMap = () => {
  const [markers, setMarkers] = useState([]);
  const [countryStats, setCountryStats] = useState([]);

  useEffect(() => {
    fetchMarkers();

    const channel = supabase
      .channel('map-threats-v2')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
        if (payload.new.lat && payload.new.lng) {
            const newMarker = {
              id: payload.new.id,
              position: [payload.new.lat, payload.new.lng],
              name: payload.new.src_ip,
              severity: payload.new.severity,
              country: payload.new.country,
              attackType: payload.new.attack_type,
              timestamp: payload.new.timestamp
            };
            setMarkers(prev => [newMarker, ...prev].slice(0, 100));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMarkers = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('id, lat, lng, src_ip, severity, country, attack_type, timestamp')
      .not('lat', 'eq', 0)
      .order('timestamp', { ascending: false })
      .limit(200);
    
    if (data) {
        const formatted = data.map(a => ({
            id: a.id,
            position: [a.lat, a.lng],
            name: a.src_ip,
            severity: a.severity,
            country: a.country,
            attackType: a.attack_type,
            timestamp: a.timestamp
        }));
        setMarkers(formatted);

        // Aggregate stats
        const statsMap = {};
        data.forEach(a => {
            if (a.country) {
                statsMap[a.country] = statsMap[a.country] || { count: 0, latestIp: '' };
                statsMap[a.country].count++;
                statsMap[a.country].latestIp = a.src_ip;
            }
        });
        setCountryStats(Object.entries(statsMap).sort((a,b) => b[1].count - a[1].count).slice(0, 12));
    }
  };

  const getMarkerRadius = (severity) => {
    switch (severity) {
      case 'critical': return 12;
      case 'high': return 9;
      case 'medium': return 7;
      default: return 5;
    }
  };

  const getMarkerColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Globe className="h-6 w-6 text-[#6366f1]" />
            Global Threat Intel
          </h1>
          <p className="text-[#94a3b8] text-sm">Visualizing real-time geographic attack distribution</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#111118] border border-[#2a2a3a] px-4 py-2 rounded-xl">
           <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ef4444] animate-pulse" />
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Active Incursions</span>
           </div>
           <div className="h-4 w-[1px] bg-[#2a2a3a]" />
           <span className="text-lg font-bold font-mono text-[#f8fafc]">{markers.length}</span>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3 glass-card relative overflow-hidden p-0 border-[#2a2a3a]">
          <MapContainer 
            center={[20, 0]} 
            zoom={2.5} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#0a0a0f' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {markers.map((marker) => (
              <CircleMarker 
                key={marker.id} 
                center={marker.position} 
                radius={getMarkerRadius(marker.severity)}
                fillColor={getMarkerColor(marker.severity)}
                color={getMarkerColor(marker.severity)}
                weight={1}
                opacity={0.8}
                fillOpacity={0.4}
                className={marker.severity === 'critical' ? 'animate-pulse' : ''}
              >
                <Popup className="custom-popup">
                   <div className="bg-[#111118] border border-[#2a2a3a] p-4 rounded-xl min-w-[200px] shadow-2xl">
                      <div className="flex items-center justify-between mb-3 border-b border-[#2a2a3a] pb-2">
                         <span className="text-[10px] font-bold text-[#475569] uppercase font-mono tracking-widest">Incursion Unit</span>
                         <Badge type={marker.severity}>{marker.severity}</Badge>
                      </div>
                      <div className="space-y-4">
                         <div>
                            <p className="text-sm font-bold text-[#6366f1] font-mono">{marker.name}</p>
                            <p className="text-xs text-[#94a3b8]">{marker.country || 'Unknown Region'}</p>
                         </div>
                         <div className="bg-[#0a0a0f] p-2 rounded-lg border border-[#2a2a3a]">
                            <p className="text-[10px] text-[#475569] font-mono leading-tight">{marker.attackType}</p>
                         </div>
                      </div>
                   </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          
          {/* Overlay Map Legend */}
          <div className="absolute bottom-6 left-6 p-4 glass-card bg-[#0a0a0f]/80 backdrop-blur-md z-[10] border-[#2a2a3a]">
             <div className="space-y-3">
                {[
                  { label: 'Critical Threat', color: '#ef4444' },
                  { label: 'High Risk', color: '#f97316' },
                  { label: 'Moderate', color: '#f59e0b' },
                  { label: 'Scanning', color: '#94a3b8' }
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-3">
                     <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                     <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">{l.label}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Origins Panel */}
        <div className="glass-card flex flex-col bg-[#111118] border-[#2a2a3a]">
           <div className="p-5 border-b border-[#2a2a3a] flex items-center gap-3">
              <Crosshair size={18} className="text-[#6366f1]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#94a3b8]">Active Origins</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {countryStats.map(([country, data]) => (
                 <div key={country} className="space-y-3 p-4 bg-[#0a0a0f] rounded-xl border border-[#2a2a3a] hover:border-[#475569] transition-all">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#6366f110] flex items-center justify-center text-xs font-bold text-[#6366f1]">
                             {country.substring(0,2)}
                          </div>
                          <p className="text-sm font-bold text-[#f8fafc]">{country}</p>
                       </div>
                       <span className="font-mono text-[11px] font-bold text-[#6366f1] py-1 px-2 bg-[#6366f115] rounded border border-[#6366f120]">
                          {data.count}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                       <Zap size={10} className="text-[#475569]" />
                       <span className="text-[10px] text-[#475569] font-mono truncate">Latest: {data.latestIp}</span>
                    </div>
                 </div>
              ))}
              {countryStats.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <AlertTriangle size={32} className="text-[#1e1e2e]" />
                    <p className="text-xs text-[#475569] font-medium italic">Scanning global telemetry...</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Ticker Tape Style Footer */}
      <div className="h-12 glass-card flex items-center px-6 overflow-hidden bg-[#111118] border-[#2a2a3a]">
         <div className="flex items-center gap-4 whitespace-nowrap animate-marquee">
            <span className="text-[10px] font-bold text-[#6366f1] uppercase tracking-[0.2em]">Latest Geo Events:</span>
            {markers.slice(0, 8).map(m => (
               <div key={m.id} className="flex items-center gap-2">
                  <MapPin size={10} className="text-[#475569]" />
                  <span className="text-[10px] text-[#94a3b8]">{m.name} ({m.country})</span>
                  <span className="text-[#1e1e2e]">|</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ThreatMap;
