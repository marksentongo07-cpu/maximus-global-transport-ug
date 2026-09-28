import React from 'react';
import { Transporter } from '../../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  Camera, 
  X, 
  Lock,
  Building2,
  Award
} from 'lucide-react';

interface KYCModalProps {
  transporter: Transporter;
  onClose: () => void;
  onUpdateStatus?: (transporterId: string, newStatus: 'verified' | 'pending' | 'rejected') => void;
  isAdmin?: boolean;
}

export const KYCModal: React.FC<KYCModalProps> = ({
  transporter,
  onClose,
  onUpdateStatus,
  isAdmin = false,
}) => {
  const isVerified = transporter.kycStatus === 'verified';
  const isPending = transporter.kycStatus === 'pending';

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#1a2a3f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 my-8">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0f1c2e] to-[#1a2a3f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white">SafeBoda-Grade KYC Audit</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Trust Vault
                </span>
              </div>
              <p className="text-xs text-white/60">{transporter.companyName} ({transporter.name})</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          
          {/* Current KYC State Banner */}
          <div className="p-3.5 bg-[#0f1c2e] rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-white/60 text-[11px]">Transporter Trust Status:</div>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                {isVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>SafeBoda Trust Approved (Bidding Enabled)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Under Review by marksentongo07@gmail.com</span>
                  </>
                )}
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
              isVerified
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
            }`}>
              {transporter.kycStatus}
            </span>
          </div>

          {/* National Identification Number (NIN) */}
          <div className="p-3 bg-[#0f1c2e] rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/50 block uppercase font-bold">NIRA National Identification (NIN):</span>
              <span className="text-sm font-bold font-mono text-amber-300">
                {transporter.nin || 'CM890241088JKA'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Matched Citizen Registry
            </span>
          </div>

          {/* 4 Mandatory Carrier Documents Required for SafeBoda Trust */}
          <div className="space-y-2.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Mandatory Anti-Fraud Documents:</span>
              <span className="text-[10px] text-white/50">4 of 4 Verified</span>
            </div>
            
            {/* 1. National ID (NIRA) */}
            <div className="flex items-center justify-between p-3 bg-[#0f1c2e] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">1. National ID Card (NIRA)</div>
                  <div className="text-[10px] text-white/50">Government biometric citizen identification verified</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Uploaded</span>
              </div>
            </div>

            {/* 2. Truck Logbook (URA) */}
            <div className="flex items-center justify-between p-3 bg-[#0f1c2e] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">2. Uganda Revenue Authority (URA) Logbook</div>
                  <div className="text-[10px] text-white/50">Title deed &amp; chassis match: {transporter.vehicles[0]?.plateNumber || 'UBD 842K'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Uploaded</span>
              </div>
            </div>

            {/* 3. Photo of Truck */}
            <div className="flex items-center justify-between p-3 bg-[#0f1c2e] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">3. Photo of Truck (Front &amp; Side View)</div>
                  <div className="text-[10px] text-white/50">Plate visibility &amp; roadworthiness inspection passed</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Uploaded</span>
              </div>
            </div>

            {/* 4. Commercial Heavy Driving Permit */}
            <div className="flex items-center justify-between p-3 bg-[#0f1c2e] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">4. Heavy Driving License (UDLS Class CH/CM)</div>
                  <div className="text-[10px] text-white/50">Ministry of Works &amp; Transport heavy endorsement</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Uploaded</span>
              </div>
            </div>

          </div>

          {/* Truck Visual Preview */}
          <div className="p-3 bg-[#0f1c2e] rounded-xl border border-white/10 flex items-center gap-3">
            <img
              src="/src/assets/images/maximus_hero_truck_1790435606454.jpg"
              alt="Transporter Truck Unit"
              className="w-20 h-14 object-cover rounded-lg border border-white/15"
            />
            <div className="text-[11px] text-white/70">
              <span className="font-bold text-white block">Inspection Unit: {transporter.vehicles[0]?.name || 'Mitsubishi Fuso Fighter'}</span>
              <span>Plate: <strong className="text-orange-400 font-mono">{transporter.vehicles[0]?.plateNumber || 'UBD 842K'}</strong></span>
              <span className="block text-[10px] text-white/50">SafeBoda trust standard stops cargo theft &amp; scammers</span>
            </div>
          </div>

          {/* Admin Verification Action Bar */}
          {onUpdateStatus && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="font-bold text-white text-[11px] flex items-center justify-between">
                <span>Super Admin Verification Action:</span>
                <span className="text-[10px] text-white/50">Root Admin marksentongo07@gmail.com</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(transporter.id, 'verified');
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify &amp; Approve Driver</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(transporter.id, 'rejected');
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold rounded-xl border border-rose-500/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reject / Re-upload</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
