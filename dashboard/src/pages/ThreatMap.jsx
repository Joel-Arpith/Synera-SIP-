import React, { useState, useEffect } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker 
} from 'react-simple-maps';
import { supabase } from '../supabase';
import { Globe, MapPin, AlertTriangle } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ThreatMap = () => {
  const [markers, setMarkers] = useState([]);
  const [countryStats, setCountryStats] = useState({});

  useEffect(() => {
    fetchMarkers();

    const channel = supabase
      .channel('map-threats')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
        const newMarker = {
          id: payload.new.id,
          coordinates: [payload.new.lng, payload.new.lat],
          name: payload.new.src_ip,
          severity: payload.new.severity,
          country: payload.new.country,
          attackType: payload.new.attack_type
        };
        
        if (newMarker.coordinates[0] !== 0) {
            setMarkers(prev => [newMarker, ...prev].slice(0, 50));
            updateCountryStats(newMarker.country);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMarkers = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('id, lat, lng, src_ip, severity, country, attack_type')
      .neq('lat', 0)
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (data) {
        const formatted = data.map(a => ({
            id: a.id,
            coordinates: [a.lng, a.lat],
            name: a.src_ip,
            severity: a.severity,
            country: a.country,
            attackType: a.attack_type
        }));
        setMarkers(formatted);

        // Aggregate stats
        const stats = {};
        data.forEach(a => {
            if (a.country) stats[a.country] = (stats[a.country] || 0) + 1;
        });
        setCountryStats(stats);
    }
  };

  const updateCountryStats = (country) => {
    if (country) {
        setCountryStats(prev => ({
            ...prev,
            [country]: (prev[country] || 0) + 1
        }));
    }
  };

  const getColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#facc15';
      default: return '#06b6d4';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Globe className="h-6 w-6 text-cyan-primary" />
            Global Threat Map
          </h1>
          <p className="text-gray-400 text-sm">Real-time geographic distribution of detected attacks</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                <span className="text-gray-400">Critical</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                <span className="text-gray-400">High Risk</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-cyan-primary animate-pulse" />
                <span className="text-gray-400">Probing</span>
            </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Map Container */}
        <div className="lg:col-span-3 glass-card relative overflow-hidden flex items-center justify-center p-4">
          <ComposableMap
            projectionConfig={{ scale: 160 }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1f2937"
                    stroke="#111827"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#374151", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {markers.map(({ id, coordinates, severity, name }) => (
              <Marker key={id} coordinates={coordinates}>
                <circle r={2} fill={getColor(severity)} />
                <circle 
                    r={6} 
                    fill={getColor(severity)} 
                    className="pulse-ring" 
                    style={{ fillOpacity: 0.4 }} 
                />
              </Marker>
            ))}
          </ComposableMap>
        </div>

        {/* Sidebar Stats */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-white/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Top Origins</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(countryStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-border/50 flex items-center justify-center text-xs font-bold">
                        {country}
                    </div>
                    <span className="text-sm font-medium">{country}</span>
                  </div>
                  <span className="font-mono text-cyan-primary text-sm font-bold bg-cyan-primary/10 px-2 py-1 rounded">
                    {count}
                  </span>
                </div>
              ))}
            {Object.keys(countryStats).length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 italic py-10">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-xs">No geodata available</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Points Table */}
      <div className="glass-card">
         <div className="p-4 border-b border-border text-xs font-bold uppercase tracking-widest text-gray-500">
            Recent Geographic Events
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 p-4 gap-4">
            {markers.slice(0, 5).map((marker) => (
                <div key={marker.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-border">
                    <MapPin className="h-4 w-4 text-cyan-primary" />
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{marker.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{marker.country} • {marker.attackType}</p>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ThreatMap;
