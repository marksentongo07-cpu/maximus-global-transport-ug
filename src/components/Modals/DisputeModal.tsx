import React, { useState } from 'react';
import { Job, Dispute, UserRole, Currency } from '../../types';
import { formatMoney } from '../../services/currency';
import { AlertTriangle, ShieldAlert, CheckCircle, Scale, X, UploadCloud } from 'lucide-react';

interface DisputeModalProps {
  job?: Job | null;
  dispute?: Dispute | null;
  currentRole: UserRole;
  currency: Currency;
  onClose: () => void;
  onCreateDispute?: (newDispute: Dispute) => void;
  onResolveDispute?: (disputeId: string, resolution: 'refund_client' | 'pay_transporter', notes: string) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  job,
  dispute,
  currentRole,
  currency,
  onClose,
  onCreateDispute,
  onResolveDispute,
}) => {
  const [reason, setReason] = useState<Dispute['reason']>('Cargo Damage');
  const [description, setDescription] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const isExisting = !!dispute;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !onCreateDispute) return;

    const newDisp: Dispute = {
      id: 'disp-' + Date.now().toString().slice(-4),
      jobId: job.id,
      jobTitle: job.title,
      openedBy: currentRole === 'client' ? 'client' : 'transporter',
      openerName: currentRole === 'client' ? job.clientName : 'Transporter',
      reason,
      description,
      evidenceUrls: job.photoUrl ? [job.photoUrl] : [],
      status: 'open',
      amountAtStakeUGX: job.agreedPriceUGX || job.marketPriceEstimateUGX,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    onCreateDispute(newDisp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isExisting ? 'Dispute Arbitration Review' : 'Open Shipment Dispute'}
              </h3>
              <p className="text-xs text-slate-400">Maximus Independent Mediation Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isExisting && dispute ? (
          /* Dispute Details & Super Admin Arbitration */
          <div className="p-5 space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Dispute #{dispute.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  dispute.status === 'open' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {dispute.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-slate-300 font-semibold">{dispute.jobTitle}</div>
              <div className="text-slate-400">Filed by: {dispute.openerName} ({dispute.openedBy})</div>
              <div className="text-amber-400 font-bold">
                Escrow at Stake: {formatMoney(dispute.amountAtStakeUGX, currency)}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-300">Grounds / Claim:</span>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 mt-1 text-slate-200">
                <div className="font-semibold text-rose-300 mb-1">{dispute.reason}</div>
                <p className="leading-relaxed">{dispute.description}</p>
              </div>
            </div>

            {/* If Super Admin, show Arbitration actions */}
            {currentRole === 'admin' && dispute.status === 'open' && onResolveDispute && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>Super Admin Arbitration Ruling:</span>
                </div>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="State official binding arbitration findings and reason for resolution..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onResolveDispute(dispute.id, 'refund_client', adminNotes)}
                    className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors text-center"
                  >
                    Refund Escrow to Client
                  </button>
                  <button
                    onClick={() => onResolveDispute(dispute.id, 'pay_transporter', adminNotes)}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-center"
                  >
                    Release Payout to Transporter
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Form to file a new dispute */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Shipment Affected:</label>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-bold text-white">
                {job?.title || 'Selected Cargo Shipment'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Dispute Reason:</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as Dispute['reason'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Cargo Damage">Cargo Damage / Rain Exposure</option>
                <option value="Severe Delay">Severe Unexcused Transit Delay</option>
                <option value="Cargo Discrepancy">Cargo Discrepancy / Tally Shortage</option>
                <option value="Vehicle Breakdown">Vehicle Breakdown Without Substitute</option>
                <option value="Payment Issue">Payment / Tariff Dispute</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Detailed Statement of Incident:</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="State clearly what transpired, timestamps, and losses incurred..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300/90 text-[11px] leading-relaxed">
              Filing a dispute temporarily freezes the escrow release. The Maximus Super Admin arbitration team will review GPS telemetry and cargo manifests within 24 hours.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Submit Dispute to Maximus Arbitration
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
