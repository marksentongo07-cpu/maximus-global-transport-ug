import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap, 
  CircleMarker, 
  Tooltip as LeafletTooltip 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Truck, 
  Navigation, 
  Phone, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Compass, 
  LocateFixed, 
  Layers, 
  Eye, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Maximize2,
  RefreshCw,
  Zap,
  MapPin,
  Globe
} from 'lucide-react';
import { formatMoney } from '../../services/currency';
import { Language } from '../../types';

// Uganda Northern Corridor Coordinates: Mombasa -> Malaba -> Namanve -> Gulu
export const UGANDA_CORRIDOR_COORDS: [number, number][] = [
  [-4.0435, 39.6682], // Mombasa Port
  [-3.3965, 38.5562], // Voi
  [-2.2785, 37.8341], // Mtito Andei
  [-1.2921, 36.8219], // Nairobi
  [-0.3031, 36.0800], // Nakuru
  [0.5143, 35.2698],  // Eldoret
  [0.6339, 34.2753],  // Malaba Border
  [0.6928, 34.1810],  // Tororo
  [0.6120, 33.4686],  // Iganga
  [0.4479, 33.2026],  // Jinja Highway
  [0.3780, 32.9360],  // Lugazi
  [0.3544, 32.7523],  // Mukono
  [0.3570, 32.6950],  // Namanve ICD
  [0.3476, 32.5825],  // Kampala Core
  [0.5820, 32.5440],  // Bombo
  [0.8490, 32.4980],  // Luweero
  [1.3090, 32.4560],  // Nakasongola
  [1.6370, 32.2850],  // Kafu Bridge
  [2.2420, 32.2470],  // Karuma Bridge
  [2.2530, 32.3380],  // Kamdini
  [2.7747, 32.2990],  // Gulu Core
];

export const CORRIDOR_WAYPOINTS = [
  { name: 'Mombasa Port', coords: [-4.0435, 39.6682] as [number, number], role: 'Sea Hub' },
  { name: 'Malaba Border', coords: [0.6339, 34.2753] as [number, number], role: 'Cross Border' },
  { name: 'Jinja Bridge', coords: [0.4479, 33.2026] as [number, number], role: 'Corridor Weigh' },
  { name: 'Namanve ICD', coords: [0.3570, 32.6950] as [number, number], role: 'Main Inland Port' },
  { name: 'Kampala Core', coords: [0.3476, 32.5825] as [number, number], role: 'Commercial Hub' },
  { name: 'Karuma Bridge', coords: [2.2420, 32.2470] as [number, number], role: 'Northern Gateway' },
  { name: 'Gulu Core Terminal', coords: [2.7747, 32.2990] as [number, number], role: 'Regional Hub' },
];

export interface LiveTruckData {
  jobId: string;
  transporterId: string;
  driverName: string;
  phone: string;
  numberPlate: string;
  cargo: string;
  destination: string;
  lat: number;
  lng: number;
  speed: number;
  heading?: number;
  status: 'delivering' | 'empty_returning' | 'stopped';
  lastSeenLocationName: string;
  lastUpdate: number;
  lastUpdateRelative: string;
  minutesSinceUpdate: number;
  isOfflineLostNetwork: boolean;
  trail: Array<{ lat: number; lng: number; speed: number; timestamp: number }>;
  etaText?: string;
}

interface LeafletLiveFleetMapProps {
  clientJobId?: string; // If provided, limits view to this single job (Client View)
  onSelectTruck?: (truck: LiveTruckData) => void;
  language?: Language;
  fullScreenMode?: boolean;
}

// Controller to programmatically center/pan the Leaflet map
function MapViewController({ 
  centerCoords, 
  zoomLevel, 
  followTruckCoords 
}: { 
  centerCoords: [number, number]; 
  zoomLevel: number; 
  followTruckCoords?: [number, number] | null; 
}) {
  const map = useMap();

  useEffect(() => {
    if (followTruckCoords) {
      map.panTo(followTruckCoords, { animate: true, duration: 1 });
    }
  }, [followTruckCoords, map]);

  useEffect(() => {
    map.setView(centerCoords, zoomLevel, { animate: true });
  }, [centerCoords, zoomLevel, map]);

  return null;
}

