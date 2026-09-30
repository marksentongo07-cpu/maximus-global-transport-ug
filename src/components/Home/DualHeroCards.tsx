import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  Container,
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  Navigation, 
  Sparkles, 
  FileCheck,
  CheckCircle2, 
  Lock,
  Globe,
  Search,
  Anchor,
  Plane,
  FileText
} from 'lucide-react';
import { Currency } from '../../types';
import { formatMoney } from '../../services/currency';

interface DualHeroCardsProps {
  currency: Currency;
  onPostCargoClick: () => void;
  onFindLoadsClick: () => void;
}

interface CountryFilterOption {
  id: string;
  name: string;
  flag: string;
}

const COUNTRIES: CountryFilterOption[] = [
  { id: 'worldwide', name: 'Worldwide', flag: '🌍' },
  { id: 'uganda', name: 'Uganda', flag: '🇺🇬' },
  { id: 'kenya', name: 'Kenya', flag: '🇰🇪' },
  { id: 'tanzania', name: 'Tanzania', flag: '🇹🇿' },
  { id: 'rwanda', name: 'Rwanda', flag: '🇷🇼' },
  { id: 'sa', name: 'SA', flag: '🇿🇦' },
  { id: 'china', name: 'China', flag: '🇨🇳' },
  { id: 'uae', name: 'UAE', flag: '🇦🇪' },
  { id: 'russia', name: 'Russia', flag: '🇷🇺' },
  { id: 'turkey', name: 'Turkey', flag: '🇹🇷' },
];

