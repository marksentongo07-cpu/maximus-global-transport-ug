import React, { useRef, useState, useEffect } from 'react';
import { Job, Currency } from '../../types';
import { formatMoney } from '../../services/currency';
import { 
  CheckCircle2, 
  PenTool, 
  Trash2, 
  ShieldCheck, 
  Camera, 
  FileCheck, 
  X,
  Award,
  Sparkles
} from 'lucide-react';

interface ProofOfDeliveryModalProps {
  job: Job;
  currency: Currency;
  onClose: () => void;
  onConfirmDelivery: (podData: {
    recipientName: string;
    signatureDataUrl: string;
    confirmationNote: string;
  }) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  job,
  currency,
  onClose,
  onConfirmDelivery,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [recipientName, setRecipientName] = useState('Authorized Receiving Manager');
  const [notes, setNotes] = useState('Cargo inspected at terminal. Seal intact. No visible damage.');
  const [checklist, setChecklist] = useState({
    sealIntact: true,
    quantityVerified: true,
    conditionApproved: true,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL() : '';

    onConfirmDelivery({
      recipientName,
      signatureDataUrl,
      confirmationNote: notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Digital Proof of Delivery (POD)</h3>
              <p className="text-xs text-slate-400">Release escrow funds to transporter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Shipment details */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-white">{job.title}</div>
            <div className="text-slate-400">Destination: {job.deliveryLocation.name}</div>
            <div className="text-amber-400 font-semibold">
              Escrow Release Amount: {formatMoney(job.agreedPriceUGX ? job.agreedPriceUGX * 0.9 : 0, currency)} (Transporter Payout)
            </div>
          </div>

          {/* Inspection Checklist */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Cargo Inspection Checklist:</div>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.sealIntact}
                  onChange={(e) => setChecklist({ ...checklist, sealIntact: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-200">Security seals / locks intact upon offloading</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.quantityVerified}
                  onChange={(e) => setChecklist({ ...checklist, quantityVerified: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-200">Weight &amp; unit manifest tally verified ({job.weightTons} Tons)</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.conditionApproved}
                  onChange={(e) => setChecklist({ ...checklist, conditionApproved: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-200">No transit water damage or impact breakage</span>
              </label>
            </div>
          </div>

          {/* Recipient Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Recipient Name / Receiving Manager:</label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Digital Signature Pad */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-amber-400" />
                Recipient Touch/Mouse Signature:
              </span>
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>

            <div className="w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-700 p-1">
              <canvas
                ref={canvasRef}
                width={420}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[120px] bg-white rounded-lg cursor-crosshair touch-none"
              />
            </div>
            <div className="text-[10px] text-slate-400 text-center">
              Sign inside the white box above to authorize legal release of cargo and escrow funds.
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Arrival Notes &amp; Observations:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Bonus Points Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Transporter Reward:</span> Confirmed delivery triggers +150 Loyalty Points and Vault Secured Delivery Badge for this transporter!
            </div>
          </div>

          {/* Confirm Release Button */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm POD &amp; Release Escrow Payment</span>
          </button>

        </form>

      </div>
    </div>
  );
};
