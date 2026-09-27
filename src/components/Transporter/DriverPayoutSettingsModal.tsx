import React, { useState } from 'react';
import { Transporter } from '../../types';
import { 
  Building2, 
  Smartphone, 
  X, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface DriverPayoutSettingsModalProps {
  transporter: Transporter;
  onClose: () => void;
  onSave: (payoutDetails: Transporter['payoutDetails']) => void;
}

export const DriverPayoutSettingsModal: React.FC<DriverPayoutSettingsModalProps> = ({
  transporter,
  onClose,
  onSave,
}) => {
  const current = transporter.payoutDetails || {
    mobileMoneyNumber: '+256 772 842 110',
    mobileMoneyNetwork: 'MTN',
    bankName: 'Equity Bank Uganda',
    bankAccountNumber: '1004829103948',
    accountName: transporter.name || 'Ronald Kato',
  };

  const [mobileMoneyNumber, setMobileMoneyNumber] = useState(current.mobileMoneyNumber);
  const [mobileMoneyNetwork, setMobileMoneyNetwork] = useState<'MTN' | 'AIRTEL'>(current.mobileMoneyNetwork || 'MTN');
  const [bankName, setBankName] = useState(current.bankName || 'Equity Bank Uganda');
  const [bankAccountNumber, setBankAccountNumber] = useState(current.bankAccountNumber || '');
  const [accountName, setAccountName] = useState(current.accountName || transporter.name);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      mobileMoneyNumber,
      mobileMoneyNetwork,
      bankName,
      bankAccountNumber,
      accountName,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-amber-950/40 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Driver Payout &amp; Banking Details</h3>
              <p className="text-xs text-slate-400">Configure where your trip escrow earnings are deposited</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Mobile Money Section (<= 4M UGX) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Mobile Money Account (For payouts ≤ 4,000,000 UGX):
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                Instant Payout
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Network Provider *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileMoneyNetwork('MTN')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      mobileMoneyNetwork === 'MTN'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileMoneyNetwork('AIRTEL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      mobileMoneyNetwork === 'AIRTEL'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Airtel Money</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Mobile Money Number *</label>
                <input
                  type="text"
                  required
                  value={mobileMoneyNumber}
                  onChange={(e) => setMobileMoneyNumber(e.target.value)}
                  placeholder="+256 772 000 000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Bank Transfer Section (> 4M UGX) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Bank Transfer Details (For payouts &gt; 4,000,000 UGX):
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                EFT / RTGS
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bank Name *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Equity Bank Uganda">Equity Bank Uganda</option>
                  <option value="Stanbic Bank Uganda">Stanbic Bank Uganda</option>
                  <option value="Centenary Bank Uganda">Centenary Bank Uganda</option>
                  <option value="Absa Bank Uganda">Absa Bank Uganda</option>
                  <option value="Standard Chartered Uganda">Standard Chartered Uganda</option>
                  <option value="DFCU Bank Uganda">DFCU Bank Uganda</option>
                  <option value="PostBank Uganda">PostBank Uganda</option>
                  <option value="Bank of Baroda Uganda">Bank of Baroda Uganda</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="e.g. 1004829103948"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Beneficiary Account Name *</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Ronald Kato Victoria Haulage"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Escrow Clearance Security Note */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-[11px] text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              All payouts are cleared through official Till 031801 escrow after Proof of Delivery confirmation by root admin marksentongo07@gmail.com.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccess ? 'Saved Details!' : 'Save Payout Details'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
