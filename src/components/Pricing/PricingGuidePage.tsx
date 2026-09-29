import React, { useState } from 'react';
import { Currency, Language, VehicleType } from '../../types';
import { formatMoney } from '../../services/currency';
import { VEHICLE_BASE_RATES, KNOWN_HUBS, estimateTransportPrice } from '../../services/pricingEngine';
import { 
  Coins, 
  ShieldCheck, 
  Scale, 
  Truck, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle,
  Container,
  Car,
  DollarSign,
  TrendingDown,
  Building2,
  Lock
} from 'lucide-react';

interface PricingGuidePageProps {
  currency: Currency;
  language: Language;
  onOpenPostCargo: () => void;
  onOpenRegisterTransporter: () => void;
}

export const PricingGuidePage: React.FC<PricingGuidePageProps> = ({
  currency,
  language,
  onOpenPostCargo,
  onOpenRegisterTransporter,
}) => {
  // Interactive Live Price Estimator state
  const [calcPickup, setCalcPickup] = useState('kampala');
  const [calcDrop, setCalcDrop] = useState('jinja');
  const [calcVehicle, setCalcVehicle] = useState<VehicleType>('fuso');
  const [calcWeight, setCalcWeight] = useState<number>(5);

  const pickupCoords = KNOWN_HUBS[calcPickup] || KNOWN_HUBS.kampala;
  const dropCoords = KNOWN_HUBS[calcDrop] || KNOWN_HUBS.jinja;

  const quote = estimateTransportPrice(
    { lat: pickupCoords.lat, lng: pickupCoords.lng },
    { lat: dropCoords.lat, lng: dropCoords.lng },
    calcVehicle,
    calcWeight
  );

  return (
    <div className="space-y-6">
      
      {/* Hero Banner: Free Market Text Rule */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b192c] via-[#1a2a3f] to-[#251b0f] border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              100% Open Free Market Policy
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Fixed 8% Escrow Commission Only
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            MAXIMUS Free Market &amp; Transparent Rates Guide
          </h1>

          {/* User Exact Requested Charter Text */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-100 text-sm sm:text-base font-semibold leading-relaxed shadow-lg">
            “MAXIMUS is FREE MARKET - You set price, you negotiate, we secure escrow. We don't fix price. Suggested prices are guide only. 8% commission on final agreed amount.”
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Unlike legacy cartels or closed brokerages, MAXIMUS empowers cargo owners and drivers with complete commercial freedom. Post any offer from <strong>5,000 UGX</strong> to <strong>100,000,000 UGX</strong>. Transporters submit bids with zero price caps, exchange counter-offers like Jumia chat, and client chooses the best partner.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenPostCargo}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs sm:text-sm rounded-full shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
            >
              <span>Post Cargo at Your Own Price</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenRegisterTransporter}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-full border border-white/20 transition-all flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-orange-400" />
              <span>Register Fleet to Bid Freely</span>
            </button>
          </div>
        </div>
      </div>

      {/* Corridor Benchmark Rates Table */}
      <div className="bg-[#1a2a3f] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>Standard Baseline Guidelines (Reference Only)</span>
            </h3>
            <p className="text-xs text-white/60">
              Official corridor benchmarks to help you price your haulage. Remember: You and your carrier negotiate the final fare.
            </p>
          </div>
          <span className="text-[11px] text-amber-400 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
            Escrow Commission: 8% Flat
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Saloon Car Express */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-400" />
                Saloon Car / Sedan
              </span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                Group 1 Express
              </span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              1,000 UGX <span className="text-xs font-normal text-white/60">/ km</span>
            </div>
            <p className="text-[11px] text-white/70">
              Kampala local &amp; metropolitan runs. Ideal for urgent legal documents, tenders, keys, medical files, and up to 500kg parcels.
            </p>
          </div>

          {/* Card 2: Pickup Single/Double */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                Pickup (Hilux / Single Cab)
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                1.2T - 1.5T
              </span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              1,500 UGX <span className="text-xs font-normal text-white/60">/ km</span>
            </div>
            <p className="text-[11px] text-white/70">
              Light freight, hardware supplies, farm equipment parts, and express upcountry regional delivery.
            </p>
          </div>

          {/* Card 3: Fuso 5T / 7T */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-orange-400" />
                Isuzu Fuso 5T / 7T
              </span>
              <span className="text-[10px] text-orange-300 font-bold bg-orange-500/20 px-2 py-0.5 rounded">
                Uganda Workhorse
              </span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              3,500 UGX <span className="text-xs font-normal text-white/60">/ km</span>
            </div>
            <p className="text-[11px] text-white/70">
              Uganda's most versatile carrier. Agricultural produce, grain bags, timber, cement distribution, and retail replenishment.
            </p>
          </div>

          {/* Card 4: 20ft Container */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Container className="w-4 h-4 text-blue-400" />
                20ft Container Trailer
              </span>
              <span className="text-[10px] text-blue-300 font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                Mombasa - Kampala
              </span>
            </div>
            <div className="text-xl font-extrabold text-blue-300 font-mono">
              $1,850 <span className="text-xs font-normal text-white/60">Flat Corridor (~6.8M UGX)</span>
            </div>
            <p className="text-[11px] text-white/70">
              Bonded seaport container haulage. Mombasa Port or Dar es Salaam Port directly to Namanve ICD or Kampala ICD.
            </p>
          </div>

          {/* Card 5: 40ft Container */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Container className="w-4 h-4 text-blue-400" />
                40ft Container / High Cube
              </span>
              <span className="text-[10px] text-blue-300 font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                Mombasa - Kampala
              </span>
            </div>
            <div className="text-xl font-extrabold text-blue-300 font-mono">
              $2,800 <span className="text-xs font-normal text-white/60">Flat Corridor (~10.3M UGX)</span>
            </div>
            <p className="text-[11px] text-white/70">
              Heavy 30-35T shipping containers. Transit bonded customs transit with live satellite GPS tracking.
            </p>
          </div>

          {/* Card 6: Wide Load / Abnormal Load */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Wide / Abnormal Load
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                Escort + URA Permit
              </span>
            </div>
            <div className="text-base font-extrabold text-amber-300 font-mono">
              Quote + 30% Escort + 250k Permit
            </div>
            <p className="text-[11px] text-white/70">
              Excavators, industrial boilers, heavy transformers, crane beams. Lowbed trailers equipped with police pilot escort cars.
            </p>
          </div>

        </div>
      </div>

      {/* Interactive Price Estimator & Guidance Simulator */}
      <div className="bg-[#1a2a3f] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-400" />
            <span>Interactive Fare Guide Simulator</span>
          </h3>
          <span className="text-xs text-white/60">Check distance &amp; guide fares</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0f1c2e] p-4 rounded-xl border border-white/10 text-xs">
          <div>
            <label className="text-white/60 font-bold block mb-1">Pickup Hub:</label>
            <select
              value={calcPickup}
              onChange={(e) => setCalcPickup(e.target.value)}
              className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-white"
            >
              {Object.entries(KNOWN_HUBS).map(([k, hub]) => (
                <option key={k} value={k}>{hub.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/60 font-bold block mb-1">Destination:</label>
            <select
              value={calcDrop}
              onChange={(e) => setCalcDrop(e.target.value)}
              className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-white"
            >
              {Object.entries(KNOWN_HUBS).map(([k, hub]) => (
                <option key={k} value={k}>{hub.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/60 font-bold block mb-1">Vehicle Type:</label>
            <select
              value={calcVehicle}
              onChange={(e) => setCalcVehicle(e.target.value as any)}
              className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-white"
            >
              {Object.entries(VEHICLE_BASE_RATES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/60 font-bold block mb-1">Weight (Tons):</label>
            <input
              type="number"
              step="0.5"
              value={calcWeight}
              onChange={(e) => setCalcWeight(Number(e.target.value))}
              className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

        {/* Calculation Result */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Calculated Route Distance:</span>
            <span className="text-lg font-bold text-white font-mono">~{quote.distanceKm} km</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Suggested Guide Price:</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {formatMoney(quote.totalMarketEstimateUGX, currency)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">8% Escrow Facilitation:</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {formatMoney(Math.round(quote.totalMarketEstimateUGX * 0.08), currency)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Negotiable Free Range:</span>
            <span className="text-xs font-semibold text-slate-200">
              {formatMoney(quote.fairPriceRange.minUGX, currency)} - {formatMoney(quote.fairPriceRange.maxUGX, currency)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
