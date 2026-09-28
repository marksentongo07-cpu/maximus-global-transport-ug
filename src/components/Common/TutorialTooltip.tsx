import React, { useEffect } from 'react';
import { Bell, Truck, X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface TutorialTooltipData {
  type: 'client' | 'transporter';
  message: string;
  actionText?: string;
  onAction?: () => void;
}

interface TutorialTooltipProps {
  data: TutorialTooltipData | null;
  onClose: () => void;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  data,
  onClose,
}) => {
  useEffect(() => {
    if (!data) return;
    // Auto-dismiss after 18 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 18000);
    return () => clearTimeout(timer);
  }, [data, onClose]);

  if (!data) return null;

  const isClient = data.type === 'client';

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[250] w-[92vw] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300">
      <div 
        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md border ${
          isClient 
            ? 'bg-[#0f2438]/95 border-blue-400/50 shadow-blue-500/20 text-white' 
            : 'bg-[#261d12]/95 border-orange-400/60 shadow-orange-500/20 text-white'
        }`}
      >
        {/* Glow ambient accent */}
        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
          isClient ? 'bg-blue-500/30' : 'bg-orange-500/30'
        }`} />

        <div className="relative z-10 flex items-start gap-3.5">
          {/* Animated Icon Avatar */}
          <div className={`p-2.5 rounded-xl shrink-0 shadow-lg ${
            isClient 
              ? 'bg-blue-500 text-white animate-pulse' 
              : 'bg-orange-500 text-slate-950 animate-bounce'
          }`}>
            {isClient ? <Bell className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
              <span className={`px-2 py-0.5 rounded-full ${
                isClient ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
              }`}>
                {isClient ? 'Shipper Tutorial' : 'Driver Onboarding Tutorial'}
              </span>
              <span className="text-white/60">· Next Step</span>
            </div>

            <p className="text-[15px] font-bold text-white mt-1.5 leading-snug">
              {data.message}
            </p>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2 mt-3">
              {data.onAction && data.actionText && (
                <button
                  type="button"
                  onClick={() => {
                    data.onAction?.();
                    onClose();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
                    isClient 
                      ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                      : 'bg-orange-500 hover:bg-orange-400 text-black'
                  }`}
                >
                  <span>{data.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom subtle progress line */}
        <div className={`mt-3 h-0.5 rounded-full ${isClient ? 'bg-blue-400/40' : 'bg-orange-400/40'}`} />
      </div>
    </div>
  );
};
