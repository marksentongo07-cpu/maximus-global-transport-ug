import React, { useState } from 'react';
import { ICD, Transporter, Currency, Language } from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import { getTransportersNearICD, calculateICDStorageFee } from '../../services/icdService';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Coins, 
  Calculator, 
  Truck, 
  ShieldCheck, 
  Navigation, 
  ArrowRight, 
  Plus, 
  Search,
  Sparkles,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface ICDsAndWarehousesPageProps {
  icds: ICD[];
  transporters: Transporter[];
  currency: Currency;
  language?: Language;
  onSelectICDPickup: (icd: ICD) => void;
  onViewOnMap: (icd: ICD) => void;
  onOpenManageICDs?: () => void;
  isAdmin: boolean;
}

export const ICDsAndWarehousesPage: React.FC<ICDsAndWarehousesPageProps> = ({
  icds,
  transporters,
  currency,
  language = 'en',
  onSelectICDPickup,
  onViewOnMap,
  onOpenManageICDs,
  isAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculator states
  const [selectedCalcICDId, setSelectedCalcICDId] = useState<string>(icds[0]?.id || 'icd-001');
  const [extraDays, setExtraDays] = useState<number>(1);
  const [customDailyFee, setCustomDailyFee] = useState<number>(50000);
  const [cargoNatureMultiplier, setCargoNatureMultiplier] = useState<number>(1.0);
  const [cargoNatureName, setCargoNatureName] = useState<string>('Standard Commercial Cargo');

  const selectedCalcICD = icds.find(i => i.id === selectedCalcICDId) || icds[0];

  // Keep daily fee synced when ICD selection changes unless customized
  const handleSelectCalcICD = (icdId: string) => {
    setSelectedCalcICDId(icdId);
    const found = icds.find(i => i.id === icdId);
    if (found) {
      setCustomDailyFee(found.storageFeePerDay);
    }
  };

  const filteredICDs = icds.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTEUCapacity = icds.reduce((sum, i) => sum + (i.capacityTEU || 2000), 0);

  // Compute storage fee calculation
  const calcResult = calculateICDStorageFee(extraDays, customDailyFee, cargoNatureMultiplier);

  const cargoNatureOptions = [
    { name: 'Standard Commercial Cargo', multiplier: 1.0, desc: 'Dry palletized goods, grains, general merchandise' },
    { name: 'Cold Chain / Perishables (Reefer)', multiplier: 1.5, desc: 'Requires continuous auxiliary power plug-in & temp audit' },
    { name: 'Heavy Machinery & Oversize Steel', multiplier: 1.25, desc: 'Exceeds standard 20ft/40ft container footprint' },
    { name: 'Hazardous Materials & Chemicals', multiplier: 1.4, desc: 'Bonded safety containment & fire marshal clearance' },
    { name: 'High-Value Fragile Electronics', multiplier: 1.3, desc: 'Stationed in 24/7 CCTV surveillance security bay' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-[#0e213a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Uganda Port &amp; Dry Terminal Network
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                URA Customs Bonded
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Inland Container Depots (ICDs) &amp; Bonded Warehouses
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Verified clearance hubs connecting maritime container freight from Mombasa &amp; Dar es Salaam to Kampala. 
              Book transporters with automated 5km geofenced dispatch and transparent daily storage fee calculation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && onOpenManageICDs && (
              <button
                onClick={onOpenManageICDs}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Manage ICDs &amp; Fees</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered ICDs:</span>
            <span className="text-lg font-black text-white">{icds.length} Hubs Active</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Yard Capacity:</span>
            <span className="text-lg font-black text-emerald-400">~{totalTEUCapacity.toLocaleString()} TEUs</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Base Storage Fee:</span>
            <span className="text-lg font-black text-amber-400">{formatMoney(50000, currency)} / Day</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customs Clearance:</span>
            <span className="text-lg font-black text-sky-400">100% URA Direct</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE ICD STORAGE & DEMURRAGE CALCULATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ICD Storage &amp; Demurrage Fee Calculator
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  UGX 50,000 / Day Base
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Calculate extra storage costs if hired truck stays additional days at the ICD terminal
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Amount adjusts dynamically based on job nature &amp; days</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Column */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Select ICD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Select ICD Terminal:
              </label>
              <select
                value={selectedCalcICDId}
                onChange={(e) => handleSelectCalcICD(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {icds.map((icd) => (
                  <option key={icd.id} value={icd.id}>
                    {icd.name} ({icd.location.split(',')[0]}) - {formatMoney(icd.storageFeePerDay, currency)}/day
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Extra Days */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Extra Days at ICD:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={extraDays}
                  onChange={(e) => setExtraDays(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Day(s)</span>
              </div>
            </div>

            {/* 3. Base Daily Fee (Customizable) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Daily Storage Rate (UGX):
              </label>
              <input
                type="number"
                step="5000"
                value={customDailyFee}
                onChange={(e) => setCustomDailyFee(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 block">Default is UGX 50,000 per day; adjustable per contract</span>
            </div>

            {/* 4. Nature of Job / Cargo Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Nature of Cargo / Job:
              </label>
              <select
                value={cargoNatureMultiplier}
                onChange={(e) => {
                  const mult = Number(e.target.value);
                  setCargoNatureMultiplier(mult);
                  const opt = cargoNatureOptions.find(o => o.multiplier === mult);
                  if (opt) setCargoNatureName(opt.name);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {cargoNatureOptions.map((opt) => (
                  <option key={opt.name} value={opt.multiplier}>
                    {opt.name} ({opt.multiplier}x rate)
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Result Card */}
          <div className="bg-gradient-to-b from-slate-950 to-[#07111E] border-2 border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span>Calculated Demurrage:</span>
                <span className="font-bold text-emerald-400">{cargoNatureMultiplier}x Nature Factor</span>
              </div>

              <div className="my-4">
                <span className="text-[11px] text-slate-400 block">Total Storage Surcharge:</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                  {formatMoney(calcResult.totalStorageFeeUGX, currency)}
                </div>
                <div className="text-xs text-slate-300 mt-1 font-mono">
                  {calcResult.breakdown}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span>Terminal:</span>
                  <span className="font-semibold text-white">{selectedCalcICD?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Effective Daily Rate:</span>
                  <span className="font-semibold text-amber-300">{formatMoney(calcResult.effectiveDailyRateUGX, currency)}/day</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (selectedCalcICD) onSelectICDPickup(selectedCalcICD);
              }}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
            >
              <Truck className="w-4 h-4" />
              <span>Book Cargo Pickup at {selectedCalcICD?.name}</span>
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 3: DIRECTORY OF UGANDA ICDS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Uganda Inland Container Depots Directory
            </h2>
            <p className="text-xs text-slate-400">
              Real GPS locations, operating hours, yard capacities, and geofenced driver radar
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ICD name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredICDs.map((icd) => {
            const nearbyTransporters = getTransportersNearICD(icd, transporters, 5);

            return (
              <div
                key={icd.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  
                  {/* Card Title & GPS coordinates */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <h3 className="text-base font-bold text-white">{icd.name}</h3>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{icd.location}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                      {icd.lat.toFixed(4)}, {icd.lng.toFixed(4)}
                    </span>
                  </div>

                  {/* Geofence Radar Badge: Transporters within 5km */}
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-slate-300 font-medium">
                        Geofenced Trucks (5km):
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400">
                      {nearbyTransporters.length} Fleet Transporters Available
                    </span>
                  </div>

                  {/* Description */}
                  {icd.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {icd.description}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Daily Storage Fee:</span>
                      <span className="font-bold text-amber-400">{formatMoney(icd.storageFeePerDay, currency)} / Day</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Operating Hours:</span>
                      <span className="font-semibold text-slate-200 line-clamp-1">{icd.operatingHours}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Yard Capacity:</span>
                      <span className="font-semibold text-slate-200">
                        {icd.capacityTEU ? `${icd.capacityTEU.toLocaleString()} TEUs` : 'Bulk Yard'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Contact Desk:</span>
                      <span className="font-semibold text-slate-200 line-clamp-1">{icd.contact}</span>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => onViewOnMap(icd)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>View on GPS Map</span>
                  </button>

                  <button
                    onClick={() => onSelectICDPickup(icd)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <span>Post Job from this ICD</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