export const DualHeroCards: React.FC<DualHeroCardsProps> = ({
  currency,
  onPostCargoClick,
  onFindLoadsClick,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('worldwide');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCountrySelect = (id: string) => {
    setSelectedCountry(id);
    setSearchQuery('');
  };

  const isUganda = selectedCountry === 'uganda';
  const isWorldwide = selectedCountry === 'worldwide';

  // Subtitle / text logic according to user specification
  const clientCardDescription = isUganda
    ? 'Ship WITHIN Uganda: Kampala to Gulu, Mbale to Namanve - saloon to 40ft'
    : selectedCountry === 'china'
    ? 'Direct China-East Africa containerized sea & overland transit. Guangzhou/Yiwu to Kampala.'
    : selectedCountry === 'uae'
    ? 'Dubai Jebel Ali and air cargo links direct to Entebbe and Kampala bonded warehouses.'
    : selectedCountry === 'kenya'
    ? 'Northern Corridor transit: Port of Mombasa to Malaba/Busia border, Kampala and beyond.'
    : 'Ship cargo anywhere across East Africa and globally. Receive verified transporter bids within 5 minutes.';

  return (
    <div className="w-full space-y-5">
      {/* ---------------------------------------------------- */}
      {/* TOP COUNTRY SPLIT FILTER BAR */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#0f1c2e]/90 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Transit Corridor &amp; Country Filter:
            </span>
          </div>

          {/* Search Country Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedCountry('custom');
                }
              }}
              placeholder="Search country (e.g. India, UK, DRC)..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#070F1A] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#C9A86A] transition-colors"
            />
          </div>
        </div>

        {/* Country Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {COUNTRIES.map((country) => {
            const isSelected = selectedCountry === country.id;
            return (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country.id)}
                className={`transition-all whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  isSelected
                    ? 'bg-[#C9A86A] text-[#0A1931] border-[#C9A86A] shadow-md shadow-[#C9A86A]/20 scale-[1.02]'
                    : 'bg-[#1a2a3f]/70 hover:bg-[#1a2a3f] text-slate-300 hover:text-white border-white/10'
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            );
          })}

          {selectedCountry === 'custom' && searchQuery && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Active: {searchQuery}
            </span>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HERO ACTION CARDS GRID */}
      {/* 2 Cards when Uganda is selected, 3 Cards when Worldwide */}
      {/* ---------------------------------------------------- */}
      <div className={`grid gap-6 items-stretch ${
        isWorldwide 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        
        {/* CARD 1: I NEED A TRUCK (Client) */}
        <div className="group relative bg-[#1a2a3f] border border-white/10 hover:border-blue-400/50 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur flex flex-col justify-between transition-all duration-300 overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all" />
          
          <div className="relative z-10 space-y-4">
            {/* Top Badge & Identifier */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Package className="w-3.5 h-3.5 text-blue-400" />
                <span>Card 1 · Client &amp; Shipper</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                100% Free Posting
              </span>
            </div>

            {/* Card Title & Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>I NEED A TRUCK</span>
              </h2>
              {/* SPECIFICATION: If Uganda selected: "Ship WITHIN Uganda: Kampala to Gulu, Mbale to Namanve - saloon to 40ft" */}
              <p className={`text-[14px] leading-6 mt-1.5 ${isUganda ? 'text-amber-300 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20' : 'text-white/70'}`}>
                {clientCardDescription}
              </p>
            </div>

            {/* Key Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Fast Bidding</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Avg. 5 Mins
                </div>
              </div>

              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Safe Escrow</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  MoMo &amp; Bank
                </div>
              </div>

              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Bank-Grade Trust</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  NIN &amp; Logbook
                </div>
              </div>
            </div>
          </div>

          {/* Action Button Area */}
          <div className="relative z-10 pt-6 mt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onPostCargoClick}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 text-base transition-all group-hover:shadow-blue-500/40"
            >
              <Package className="w-5 h-5 text-white" />
              <span>Post Cargo - Free</span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-center text-white/40 mt-2 font-medium">
              No commission charged to clients · Transporters bid directly
            </p>
          </div>
        </div>

        {/* CARD 2: I HAVE A TRUCK (Transporter) */}
        <div className="group relative bg-[#1a2a3f] border border-white/10 hover:border-amber-400/50 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur flex flex-col justify-between transition-all duration-300 overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-all" />
          
          <div className="relative z-10 space-y-4">
            {/* Top Badge & Identifier */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Card 2 · Transporter &amp; Driver</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Coins className="w-3 h-3" />
                Instant Payouts
              </span>
            </div>

            {/* Card Title & Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>I HAVE A TRUCK</span>
              </h2>
              <p className="text-[14px] text-white/70 leading-6 mt-1.5">
                Put your empty truck to work. Browse verified commercial loads, place competitive bids, and receive guaranteed payouts.
              </p>
            </div>

            {/* Key Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Zero Broker Deductions</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  Direct Bids
                </div>
              </div>

              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Instant Release</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  On POD Sign
                </div>
              </div>

              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Corridor Tracking</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  Free GPS Sim
                </div>
              </div>
            </div>
          </div>

          {/* Action Button Area */}
          <div className="relative z-10 pt-6 mt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onFindLoadsClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] active:scale-[0.99] text-[#0A1931] font-black rounded-xl shadow-lg shadow-[#C9A86A]/20 flex items-center justify-center gap-2.5 text-base transition-all group-hover:shadow-[#C9A86A]/30"
            >
              <Truck className="w-5 h-5 text-[#0A1931]" />
              <span>Find Loads &amp; Bid</span>
              <ArrowRight className="w-5 h-5 text-[#0A1931] group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-center text-white/40 mt-2 font-medium">
              Join 500+ verified East African carriers · Bank-Grade KYC verified
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CARD 3: CROSS-BORDER & INTERNATIONAL (Shows when Worldwide is selected) */}
        {/* ---------------------------------------------------- */}
        {isWorldwide && (
          <div className="group relative bg-[#15273f] border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur flex flex-col justify-between transition-all duration-300 overflow-hidden md:col-span-2 lg:col-span-1">
            {/* Subtle Ambient Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-cyan-500/20 transition-all" />
            
            <div className="relative z-10 space-y-4">
              {/* Top Badge & Identifier */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Card 3 · Global Logistics</span>
                </span>
                <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  <Anchor className="w-3 h-3" />
                  Port &amp; Air Hub
                </span>
              </div>

              {/* Card Title & Headline: EXACT PROMPT SPECIFICATION */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>CROSS-BORDER &amp; INTERNATIONAL</span>
                </h2>
                <p className="text-[13px] text-cyan-200 leading-relaxed mt-1.5 font-medium bg-cyan-950/50 p-2.5 rounded-xl border border-cyan-500/20">
                  Guangzhou to Gulu, Dubai to Kampala, Moscow to Mombasa - customs Yes/No, Mode Road/Sea+Road/Air+Road
                </p>
              </div>

              {/* Multimodal Highlights */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a1829] border border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Customs Brokerage
                  </span>
                  <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    Yes / No (UCIFA / AEO)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a1829] border border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-sky-400" />
                    Transport Modes
                  </span>
                  <span className="font-bold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded">
                    Road · Sea+Road · Air+Road
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a1829] border border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    Currency Billing
                  </span>
                  <span className="font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                    Dual USD &amp; UGX Vault
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button Area */}
            <div className="relative z-10 pt-6 mt-4 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={onPostCargoClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2.5 text-base transition-all group-hover:shadow-cyan-500/40"
              >
                <Globe className="w-5 h-5 text-white" />
                <span>Post Cross-Border Cargo</span>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-center text-cyan-300/60 mt-2 font-medium">
                Maersk, Ethiopian Cargo &amp; verified border transshipment carriers
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
