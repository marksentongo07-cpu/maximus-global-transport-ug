import React, { useState } from 'react';
import { Transporter } from '../../types';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, UploadCloud, X } from 'lucide-react';

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Transporter KYC Verification Vault</h3>
              <p className="text-xs text-slate-400">{transporter.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-slate-400">Current KYC Compliance State:</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {transporter.kycStatus === 'verified' ? 'Fully Compliant & Approved' : 'Under Regulatory Review'}
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
              transporter.kycStatus === 'verified'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {transporter.kycStatus}
            </span>
          </div>

          {/* Three Mandatory Carrier Documents */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-300">Mandatory Statutory Documents:</div>
            
            {/* 1. Commercial Driving License */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Class CH / CM Commercial Heavy Driving Permit</div>
                  <div className="text-[10px] text-slate-400">Ministry of Works &amp; Transport / UDLS Verified</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>

            {/* 2. Vehicle Logbook */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Uganda Revenue Authority (URA) Vehicle Logbook</div>
                  <div className="text-[10px] text-slate-400">Chassis &amp; Engine Match Certificate</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>

            {/* 3. Commercial Carrier Insurance */}
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Commercial Carrier Third-Party &amp; Goods-In-Transit (GIT)</div>
                  <div className="text-[10px] text-slate-400">Policy active until 31 Dec 2026</div>
                </div>
              </div>
              {transporter.kycDocs.commercialInsurance ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active</span>
                </div>
              ) : (
                <span className="text-amber-400 font-bold text-[11px]">Pending Renew</span>
              )}
            </div>

          </div>

          {/* Admin Toggle Options */}
          {isAdmin && onUpdateStatus && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="font-semibold text-slate-300">Management Action:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onUpdateStatus(transporter.id, 'verified');
                    onClose();
                  }}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                >
                  Approve Transporter KYC
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus(transporter.id, 'rejected');
                    onClose();
                  }}
                  className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors"
                >
                  Reject &amp; Request Re-upload
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
