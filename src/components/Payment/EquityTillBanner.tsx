import React, { useState } from 'react';
import { 
  Building2, 
  Copy, 
  Check, 
  Phone, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Coins
} from 'lucide-react';
import { formatMoney } from '../../services/currency';
import { Currency } from '../../types';

interface EquityTillBannerProps {
  amountUGX?: number;
  currency?: Currency;
  tripId?: string;
  isCompact?: boolean;
}

export const EquityTillBanner: React.FC<EquityTillBannerProps> = ({
  amountUGX = 1250000,
  currency = 'UGX',
  tripId = 'job-ug-101',
  isCompact = false,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8B0000] via-[#A30006] to-[#6E0000] text-white border-2 border-red-500/50 shadow-2xl shadow-red-950/60 p-4 sm:p-5">
      
      {/* Background Subtle Watermark Graphics */}
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 pointer-events-none opacity-10">
        <svg width="220" height="220" viewBox="0 0 100 100" fill="white">
          <polygon points="50,10 90,40 80,40 80,85 20,85 20,40 10,40" />
        </svg>
      </div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-400/40 pb-3">
        
        {/* Equity Brand & Title */}
        <div className="flex items-center gap-3">
          {/* Equity Bank Emblem */}
          <div className="w-11 h-11 rounded-xl bg-white flex flex-col items-center justify-center shadow-md shrink-0 p-1">
            <span className="text-[#A30006] font-black text-xs tracking-tighter leading-none">EQUITY</span>
            <div className="w-6 h-1 bg-[#A30006] rounded-full mt-0.5"></div>
            <span className="text-[7px] text-[#A30006] font-bold tracking-widest uppercase">BANK</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30">
                Official Merchant Payment
              </span>
              <span className="text-[10px] font-semibold text-red-200">
                Direct Settlement
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5 flex items-center gap-1.5">
              PAY WITH EQUITY TILL NUMBER
              <span className="underline decoration-amber-400 decoration-2">031801</span>
            </h3>
          </div>
        </div>

        {/* Till Pill & Locked Price */}
        <div className="flex items-center gap-2 sm:self-center">
          <div className="bg-black/30 border border-white/20 rounded-xl px-3 py-1.5 text-right">
            <span className="text-[9px] uppercase tracking-wider text-red-200 block font-semibold">
              Locked Trip Contract:
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
              1,250,000 UGX
            </span>
          </div>

          <button
            onClick={() => handleCopy('031801', 'till')}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 whitespace-nowrap"
            title="Click to copy till number 031801"
          >
            {copiedCode === 'till' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
                <span>Copied 031801!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Till: 031801</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 4 Step-by-Step Payment Methods */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs">
        
        {/* Method 1: Equity App */}
        <div className="bg-black/25 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 hover:border-amber-300/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Equity Mobile App</span>
            </div>
            <span className="text-[9px] font-bold text-red-200 bg-white/10 px-1.5 py-0.2 rounded">
              0% Fee
            </span>
          </div>
          <p className="text-[11px] text-white/95 leading-relaxed font-medium">
            Equity App <span className="text-amber-300 font-bold">&gt;</span> Log in <span className="text-amber-300 font-bold">&gt;</span> Pay for goods &amp; services <span className="text-amber-300 font-bold">&gt;</span> Enter <span className="font-extrabold text-amber-300 bg-black/40 px-1 py-0.2 rounded">031801</span> <span className="text-amber-300 font-bold">&gt;</span> Amount
          </p>
        </div>

        {/* Method 2: Equity USSD *247# */}
        <div className="bg-black/25 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 hover:border-amber-300/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>Equity USSD (*247#)</span>
            </div>
            <button
              onClick={() => handleCopy('*247#', 'ussd_equity')}
              className="text-[9px] font-bold text-amber-200 hover:text-white underline"
            >
              {copiedCode === 'ussd_equity' ? 'Copied *247#' : 'Dial *247#'}
            </button>
          </div>
          <p className="text-[11px] text-white/95 leading-relaxed font-medium">
            <span className="font-extrabold text-amber-300 bg-black/40 px-1 py-0.2 rounded">*247#</span> <span className="text-amber-300 font-bold">&gt;</span> Enter MPIN <span className="text-amber-300 font-bold">&gt;</span> Pay goods <span className="text-amber-300 font-bold">&gt;</span> Account <span className="text-amber-300 font-bold">&gt;</span> Equity Till No <span className="font-extrabold text-amber-300 bg-black/40 px-1 py-0.2 rounded">031801</span> <span className="text-amber-300 font-bold">&gt;</span> Amount
          </p>
        </div>

        {/* Method 3: MTN MoMo */}
        <div className="bg-black/25 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 hover:border-amber-300/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>MTN Mobile Money (*165*4*4#)</span>
            </div>
            <button
              onClick={() => handleCopy('*165*4*4#', 'ussd_mtn')}
              className="text-[9px] font-bold text-amber-200 hover:text-white underline"
            >
              {copiedCode === 'ussd_mtn' ? 'Copied *165*4*4#' : 'Dial *165*4*4#'}
            </button>
          </div>
          <p className="text-[11px] text-white/95 leading-relaxed font-medium">
            MTN: <span className="font-extrabold text-amber-300 bg-black/40 px-1 py-0.2 rounded">*165*4*4#</span> <span className="text-amber-300 font-bold">&gt;</span> Merchant Code <span className="font-bold text-amber-300 bg-black/40 px-1 py-0.2 rounded">(031801)</span> <span className="text-amber-300 font-bold">&gt;</span> Payment Reference <span className="text-amber-300 font-bold">&gt;</span> Amount
          </p>
        </div>

        {/* Method 4: Airtel Money */}
        <div className="bg-black/25 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 hover:border-amber-300/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>Airtel Money (*185*4*9#)</span>
            </div>
            <button
              onClick={() => handleCopy('*185*4*9#', 'ussd_airtel')}
              className="text-[9px] font-bold text-amber-200 hover:text-white underline"
            >
              {copiedCode === 'ussd_airtel' ? 'Copied *185*4*9#' : 'Dial *185*4*9#'}
            </button>
          </div>
          <p className="text-[11px] text-white/95 leading-relaxed font-medium">
            Airtel: <span className="font-extrabold text-amber-300 bg-black/40 px-1 py-0.2 rounded">*185*4*9#</span> <span className="text-amber-300 font-bold">&gt;</span> Business Name <span className="font-bold text-amber-300 bg-black/40 px-1 py-0.2 rounded">(031801)</span> <span className="text-amber-300 font-bold">&gt;</span> Amount <span className="text-amber-300 font-bold">&gt;</span> Reference No
          </p>
        </div>

      </div>

      {/* Footer Info Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-red-400/30 text-[10px] text-red-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Trip Reference: #{tripId} · Safe Escrow Direct Till Payment</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>Merchant Name: <strong>MAXIMUS LOGISTICS / EQUITY TILL</strong></span>
        </div>
      </div>

    </div>
  );
};
