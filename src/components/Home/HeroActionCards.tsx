import React from 'react';
import { 
  Package, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Coins, 
  CheckCircle2, 
  Sparkles,
  Radio
} from 'lucide-react';
import { Currency } from '../../types';

interface HeroActionCardsProps {
  onOpenPostCargo: () => void;
  onOpenTransporterRegister: () => void;
  currency?: Currency;
}

export const HeroActionCards: React.FC<HeroActionCardsProps> = ({
  onOpenPostCargo,
  onOpenTransporterRegister,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
      
      {/* CARD 1 - I NEED A TRUCK (Client) */}
      <div className="bg-[#1a2a3f] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur relative overflow-hidden flex flex-col justify-between group hover:border-blue-500/50 transition-all">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              For Cargo Shippers &amp; Clients
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Instant Booking
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              I NEED A TRUCK
            </h2>
            <p className="text-[14px] text-white/70 leading-6 mt-1.5">
              Move agricultural produce, containers, FMCG or industrial equipment safely. Get instant competitive bids from verified truck owners with full escrow protection.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-white/80">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Bids in ~5 mins</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Escrow Till 031801</span>
            </div>
          </div>
        </div>

        <div className="pt-6 relative z-10">
          <button
            onClick={onOpenPostCargo}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
          >
            <span>Post Cargo - Free</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* CARD 2 - I HAVE A TRUCK (Transporter) */}
      <div className="bg-[#1a2a3f] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur relative overflow-hidden flex flex-col justify-between group hover:border-orange-500/50 transition-all">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-orange-400" />
              For Fleet Owners &amp; Drivers
            </span>
            <span className="text-[11px] font-semibold text-orange-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-orange-400 animate-pulse" />
              SafeBoda-Grade KYC
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              I HAVE A TRUCK
            </h2>
            <p className="text-[14px] text-white/70 leading-6 mt-1.5">
              Keep your truck moving every day. Upload your National ID, Truck Logbook &amp; Photo to get verified by Super Admin, bid on verified loads, and receive instant payouts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-white/80">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <Coins className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Direct MoMo / Bank Wire</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Carrier Trust</span>
            </div>
          </div>
        </div>

        <div className="pt-6 relative z-10">
          <button
            onClick={onOpenTransporterRegister}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm rounded-full shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
          >
            <span>Find Loads &amp; Bid</span>
            <Truck className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
};
