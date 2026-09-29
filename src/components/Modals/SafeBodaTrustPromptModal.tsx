import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  FileText, 
  CreditCard, 
  Camera, 
  UserCheck 
} from 'lucide-react';
import { Transporter } from '../../types';

interface SafeBodaTrustPromptModalProps {
  transporter: Transporter;
  onClose: () => void;
  onSwitchToAdminVerify: () => void;
  onFastTrackApprove: () => void;
}

export const SafeBodaTrustPromptModal: React.FC<SafeBodaTrustPromptModalProps> = ({
  transporter,
  onClose,
  onSwitchToAdminVerify,
  onFastTrackApprove,
}) => {
  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#1a2a3f] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#241a0d] to-[#1a2a3f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white">Bank-Grade Trust Verification</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-[#b388ff] border border-purple-500/40">
                  Required
                </span>
              </div>
              <p className="text-xs text-white/60">Verification in Admin tab required before you can bid.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          
          <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1.5">
            <div className="font-bold text-[#b388ff] text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>KYC Verification Pending for {transporter.name}</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-[12px]">
              With Bank-Grade Enterprise Verification, Maximus enforces 100% statutory driver &amp; fleet vetting before any bids can be placed. This stops scammers, prevents freight hijackings, and guarantees high client trust.
            </p>
          </div>

          {/* Checklist of Uploaded Documents */}
          <div className="space-y-2 bg-[#0f1c2e] p-3.5 rounded-xl border border-white/10">
            <div className="font-bold text-white text-[11px] mb-2 flex items-center justify-between">
              <span>Submitted Trust Documents:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Uploaded &amp; Waiting Review
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-white/80">
                <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">NIN: {transporter.nin || 'CM890241088JKA'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">URA Logbook</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Camera className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Truck Photo ({transporter.vehicles[0]?.plateNumber || 'UBD 842K'})</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate">Class CH/CM Permit</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onSwitchToAdminVerify}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-400 active:scale-[0.99] text-black font-extrabold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-xs transition-all"
            >
              <UserCheck className="w-4 h-4 text-black" />
              <span>Verify in Admin Tab as Super Admin</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              type="button"
              onClick={onFastTrackApprove}
              className="w-full py-2.5 px-4 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 text-xs transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Fast-Track Immediate Approval (Investor Demo Mode)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-white/60 hover:text-white transition-colors"
            >
              Cancel &amp; Return to Load Board
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
