import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, Lock, X } from 'lucide-react';

interface LegalDisclaimerModalProps {
  onClose: () => void;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">MAXIMUS Terms &amp; Legal Framework</h3>
              <p className="text-xs text-slate-400">Governance, Escrow Trust &amp; Liability Clauses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
          
          {/* Core Mandated Limitation of Liability Clause */}
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl space-y-2 text-amber-200">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Section 7: Limitation of Liability Clause (Mandatory)</span>
            </div>
            <p className="font-semibold text-xs leading-normal">
              &ldquo;Maximus is a linking platform only. We are not liable for damages, loss, accidents, delays, or disputes that occur between client and transporter. Transport is executed under agreement between the two parties. Users are advised to have cargo insurance.&rdquo;
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Data Security &amp; Financial Privacy
            </h4>
            <p>
              In accordance with Ugandan and international electronic commerce protocols, all financial data, bank account numbers, mobile money transaction tokens, and ledger balances are cryptographically protected. Sensitive financial details are strictly restricted and ONLY visible to authorized management personnel (Super Admin role).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Transporter KYC &amp; Regulatory Compliance
            </h4>
            <p>
              All commercial fleet operators and independent drivers must maintain valid Ministry of Works and Transport documentation, valid driving licenses, commercial carrier third-party or comprehensive insurance, and up-to-date logbooks before dispatch.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Escrow Protocol &amp; Dispute Resolution</h4>
            <p>
              Payments deposited into Maximus Escrow are held under trust. Transporter payout (less the 10% platform facilitation fee) is released only upon client digital signature verification or certified Proof of Delivery. Disputed shipments are subject to binding review by the Maximus Arbitration Center.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            I Acknowledge &amp; Accept
          </button>
        </div>

      </div>
    </div>
  );
};
