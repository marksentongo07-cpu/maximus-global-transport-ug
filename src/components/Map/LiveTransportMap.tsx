import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin 
} from '@vis.gl/react-google-maps';
import { 
  Truck, 
  Navigation, 
  Layers, 
  SlidersHorizontal, 
  Phone, 
  CheckCircle, 
  Star, 
  Clock, 
  Compass,
  ArrowRight,
  Shield,
  MapPin,
  Building2,
  Coins
} from 'lucide-react';
import { Transporter, VehicleType, Job, Language, ICD } from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import { DEFAULT_ICDS } from '../../services/icdService';

interface LiveTransportMapProps {
  transporters: Transporter[];
  activeJob?: Job | null;
  language?: Language;
  icds?: ICD[];
  onSelectTransporter: (transporter: Transporter) => void;
  onDirectBook?: (transporter: Transporter) => void;
}

export const LiveTransportMap: React.FC<LiveTransportMapProps> = ({
  transporters,
  activeJob,
  language = 'en',
  icds = DEFAULT_ICDS,
  onSelectTransporter,
  onDirectBook,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(150);
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null);
  const [selectedMapICD, setSelectedMapICD] = useState<ICD | null>(null);
  const [showICDsOnMap, setShowICDsOnMap] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 0.3576, lng: 32.6099 }); // Center near Nakawa ICDs
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [fallbackMode, setFallbackMode] = useState<boolean>(!apiKey);

  // If active job provided, center on active GPS or route
  useEffect(() => {
    if (activeJob?.currentGps) {
      setMapCenter({ lat: activeJob.currentGps.lat, lng: activeJob.currentGps.lng });
      setMapZoom(10);
    } else if (activeJob?.pickupLocation) {
      setMapCenter({ lat: activeJob.pickupLocation.lat, lng: activeJob.pickupLocation.lng });
      setMapZoom(10);
    }
  }, [activeJob]);

  // Filter transporters
  const filteredTransporters = transporters.filter((t) => {
    if (selectedVehicleType !== 'all') {
      const hasVehicle = t.vehicles.some((v) => v.type === selectedVehicleType);
      if (!hasVehicle) return false;
    }
    return true;
  });

  return (
    <div className="relative w-full h-[650px] lg:h-[720px] rounded-2xl overflow-hidden border border-white/10 bg-[#1a2a3f] shadow-xl backdrop-blur flex flex-col">
      
      {/* Top Filter Bar Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#1a2a3f]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
        
        {/* Vehicle Type Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-full scrollbar-none">
          {[
            { id: 'all', label: 'All Fleet' },
            { id: 'fuso', label: 'Fuso 5-10T' },
            { id: 'semi_trailer', label: 'Semi-Trailer 35T' },
            { id: 'pickup', label: 'Pickup 1-2T' },
            { id: 'box_truck', label: 'Box Truck 10T' },
            { id: 'refrigerated', label: 'Cold Reefer' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedVehicleType(type.id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                selectedVehicleType === type.id
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Status / Active Fleet Summary */}
        <div className="flex items-center gap-2 text-xs text-slate-300 pl-2">
          <button
            onClick={() => setShowICDsOnMap(!showICDsOnMap)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showICDsOnMap
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Uganda ICDs ({icds.length})</span>
          </button>

          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-white font-bold">{filteredTransporters.length} Transporters</span> Online
          </div>
          {activeJob && (
            <div className="hidden sm:flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              <Navigation className="w-3 h-3 animate-spin" />
              <span>Route: {activeJob.pickupICDName || activeJob.pickupLocation.name.split(',')[0]} ➔ {activeJob.deliveryLocation.name.split(',')[0]}</span>
            </div>
          )}
        </div>

      </div>

      {/* Main Map Canvas: React Google Maps with AdvancedMarker */}
      <div className="relative flex-1 w-full h-full min-h-[500px]">
        {apiKey && !fallbackMode ? (
          <APIProvider apiKey={apiKey}>
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={mapCenter}
              defaultZoom={mapZoom}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            >
              {/* Markers for Available Transporters */}
              {filteredTransporters.map((transporter) => (
                <AdvancedMarker
                  key={transporter.id}
                  position={{
                    lat: transporter.currentLocation.lat,
                    lng: transporter.currentLocation.lng,
                  }}
                  title={transporter.name}
                  onClick={() => {
                    setSelectedTransporter(transporter);
                    onSelectTransporter(transporter);
                  }}
                >
                  <div className="cursor-pointer group flex flex-col items-center">
                    <div className="relative p-2 bg-[#0B192C] text-amber-400 border-2 border-amber-400 rounded-full shadow-lg transform transition-transform group-hover:scale-110">
                      <Truck className="w-5 h-5 text-amber-400" />
                      <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-emerald-500 text-[9px] font-bold text-slate-950 rounded-full">
                        {transporter.vehicles.reduce((sum, v) => sum + v.availableUnits, 0)}
                      </span>
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-slate-900/90 text-[10px] text-white font-semibold rounded shadow-md whitespace-nowrap border border-slate-700">
                      {transporter.companyName.split(' ')[0]} · ⭐{transporter.rating}
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

              {/* Inland Container Depots (ICDs) Real GPS Markers */}
              {showICDsOnMap && icds.map((icd) => (
                <AdvancedMarker
                  key={icd.id}
                  position={{ lat: icd.lat, lng: icd.lng }}
                  title={`${icd.name} (${icd.location})`}
                  onClick={() => setSelectedMapICD(icd)}
                >
                  <div className="cursor-pointer group flex flex-col items-center">
                    <div className="relative p-2 bg-slate-950 text-amber-400 border-2 border-amber-500 rounded-xl shadow-xl group-hover:scale-125 transition-transform">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span className="absolute -top-1 -right-1 px-1 bg-amber-500 text-[8px] font-black text-slate-950 rounded">
                        ICD
                      </span>
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-slate-950/95 text-[10px] text-amber-300 font-bold rounded shadow-md whitespace-nowrap border border-amber-500/40">
                      {icd.name}
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

              {/* Active Cargo Job Pickup and Delivery Markers */}
              {activeJob && (
                <>
                  {/* Pickup / ICD Origin Marker */}
                  <AdvancedMarker
                    position={{ lat: activeJob.pickupLocation.lat, lng: activeJob.pickupLocation.lng }}
                    title={`Origin: ${activeJob.pickupLocation.name}`}
                  >
                    <div className={`p-1.5 text-white rounded-full border-2 border-white shadow-xl flex items-center gap-1 ${
                      activeJob.isICDJob ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-emerald-600'
                    }`}>
                      {activeJob.isICDJob ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      <span className="text-[10px] font-bold pr-1">
                        {activeJob.isICDJob ? 'ICD Origin' : 'Pickup'}
                      </span>
                    </div>
                  </AdvancedMarker>

                  {/* Delivery Destination Marker */}
                  <AdvancedMarker
                    position={{ lat: activeJob.deliveryLocation.lat, lng: activeJob.deliveryLocation.lng }}
                    title={`Delivery: ${activeJob.deliveryLocation.name}`}
                  >
                    <div className="p-1.5 bg-rose-600 text-white rounded-full border-2 border-white shadow-xl flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] font-bold pr-1">Destination</span>
                    </div>
                  </AdvancedMarker>

                  {/* Moving GPS Driver Pin */}
                  {activeJob.currentGps && (
                    <AdvancedMarker
                      position={{ lat: activeJob.currentGps.lat, lng: activeJob.currentGps.lng }}
                      title="Current Vehicle Location"
                    >
                      <div className="relative p-2.5 bg-amber-500 text-slate-950 rounded-full border-2 border-white shadow-2xl animate-bounce">
                        <Truck className="w-5 h-5" />
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-[10px] font-extrabold text-slate-950 rounded shadow-md whitespace-nowrap">
                          {activeJob.currentGps.progressPercent}% Route Done
                        </span>
                      </div>
                    </AdvancedMarker>
                  )}
                </>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* High-Fidelity SVG Interactive Radar Vector Fallback */
          <div className="w-full h-full relative bg-[#07111E] overflow-hidden flex items-center justify-center">
            {/* Grid Lines */}
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, #07111e 1px)',
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
              }}
            />

            {/* Radar Concentric Rings */}
            <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/20 pointer-events-none" />
            <div className="absolute w-[340px] h-[340px] rounded-full border border-cyan-500/25 pointer-events-none" />
            <div className="absolute w-[180px] h-[180px] rounded-full border border-cyan-500/30 pointer-events-none" />
            
            {/* Central Kampala Radar Pulse */}
            <div className="absolute flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping opacity-75" />
              <div className="w-3 h-3 rounded-full bg-cyan-300 -mt-3.5 shadow-md shadow-cyan-400" />
              <span className="mt-2 text-[10px] font-bold text-cyan-300 tracking-wider uppercase">
                Uganda Logistics Radar Center
              </span>
            </div>

            {/* Simulated Geographic Position Nodes */}
            {filteredTransporters.map((transporter, idx) => {
              // Normalized simulated offsets
              const offsets = [
                { top: '38%', left: '46%' },
                { top: '55%', left: '38%' },
                { top: '34%', left: '62%' },
                { top: '68%', left: '30%' },
              ];
              const pos = offsets[idx % offsets.length];

              return (
                <div
                  key={transporter.id}
                  onClick={() => {
                    setSelectedTransporter(transporter);
                    setSelectedMapICD(null);
                    onSelectTransporter(transporter);
                  }}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-10"
                >
                  <div className="relative p-2.5 bg-slate-900 border-2 border-amber-400 rounded-full shadow-lg group-hover:scale-125 transition-transform">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span className="absolute -top-1 -right-1 px-1 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full">
                      {transporter.vehicles.reduce((acc, v) => acc + v.availableUnits, 0)}
                    </span>
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-slate-900/95 border border-slate-700 text-white rounded text-[10px] font-semibold whitespace-nowrap shadow-md">
                    {transporter.companyName}
                  </div>
                </div>
              );
            })}

            {/* Simulated Uganda ICD Terminals on Radar Fallback */}
            {showICDsOnMap && icds.map((icd, idx) => {
              const icdOffsets = [
                { top: '48%', left: '52%' }, // Multiple ICD (Nakawa)
                { top: '46%', left: '54%' }, // Maina ICD (Nakawa)
                { top: '44%', left: '68%' }, // Good Brothers (Namanve)
                { top: '58%', left: '50%' }, // APM Terminal (Namuwongo)
                { top: '42%', left: '64%' }, // Bolloré (Bweyogerere)
                { top: '30%', left: '88%' }, // Malaba Border Depot
              ];
              const pos = icdOffsets[idx % icdOffsets.length];

              return (
                <div
                  key={icd.id}
                  onClick={() => {
                    setSelectedMapICD(icd);
                    setSelectedTransporter(null);
                  }}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20"
                >
                  <div className="p-1.5 bg-slate-950 text-amber-400 border-2 border-amber-500 rounded-lg shadow-xl group-hover:scale-125 transition-transform flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="mt-1 px-1.5 py-0.2 bg-slate-950/90 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold whitespace-nowrap shadow">
                    {icd.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected ICD Detail Floating Card */}
        {selectedMapICD && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-[#1a2a3f] backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-slate-700 text-white rounded-xl border border-white/10">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-white">{selectedMapICD.name}</h4>
                  <div className="text-[12px] text-white/60 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-white/40" />
                    <span>{selectedMapICD.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMapICD(null)}
                className="text-white/60 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-white/50 block">Daily Storage Fee:</span>
                  <span className="font-bold text-orange-400 font-mono text-[14px]">
                    {formatMoney(selectedMapICD.storageFeePerDay)} / Day
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Operating Hours:</span>
                  <span className="font-semibold text-white line-clamp-1">{selectedMapICD.operatingHours}</span>
                </div>
              </div>

              <div className="text-[12px] text-white/70">
                <span className="text-white/40">Desk Contact:</span> {selectedMapICD.contact}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`tel:${selectedMapICD.contact.split('/')[0].trim()}`}
                  className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Phone className="w-3.5 h-3.5 text-white/80" />
                  <span>Call Terminal</span>
                </a>
                <button
                  onClick={() => {
                    setSelectedMapICD(null);
                    if (onDirectBook) {
                      onDirectBook(transporters[0]);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 bg-orange-500 hover:bg-orange-400 text-black rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>Book Pickup Here</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Transporter Detail Floating Card */}
        {selectedTransporter && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-[#1a2a3f] backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTransporter.avatarUrl}
                  alt={selectedTransporter.name}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[18px] font-bold text-white">{selectedTransporter.companyName}</h4>
                    {selectedTransporter.kycStatus === 'verified' && (
                      <span title="KYC Verified Transporter">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-white/60">Driver: {selectedTransporter.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                      {selectedTransporter.rating}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/80 font-medium">{selectedTransporter.totalTrips} Safe Trips</span>
                    <span className="text-white/30">·</span>
                    <span className="text-emerald-400 font-semibold">{selectedTransporter.loyaltyPoints} Pts</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransporter(null)}
                className="text-white/60 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            {/* Vehicle Fleet Breakdown */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Available Vehicles at Depot:</div>
              <div className="space-y-1.5">
                {selectedTransporter.vehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-xs bg-slate-800/60 p-2 rounded-lg">
                    <div>
                      <span className="font-medium text-white">{v.name}</span>
                      <div className="text-[10px] text-slate-400">Cap: {v.capacityTons} Tonnes · {v.currentLocation.name}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-bold">{v.availableUnits} Available</span>
                      <div className="text-[10px] text-slate-400">{formatMoney(v.ratePerKmUGX)}/km</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-2">
              <a
                href={`tel:${selectedTransporter.phone}`}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call ({selectedTransporter.maskedPhone.split(' ')[2] || 'Driver'})</span>
              </a>
              <button
                onClick={() => {
                  if (onDirectBook) onDirectBook(selectedTransporter);
                }}
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <span>Request Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Bar: Map Info & Regional Corridors */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Active East African Corridors: Kampala · Jinja · Malaba · Gulu · Mbarara · Mombasa Port</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            All Transporters Inspected &amp; KYC Vetted
          </span>
        </div>
      </div>

    </div>
  );
};
