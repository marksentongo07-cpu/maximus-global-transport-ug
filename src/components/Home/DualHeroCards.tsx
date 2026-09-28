import React from 'react';
import { 
  Package, 
  Truck, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  Navigation, 
  Sparkles,
  FileCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Currency } from '../../types';
import { formatMoney } from '../../services/currency';

interface DualHeroCardsProps {
  currency: Currency;
  onPostCargoClick: () => void;
  onFindLoadsClick: () => void;
}

export const DualHeroCards: React.FC<DualHeroCardsProps> = ({
  currency,
  onPostCargoClick,
  onFindLoadsClick,
}) => {
  return (
    <div className="w-full">
      {/* 2 Big Cards Side-by-Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
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
              <p className="text-[14px] text-white/70 leading-6 mt-1.5">
                Ship cargo anywhere across Uganda &amp; East Africa. Receive verified transporter bids within 5 minutes with guaranteed escrow protection.
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
                <div className="text-[11px] text-white/50 uppercase font-semibold">SafeBoda Trust</div>
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
            <p className="text-[11px] text-white/50 text-center mt-2">
              Enter pickup, drop, weight &amp; price to broadcast instantly to nearby truckers.
            </p>
          </div>
        </div>

        {/* CARD 2: I HAVE A TRUCK (Transporter) */}
        <div className="group relative bg-[#1a2a3f] border border-white/10 hover:border-orange-500/50 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur flex flex-col justify-between transition-all duration-300 overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-orange-500/20 transition-all" />
          
          <div className="relative z-10 space-y-4">
            {/* Top Badge & Identifier */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Truck className="w-3.5 h-3.5 text-orange-400" />
                <span>Card 2 · Transporter &amp; Fleet</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                SafeBoda-Grade KYC
              </span>
            </div>

            {/* Card Title & Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>I HAVE A TRUCK</span>
              </h2>
              <p className="text-[14px] text-white/70 leading-6 mt-1.5">
                Keep your trucks moving. Bid on active freight loads across Uganda, get instant escrow protection, and guaranteed payouts to your Mobile Money or Bank.
              </p>
            </div>

            {/* Key Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Active Loads</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-orange-400" />
                  3+ Loads Near You
                </div>
              </div>

              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Safe Settlement</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  Till 031801
                </div>
              </div>

              <div className="bg-[#0f1c2e]/80 border border-white/5 rounded-xl p-2.5">
                <div className="text-[11px] text-white/50 uppercase font-semibold">Verification</div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                  ID + Logbook
                </div>
              </div>
            </div>
          </div>

          {/* Action Button Area */}
          <div className="relative z-10 pt-6 mt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onFindLoadsClick}
              className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-400 active:scale-[0.99] text-black font-extrabold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2.5 text-base transition-all group-hover:shadow-orange-500/40"
            >
              <Truck className="w-5 h-5 text-black" />
              <span>Find Loads &amp; Bid</span>
              <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-white/50 text-center mt-2">
              Register truck type, number plate &amp; NIN with SafeBoda KYC to unlock bidding.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
