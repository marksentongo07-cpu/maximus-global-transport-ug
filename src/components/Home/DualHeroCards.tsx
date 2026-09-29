import React from 'react';
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
                Ship cargo anywhere across Uganda &amp; East Africa. Receive verified transporter bids within 5 minutes with guaranteed TrustVault protection.
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
            <p className="text-[11px] text-white/50 text-center mt-2">
              Enter pickup, drop, weight &amp; price to broadcast instantly to nearby truckers.
            </p>
          </div>
        </div>

        {/* CARD 2: FLEET PARTNER (Transporter) */}
        <div 
          className="group relative rounded-2xl p-6 sm:p-7 backdrop-blur flex flex-col justify-between transition-all duration-300 overflow-hidden bg-gradient-to-br from-[#0A1931] via-[#0D1E3A] to-[#121824] border border-[rgba(201,168,106,0.2)] hover:border-[rgba(201,168,106,0.4)]"
          style={{
            boxShadow: '0 8px 32px rgba(106,13,173,0.12)',
          }}
        >
          {/* Subtle Ambient Background Gradient with Purple & Gold Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6A0DAD]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-[#6A0DAD]/20 transition-all" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A86A]/5 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

          <div className="relative z-10 space-y-4">
            {/* Top Badges */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0A1931] text-[#C9A86A] border border-[#C9A86A]/30 shadow-sm">
                <Container className="w-3.5 h-3.5 text-[#C9A86A]" />
                <span>FLEET PARTNER</span>
              </span>

              <span className="text-[11px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(106,13,173,0.15)] text-[#b388ff] border border-[#6A0DAD]/40 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6A0DAD] animate-pulse"></span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#b388ff]" />
                <span>Bank-Grade KYC</span>
              </span>
            </div>

            {/* Card Title & Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-[800] text-[#F8FAFC] tracking-[1px] flex items-center gap-2">
                <span>I HAVE A TRUCK</span>
              </h2>
              <p className="text-[14px] text-white/80 leading-6 mt-1.5 font-normal">
                Keep your fleet earning. Bid on verified freight across Uganda - Mombasa to Gulu - secured by TrustVault, with guaranteed settlement to Mobile Money or Bank. From saloon to 40ft container.
              </p>
            </div>

            {/* Bottom 3 Tabs: LIVE LOADS | TrustVault SETTLEMENT | VERIFIED ID - with purple underline active state */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="bg-[#0A1931]/90 border border-white/5 rounded-xl p-3 relative group/tab hover:border-[#6A0DAD]/40 transition-colors">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C9A86A] flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#C9A86A]" />
                  <span>LIVE LOADS</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  12+ Active Corridors
                </div>
                {/* Purple underline active state */}
                <div className="mt-2.5 h-[2px] w-full bg-[#6A0DAD] rounded-full shadow-[0_0_8px_rgba(106,13,173,0.6)]"></div>
              </div>

              <div className="bg-[#0A1931]/90 border border-white/5 rounded-xl p-3 relative group/tab hover:border-[#6A0DAD]/40 transition-colors">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C9A86A] flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#C9A86A]" />
                  <span>TrustVault SETTLEMENT</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  Guaranteed Payout
                </div>
                {/* Purple underline active state */}
                <div className="mt-2.5 h-[2px] w-full bg-[#6A0DAD] rounded-full shadow-[0_0_8px_rgba(106,13,173,0.6)]"></div>
              </div>

              <div className="bg-[#0A1931]/90 border border-white/5 rounded-xl p-3 relative group/tab hover:border-[#6A0DAD]/40 transition-colors">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C9A86A] flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-[#C9A86A]" />
                  <span>VERIFIED ID</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  Logbook + NIN
                </div>
                {/* Purple underline active state */}
                <div className="mt-2.5 h-[2px] w-full bg-[#6A0DAD] rounded-full shadow-[0_0_8px_rgba(106,13,173,0.6)]"></div>
              </div>
            </div>
          </div>

          {/* Action Button Area */}
          <div className="relative z-10 pt-6 mt-4 border-t border-[rgba(201,168,106,0.15)]">
            <button
              type="button"
              onClick={onFindLoadsClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#C9A86A] via-[#dfba73] to-[#C9A86A] hover:brightness-105 active:scale-[0.99] text-[#0A1931] font-[800] rounded-xl shadow-lg shadow-[#C9A86A]/20 flex items-center justify-center gap-2.5 text-base transition-all group-hover:shadow-[0_4px_24px_rgba(106,13,173,0.25)]"
            >
              <Container className="w-5 h-5 text-[#0A1931]" />
              <span>Find Loads &amp; Bid</span>
              <ArrowRight className="w-5 h-5 text-[#0A1931] group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-white/60 text-center mt-2">
              From saloon cars to 40ft container haulers — verified with Bank-Grade KYC.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
