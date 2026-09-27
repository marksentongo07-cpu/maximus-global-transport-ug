import React, { useState } from 'react';
import { 
  Job, 
  Transporter, 
  Currency 
} from '../../types';
import { formatMoney } from '../../services/currency';
import { 
  ShieldCheck, 
  X, 
  Smartphone, 
  Building2, 
  Upload, 
  CheckCircle2, 
  Copy, 
  Check, 
  DollarSign, 
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  Percent,
  Receipt
} from 'lucide-react';

interface AdminDriverPayoutModalProps {
  job: Job;
  transporter?: Transporter;
  currency: Currency;
  adminEmail: string;
  onClose: () => void;
  onConfirmPayout: (jobId: string, payoutData: {
    method: 'MOBILE_MONEY' | 'BANK_TRANSFER';
    amountUGX: number;
    recipientName: string;
    recipientPhoneOrAccount: string;
    networkOrBank: string;
    proofUrl?: string;
    proofReference: string;
    notes?: string;
  }) => void;
}

export const AdminDriverPayoutModal: React.FC<AdminDriverPayoutModalProps> = ({
  job,
  transporter,
  currency,
  adminEmail = 'marksentongo07@gmail.com',
  onClose,
  onConfirmPayout,
}) => {
  const agreedPrice = job.agreedPriceUGX || job.marketPriceEstimateUGX || 1250000;
  
  // Tiered commission: 15% single shipment, 10% bulk shipment
  const isBulk = job.shipmentType === 'bulk' || (job.weightTons >= 20);
  const commissionRate = isBulk ? 10 : 15;
  const commissionFeeUGX = Math.round(agreedPrice * (commissionRate / 100));
  const driverPayoutAmountUGX = agreedPrice - commissionFeeUGX;

  // Rule: <= 4,000,000 UGX -> Mobile Money; > 4,000,000 UGX -> Bank Transfer
  const isMobileMoney = driverPayoutAmountUGX <= 4000000;
  const payoutMethod = isMobileMoney ? 'MOBILE_MONEY' : 'BANK_TRANSFER';

  // Driver payout details fallback
  const driverPayoutDetails = transporter?.payoutDetails || {
    mobileMoneyNumber: '+256 772 842 110',
    mobileMoneyNetwork: 'MTN' as const,
    bankName: 'Equity Bank Uganda',
    bankAccountNumber: '1004829103948',
    accountName: transporter?.name ? `${transporter.name} / ${transporter.companyName}` : 'Ronald Kato Victoria Haulage',
  };

  // Form states
  const [proofReference, setProofReference] = useState<string>(
    isMobileMoney 
      ? `MM-${driverPayoutDetails.mobileMoneyNetwork}-${Date.now().toString().slice(-6)}`
      : `EFT-${driverPayoutDetails.bankName.split(' ')[0].toUpperCase()}-${Date.now().toString().slice(-6)}`
  );
  const [proofFileUploaded, setProofFileUploaded] = useState(false);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string>('/src/assets/images/cargo_loading_depot_1790435648670.jpg');
  const [adminNotes, setAdminNotes] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFileName(file.name);
      setProofFileUploaded(true);
      const fakeUrl = URL.createObjectURL(file);
      setProofUrl(fakeUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onConfirmPayout(job.id, {
        method: payoutMethod,
        amountUGX: driverPayoutAmountUGX,
        recipientName: driverPayoutDetails.accountName || transporter?.name || 'Driver',
        recipientPhoneOrAccount: isMobileMoney ? driverPayoutDetails.mobileMoneyNumber : driverPayoutDetails.bankAccountNumber,
        networkOrBank: isMobileMoney ? driverPayoutDetails.mobileMoneyNetwork : driverPayoutDetails.bankName,
        proofUrl,
        proofReference,
        notes: adminNotes || `Admin payout confirmed by ${adminEmail}. Till 031801 escrow released.`,
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-amber-950/40 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Super Admin Payout Portal
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  By {adminEmail}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Driver Payout Authorization · #{job.id}
              </h3>
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
          
          {/* Trip Summary & POD Approval Indicator */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trip Details</span>
                <h4 className="text-sm font-bold text-white">{job.title}</h4>
                <div className="text-xs text-slate-400">
                  Carrier: <strong className="text-amber-400">{transporter?.companyName || job.clientName}</strong> ({transporter?.name || 'Driver'})
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>POD Confirmed by {adminEmail}</span>
              </div>
            </div>

            {/* Proof of Delivery Details Snapshot */}
            {job.proofOfDelivery && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <div className="text-slate-300">
                  <strong>Receiver:</strong> {job.proofOfDelivery.recipientName} · <strong>Timestamp:</strong> {job.proofOfDelivery.timestamp}
                </div>
                {job.proofOfDelivery.confirmationNote && (
                  <div className="text-slate-400 italic">
                    "{job.proofOfDelivery.confirmationNote}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tiered Commission Breakdown (15% Single vs 10% Bulk) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-400" />
                Tiered Commission Breakdown:
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                isBulk 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {isBulk ? 'Bulk Rate (10%)' : 'Single Shipment (15%)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Agreed Trip Amount:</span>
                <span className="font-extrabold text-white text-sm font-mono">
                  {formatMoney(agreedPrice, currency)}
                </span>
                <span className="text-[9px] text-slate-500 block">In Till 031801 Escrow</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  Maximus Commission ({commissionRate}%):
                </span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">
                  {formatMoney(commissionFeeUGX, currency)}
                </span>
                <span className="text-[9px] text-slate-500 block">Retained by Platform</span>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-amber-400 font-bold block">
                  Net Driver Payout:
                </span>
                <span className="font-black text-amber-300 text-base font-mono">
                  {formatMoney(driverPayoutAmountUGX, currency)}
                </span>
                <span className="text-[9px] text-amber-200/80 block">Payable to Carrier</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC PAYOUT CHANNEL CONTAINER: MOBILE MONEY (<=4M) vs BANK TRANSFER (>4M) */}
          <div className={`p-4 rounded-2xl border-2 space-y-3 ${
            isMobileMoney 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-indigo-950/20 border-indigo-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl text-slate-950 font-bold ${
                  isMobileMoney ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}>
                  {isMobileMoney ? <Smartphone className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    {isMobileMoney ? 'Pay via Mobile Money' : 'Pay via Bank Transfer'}
                    <span className="text-[10px] font-normal px-2 py-0.2 rounded bg-black/40 text-slate-300">
                      {isMobileMoney ? 'Amount ≤ 4,000,000 UGX Threshold' : 'Amount > 4,000,000 UGX Threshold'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {isMobileMoney 
                      ? 'Instant mobile money disbursement directly to driver verified SIM.' 
                      : 'High-value wire / EFT clearing directly to driver institutional bank account.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              
              {isMobileMoney ? (
                /* Mobile Money Details */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mobile Money Network:</span>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          driverPayoutDetails.mobileMoneyNetwork === 'MTN' ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        {driverPayoutDetails.mobileMoneyNetwork} Mobile Money Uganda
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(driverPayoutDetails.mobileMoneyNumber, 'mm')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700 font-semibold"
                    >
                      {copiedField === 'mm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'mm' ? 'Copied' : 'Copy Number'}</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Driver Phone / MM Number:</span>
                    <span className="font-mono font-black text-amber-300 text-base">
                      {driverPayoutDetails.mobileMoneyNumber}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    Registered Name on Line: <strong className="text-slate-200">{driverPayoutDetails.accountName || transporter?.name}</strong>
                  </div>
                </div>
              ) : (
                /* Bank Transfer Details */
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Beneficiary Bank:</span>
                      <span className="font-bold text-white text-sm">
                        {driverPayoutDetails.bankName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(driverPayoutDetails.bankAccountNumber, 'acc')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700 font-semibold"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'acc' ? 'Copied' : 'Copy Account'}</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Bank Account Number:</span>
                    <span className="font-mono font-black text-indigo-300 text-base">
                      {driverPayoutDetails.bankAccountNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Account Name:</span>
                    <span className="font-bold text-white">
                      {driverPayoutDetails.accountName}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ADMIN PAYMENT PROOF UPLOAD & TRANSACTION REFERENCE */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-400" />
              Payment Proof &amp; Transaction Verification:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Transaction Reference / MoMo ID / EFT Ref <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={proofReference}
                  onChange={(e) => setProofReference(e.target.value)}
                  placeholder="e.g. MOMO-UG-883921 or EFT-2026-092"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Attach Payment Proof / Bank Slip / MoMo SMS Screenshot
                </label>
                <label className="flex items-center justify-center gap-2 p-2 bg-slate-900 border border-dashed border-slate-700 hover:border-amber-400 rounded-xl cursor-pointer transition-colors text-slate-300">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="truncate max-w-[180px]">
                    {proofFileName || (proofFileUploaded ? 'Proof Attached' : 'Upload Receipt / Slip')}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSimulateUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Admin Notes (Optional audit comment)
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Verified via Equity Till 031801 merchant settlement. Released to driver."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
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
              disabled={isSubmitting || !proofReference}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                isMobileMoney
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Processing Settlement...' : `Confirm & Release ${formatMoney(driverPayoutAmountUGX, currency)}`}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