// Factory for customized Truck divIcons
function getTruckDivIcon(
  status: 'delivering' | 'empty_returning' | 'stopped', 
  isFollowed: boolean, 
  speed: number,
  isOffline: boolean,
  vehicleType?: string,
  cargo?: string
) {
  let badgeColor = 'bg-emerald-500 border-emerald-200 text-slate-950 shadow-emerald-500/40';
  let statusText = 'Delivering';

  if (status === 'empty_returning') {
    badgeColor = 'bg-amber-500 border-amber-200 text-slate-950 shadow-amber-500/40';
    statusText = 'Returning';
  } else if (status === 'stopped' || isOffline) {
    badgeColor = 'bg-rose-600 border-rose-200 text-white shadow-rose-600/50 animate-pulse';
    statusText = 'Stopped >30m';
  }

  // User requirement: Icon different: saloon=car icon, container=container icon, wide load=warning triangle icon
  let vehicleEmoji = '🚛';
  const v = (vehicleType || '').toLowerCase();
  const c = (cargo || '').toLowerCase();

  if (v.includes('saloon') || v.includes('sedan') || v.includes('hatchback') || c.includes('parcel') || c.includes('document')) {
    vehicleEmoji = '🚗';
  } else if (v.includes('container') || v.includes('20ft') || v.includes('40ft') || c.includes('container') || c.includes('teu')) {
    vehicleEmoji = '📦';
  } else if (v.includes('wide_load') || v.includes('lowbed') || v.includes('abnormal') || c.includes('wide') || c.includes('abnormal') || c.includes('machinery')) {
    vehicleEmoji = '⚠️';
  } else if (v.includes('pickup')) {
    vehicleEmoji = '🛻';
  } else if (v.includes('boda') || v.includes('motorcycle')) {
    vehicleEmoji = '🛵';
  }

  const pulseEffect = speed > 5
    ? `<div class="absolute -inset-1.5 rounded-full ${status === 'delivering' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75 animate-ping"></div>`
    : '';

  const followRing = isFollowed
    ? `<div class="absolute -inset-3 rounded-full border-2 border-cyan-400 animate-pulse"></div>`
    : '';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer select-none group">
      ${pulseEffect}
      ${followRing}
      <div class="relative w-10 h-10 rounded-2xl ${badgeColor} border-2 shadow-2xl flex items-center justify-center text-lg transform transition-transform group-hover:scale-125">
        <span>${vehicleEmoji}</span>
      </div>
      <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-slate-950/95 border border-white/20 rounded text-[9px] font-bold text-white whitespace-nowrap shadow-lg">
        ${speed > 0 ? `${speed} km/h` : 'Stopped'}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-truck',
    html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

function getWaypointDivIcon(name: string, role: string) {
  const html = `
    <div class="relative flex flex-col items-center cursor-pointer select-none">
      <div class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-950 shadow-md"></div>
      <div class="mt-1 px-1.5 py-0.5 bg-slate-900/90 border border-amber-500/40 rounded text-[9px] font-bold text-amber-300 whitespace-nowrap shadow">
        ${name}
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-leaflet-waypoint',
    html,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export const LeafletLiveFleetMap: React.FC<LeafletLiveFleetMapProps> = ({
  clientJobId,
  onSelectTruck,
  language = 'en',
  fullScreenMode = false,
}) => {
  const [trucks, setTrucks] = useState<LiveTruckData[]>([]);
  const [summary, setSummary] = useState({
    totalFleet: 15,
    moving: 12,
    idle: 3,
    topBarText: 'Live Fleet: 12 moving | 3 idle | Escrow 950k UGX',
  });
  const [selectedTruck, setSelectedTruck] = useState<LiveTruckData | null>(null);
  const [followedJobId, setFollowedJobId] = useState<string | null>(clientJobId || null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivering' | 'empty_returning' | 'stopped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState<'dark' | 'streets'>('dark');
  const [showTrailLines, setShowTrailLines] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0.3476, 32.5825]); // Center Kampala Core
  const [mapZoom, setMapZoom] = useState<number>(8); // Zoom 8
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll real-time GPS locations every 4 seconds from backend
  const fetchFleetLocations = async () => {
    try {
      if (clientJobId) {
        const res = await fetch(`/api/location/${clientJobId}`);
        if (res.ok) {
          const data = await res.json();
          setTrucks([data]);
          if (!selectedTruck) setSelectedTruck(data);
        }
      } else {
        const res = await fetch('/api/fleet-locations');
        if (res.ok) {
          const data = await res.json();
          setTrucks(data.trucks || []);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      }
    } catch (err) {
      console.warn('Fleet location polling warning:', err);
    }
  };

  useEffect(() => {
    fetchFleetLocations();
    const interval = setInterval(fetchFleetLocations, 4000);
    return () => clearInterval(interval);
  }, [clientJobId]);

  // Center on fleet / followed truck
  const handleCenterOnFleet = () => {
    setFollowedJobId(null);
    setMapCenter([0.3476, 32.5825]);
    setMapZoom(8);
  };

  const handleFollowToggle = (jobId: string) => {
    if (followedJobId === jobId) {
      setFollowedJobId(null);
    } else {
      setFollowedJobId(jobId);
      const target = trucks.find(t => t.jobId === jobId);
      if (target) {
        setMapCenter([target.lat, target.lng]);
        setMapZoom(11);
      }
    }
  };

  // Filtered trucks
  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => {
      if (clientJobId && t.jobId !== clientJobId) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDriver = t.driverName.toLowerCase().includes(q);
        const matchesPlate = t.numberPlate.toLowerCase().includes(q);
        const matchesJob = t.jobId.toLowerCase().includes(q);
        const matchesCargo = t.cargo.toLowerCase().includes(q);
        if (!matchesDriver && !matchesPlate && !matchesJob && !matchesCargo) return false;
      }
      return true;
    });
  }, [trucks, clientJobId, statusFilter, searchQuery]);

  // Active followed truck location for camera lock
  const followedTruckCoords = useMemo(() => {
    if (!followedJobId) return null;
    const t = trucks.find(tr => tr.jobId === followedJobId);
    return t ? ([t.lat, t.lng] as [number, number]) : null;
  }, [followedJobId, trucks]);

  // Offline breakdown alert truck (e.g. Denis Mukasa at Karuma)
  const offlineAlertTruck = useMemo(() => {
    return trucks.find(t => t.isOfflineLostNetwork || t.status === 'stopped');
  }, [trucks]);

  // Client view target truck (if clientJobId passed)
  const clientTargetTruck = clientJobId ? trucks.find(t => t.jobId === clientJobId) || trucks[0] : null;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#070f1a] shadow-2xl flex flex-col ${
      fullScreenMode ? 'h-[800px] lg:h-[860px]' : 'h-[640px] lg:h-[720px]'
    }`}>
      
      {/* TOP CONTROL ROOM BAR: "Live Fleet: 12 moving | 3 idle | Escrow 950k UGX" */}
      <div className="z-[1000] bg-gradient-to-r from-[#0d1829]/95 via-[#132238]/95 to-[#0d1829]/95 backdrop-blur-md border-b border-white/10 p-3 sm:p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Live Metric Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-black font-black rounded-xl shadow-lg shadow-orange-500/30">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-mono">
                  {clientJobId 
                    ? `Live Consignment Tracking #${clientJobId}` 
                    : summary.topBarText}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-[11px] text-white/60">
                {clientJobId 
                  ? 'Authorized Client Telemetry · Leaflet GPS Radar' 
                  : 'Uganda Northern Freight Transit Corridor · Mombasa ➔ Malaba ➔ Namanve ➔ Gulu'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Center on Uganda Corridor (Default zoom 8) */}
            <button
              onClick={() => {
                setFollowedJobId(null);
                setMapCenter([0.3476, 32.5825]);
                setMapZoom(8);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
              title="Default Uganda Corridor (lat 0.3476, lng 32.5825, zoom 8)"
            >
              <Compass className="w-3.5 h-3.5 text-orange-400" />
              <span>Uganda Corridor</span>
            </button>

            {/* Worldwide View Button */}
            <button
              onClick={() => {
                setFollowedJobId(null);
                setMapCenter([15, 55]);
                setMapZoom(3);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
              title="Worldwide View (Guangzhou, Mombasa, Kampala, Dubai)"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Worldwide View</span>
            </button>

            {/* Follow Truck Toggle */}
            {selectedTruck && (
              <button
                onClick={() => handleFollowToggle(selectedTruck.jobId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  followedJobId === selectedTruck.jobId
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-300 border border-white/10 hover:text-white'
                }`}
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Follow {selectedTruck.driverName.split(' ')[0]}</span>
              </button>
            )}

            {/* Trail line toggle */}
            <button
              onClick={() => setShowTrailLines(!showTrailLines)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showTrailLines 
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' 
                  : 'bg-slate-800 text-slate-400 border-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1h Trail Lines</span>
            </button>

            {/* Map Theme Toggle */}
            <button
              onClick={() => setMapStyle(mapStyle === 'dark' ? 'streets' : 'dark')}
              className="px-2.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-medium flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-white/70" />
              <span className="capitalize">{mapStyle}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchFleetLocations().then(() => setTimeout(() => setIsRefreshing(false), 500));
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-colors"
              title="Refresh GPS pings"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>

        </div>

        {/* Filter Strip: Status Chips (delivering / returning / stopped) & Search */}
        {!clientJobId && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">Status:</span>
              {[
                { id: 'all', label: `All Fleet (${trucks.length})` },
                { id: 'delivering', label: `🟢 Delivering (${trucks.filter(t => t.status === 'delivering').length})` },
                { id: 'empty_returning', label: `🟠 Returning (${trucks.filter(t => t.status === 'empty_returning').length})` },
                { id: 'stopped', label: `🔴 Stopped >30m (${trucks.filter(t => t.status === 'stopped').length})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setStatusFilter(btn.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === btn.id
                      ? 'bg-orange-500 text-black shadow-md'
                      : 'bg-slate-800/80 text-white/70 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver, plate, or #job..."
                className="w-full pl-8 pr-3 py-1 bg-slate-900/90 border border-white/15 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* CLIENT SPECIFIC ETA BANNER (Requirement 4: "Ronald Kato 45km away, ETA 1h 20m to Namanve") */}
      {clientJobId && clientTargetTruck && (
        <div className="z-[999] bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border-b border-emerald-500/40 p-3 text-white flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-slate-950 font-black rounded-xl">
              <Navigation className="w-4 h-4 animate-spin text-slate-950" />
            </div>
            <div>
              <div className="font-extrabold text-emerald-300 text-xs sm:text-sm">
                {clientTargetTruck.etaText || `${clientTargetTruck.driverName} 45km away, ETA 1h 20m to Namanve`}
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Vehicle: <strong className="font-mono text-white">{clientTargetTruck.numberPlate}</strong></span>
                <span>·</span>
                <span>Speed: <strong className="text-white font-mono">{clientTargetTruck.speed} km/h</strong></span>
                <span>·</span>
                <span>Last updated: {clientTargetTruck.lastUpdateRelative}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${clientTargetTruck.phone}`}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Driver ({clientTargetTruck.driverName.split(' ')[0]})</span>
            </a>
          </div>
        </div>
      )}

      {/* OFFLINE NETWORK ALERT BANNER (Requirement 5: "Driver lost network - last seen at Karuma bridge") */}
      {!clientJobId && offlineAlertTruck && (
        <div className="z-[998] bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 text-rose-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span>
              <strong>Driver lost network:</strong> Last seen at {offlineAlertTruck.lastSeenLocationName} (#{offlineAlertTruck.jobId} {offlineAlertTruck.driverName} · {offlineAlertTruck.lastUpdateRelative}). Queuing coordinates locally.
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedTruck(offlineAlertTruck);
              setMapCenter([offlineAlertTruck.lat, offlineAlertTruck.lng]);
              setMapZoom(12);
            }}
            className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded border border-rose-500/30 font-bold text-[11px] flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span>Inspect Truck</span>
          </button>
        </div>
      )}

      {/* MAIN LEAFLET MAP CONTAINER */}
      <div className="relative flex-1 w-full h-full min-h-[400px]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#070f1a' }}
          className="z-[1]"
        >
          {/* Map View Controller for Center / Follow functionality */}
          <MapViewController 
            centerCoords={mapCenter} 
            zoomLevel={mapZoom} 
            followTruckCoords={followedTruckCoords} 
          />

          {/* Sleek Dark CartoDB / OSM Tiles for Kobo360 style control room */}
          {mapStyle === 'dark' ? (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* UGANDA FREIGHT CORRIDOR POLYLINE (Requirement 1: Mombasa -> Malaba -> Namanve -> Gulu highway line in orange) */}
          <Polyline
            positions={UGANDA_CORRIDOR_COORDS}
            pathOptions={{
              color: '#f97316', // Orange
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />

          {/* Subtle Outer Glow along the highway corridor */}
          <Polyline
            positions={UGANDA_CORRIDOR_COORDS}
            pathOptions={{
              color: '#ea580c',
              weight: 9,
              opacity: 0.25,
            }}
          />

          {/* Corridor Waypoint Terminals */}
          {CORRIDOR_WAYPOINTS.map((wp, idx) => (
            <Marker
              key={idx}
              position={wp.coords}
              icon={getWaypointDivIcon(wp.name, wp.role)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 text-slate-900 text-xs">
                  <div className="font-bold text-sm text-slate-950">{wp.name}</div>
                  <div className="text-slate-600 font-semibold">{wp.role}</div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    Northern Corridor Waypoint · Lat {wp.coords[0].toFixed(4)}, Lng {wp.coords[1].toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* BREADCRUMB 1-HOUR TRAIL LINES (Requirement 5: looks like Kobo360 control room) */}
          {showTrailLines && filteredTrucks.map((truck) => {
            if (!truck.trail || truck.trail.length < 2) return null;
            const isTarget = selectedTruck?.jobId === truck.jobId || followedJobId === truck.jobId;
            const positions: [number, number][] = truck.trail.map(p => [p.lat, p.lng]);

            return (
              <React.Fragment key={`trail-${truck.jobId}`}>
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: isTarget ? '#06b6d4' : truck.status === 'delivering' ? '#10b981' : '#f59e0b',
                    weight: isTarget ? 4 : 2.5,
                    dashArray: isTarget ? '4, 6' : undefined,
                    opacity: isTarget ? 0.95 : 0.6,
                  }}
                />
                {/* Historical Trail Dots */}
                {truck.trail.map((p, pIdx) => (
                  <CircleMarker
                    key={`dot-${truck.jobId}-${pIdx}`}
                    center={[p.lat, p.lng]}
                    radius={isTarget ? 3.5 : 2}
                    pathOptions={{
                      color: isTarget ? '#06b6d4' : '#10b981',
                      fillColor: isTarget ? '#22d3ee' : '#34d399',
                      fillOpacity: 0.8,
                    }}
                  />
                ))}
              </React.Fragment>
            );
          })}

          {/* MOVING TRUCK MARKERS (Requirement 2: Green=delivering, Orange=empty returning, Red=stopped >30 mins) */}
          {filteredTrucks.map((truck) => {
            const isFollowed = followedJobId === truck.jobId;
            const icon = getTruckDivIcon(
              truck.status, 
              isFollowed, 
              truck.speed, 
              truck.isOfflineLostNetwork, 
              (truck as any).vehicleType, 
              truck.cargo
            );

            return (
              <Marker
                key={truck.jobId}
                position={[truck.lat, truck.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    setSelectedTruck(truck);
                    if (onSelectTruck) onSelectTruck(truck);
                  },
                }}
              >
                {/* TRUCK POPUP (Requirement 2: Driver Name, Phone, Job #, Speed, Last update "2 mins ago") */}
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 text-slate-900 text-xs min-w-[240px] space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          #{truck.jobId}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-950 mt-1">{truck.driverName}</h4>
                        <div className="text-[11px] text-slate-600 font-mono">{truck.numberPlate}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        truck.status === 'delivering' ? 'bg-emerald-100 text-emerald-800' :
                        truck.status === 'empty_returning' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800 animate-pulse'
                      }`}>
                        {truck.status === 'delivering' ? 'Delivering' :
                         truck.status === 'empty_returning' ? 'Empty Return' : 'Stopped >30m'}
                      </span>
                    </div>

                    {/* Telemetry info */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2 rounded-lg text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Speed:</span>
                        <strong className="text-slate-900 font-mono text-xs">
                          {truck.speed > 0 ? `${truck.speed} km/h` : '0 km/h (Idle)'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Last Update:</span>
                        <strong className="text-slate-900 text-xs">{truck.lastUpdateRelative}</strong>
                      </div>
                    </div>

                    {/* Cargo / Destination */}
                    <div className="text-[11px]">
                      <span className="text-slate-500 block text-[10px]">Cargo &amp; Route:</span>
                      <div className="text-slate-800 font-semibold">{truck.cargo}</div>
                      <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>Dest: {truck.destination}</span>
                      </div>
                    </div>

                    {/* Phone Link & Actions */}
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <a
                        href={`tel:${truck.phone}`}
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{truck.phone}</span>
                      </a>
                      <button
                        onClick={() => handleFollowToggle(truck.jobId)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                          followedJobId === truck.jobId
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        }`}
                      >
                        {followedJobId === truck.jobId ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* FLOATING LEGEND & CONTROL ROOM WIDGET */}
        <div className="absolute bottom-4 left-4 z-[997] bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-white text-xs shadow-2xl max-w-xs hidden sm:block">
          <div className="font-bold text-[11px] text-white/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Kobo360 Uganda Radar Legend</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white/20"></span>
              <span className="text-slate-300">Green = Delivering (Active Freight)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white/20"></span>
              <span className="text-slate-300">Orange = Empty returning to depot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 border border-white/20"></span>
              <span className="text-slate-300">Red = Stopped &gt;30 mins (Breakdown alert)</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              <span className="w-4 h-1 bg-orange-500 rounded"></span>
              <span className="text-orange-300 font-medium">Orange line = Mombasa-Gulu Corridor</span>
            </div>
          </div>
        </div>

        {/* Selected Truck Detail Floating Card */}
        {selectedTruck && (
          <div className="absolute bottom-4 right-4 z-[997] bg-[#1a2a3f]/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-white shadow-2xl w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-500 text-black">
                    #{selectedTruck.jobId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedTruck.status === 'delivering' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedTruck.status === 'empty_returning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {selectedTruck.status === 'delivering' ? 'Delivering' :
                     selectedTruck.status === 'empty_returning' ? 'Empty Return' : 'Stopped >30m'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">{selectedTruck.driverName}</h4>
                <div className="text-xs text-white/60 font-mono">{selectedTruck.numberPlate}</div>
              </div>
              <button
                onClick={() => setSelectedTruck(null)}
                className="text-white/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-white/50 block">Current Speed:</span>
                  <span className="font-bold text-white font-mono text-sm">
                    {selectedTruck.speed > 0 ? `${selectedTruck.speed} km/h` : '0 km/h (Stopped)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Last Seen:</span>
                  <span className="font-semibold text-orange-400">{selectedTruck.lastUpdateRelative}</span>
                </div>
              </div>

              <div className="text-slate-300">
                <span className="text-white/50 block text-[10px]">Location:</span>
                <span className="font-medium text-white">{selectedTruck.lastSeenLocationName}</span>
              </div>

              <div className="text-slate-300">
                <span className="text-white/50 block text-[10px]">Consignment:</span>
                <span className="text-white font-medium">{selectedTruck.cargo}</span>
              </div>

              {selectedTruck.etaText && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {selectedTruck.etaText}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`tel:${selectedTruck.phone}`}
                  className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {selectedTruck.phone}</span>
                </a>
                <button
                  onClick={() => handleFollowToggle(selectedTruck.jobId)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    followedJobId === selectedTruck.jobId
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-orange-500 hover:bg-orange-400 text-black'
                  }`}
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>{followedJobId === selectedTruck.jobId ? 'Following' : 'Follow Truck'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER BAR: Active East African Corridors & Escrow Guarantee */}
      <div className="p-2.5 sm:p-3 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time GPS Telemetry · Every 30s moving / 2m stopped · Low battery UG mode</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Escrow Protected: Till 031801 (Equity Bank)
          </span>
        </div>
      </div>

    </div>
  );
};
