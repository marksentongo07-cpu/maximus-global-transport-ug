import React from 'react';
import { Bell, Truck, X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export type TooltipType = 'client_cargo_posted' | 'transporter_registered' | null;

interface TutorialTooltipProps {
  type: TooltipType;
  onClose: () => void;
  onAction?: () => void;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  type,
  onClose,
  onAction,
}) => {
  if (!type) return null;

  const isClient = type === 'client_cargo_posted';

  return (
    <div className="relative z-40 my-3 animate-fadeIn">
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
        isClient 
          ? 'bg-gradient-to-r from-blue-950/90 via-[#1a2a3f] to-slate-900 border-blue-500/50 shadow-blue-950/40' 
          : 'bg-gradient-to-r from-orange-950/90 via-[#1a2a3f] to-slate-900 border-orange-500/50 shadow-orange-950/40'
      }`}>
        
        {/* Left icon and message */}
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
            isClient 
              ? 'bg-blue-600 text-white' 
              : 'bg-orange-500 text-black'
          }`}>
            {isClient ? (
              <Bell className="w-6 h-6 animate-bounce" />
            ) : (
              <Truck className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isClient 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
              }`}>
                {isClient ? 'Cargo Broadcast Active' : 'Fleet Registration Active'}
              </span>
              <span className="text-[11px] text-white/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Tutorial Guide
              </span>
            </div>

            <p className="text-[15px] font-bold text-white mt-1 leading-snug">
              {isClient 
                ? 'Your cargo posted! Transporters will bid in 5 mins, check bell icon 🔔'
                : 'Welcome! 3 loads near you - tap to bid UGX price'}
            </p>
            <p className="text-[12px] text-white/70 mt-0.5">
              {isClient
                ? 'Real-time quotes are streaming into your Escrow negotiation hub.'
                : 'Bank-Grade verification: Submit bids while Super Admin verifies your uploaded URA Logbook & National ID.'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
          {onAction && (
            <button
              onClick={onAction}
              className={`px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                isClient
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-400 text-black'
              }`}
            >
              <span>{isClient ? 'Open Notifications 🔔' : 'Tap to Bid on Loads'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-slate-700/60 transition-colors"
            title="Dismiss guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
