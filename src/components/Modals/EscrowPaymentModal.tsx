import React, { useState } from 'react';
import { 
  Job, 
  Currency, 
  EscrowTransaction 
} from '../../types';
import { formatMoney } from '../../services/currency';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface EscrowPaymentModalProps {
  job: Job;
  currency: Currency;
  onClose: () => void;
  onPaymentSuccess: (transaction: EscrowTransaction) => void;
}

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({
  job,
  currency,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('+256 772 100 200');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');

  const agreedTotalUGX = job.agreedPriceUGX || job.marketPriceEstimateUGX;
  const adminFeeUGX = Math.round(agreedTotalUGX * 0.10);
  const transporterPayoutUGX = agreedTotalUGX - adminFeeUGX;

  const handleProcessPayment = () => {
    setPaymentStep('processing');

    setTimeout(() => {
      const newTransaction: EscrowTransaction = {
        id: 'esc-' + Date.now().toString().slice(-5),
        jobId: job.id,
        jobTitle: job.title,
        clientId: job.clientId,
        clientName: job.clientName,
        transporterId: job.assignedTransporterId || 'trans-001',
        transporterName: 'Assigned Transporter',
        totalAmountUGX: agreedTotalUGX,
        platformFeeUGX: adminFeeUGX,
        transporterPayoutUGX,
        status: 'held',
        paymentMethod: selectedMethod === 'MTN_MOMO' ? 'MTN MoMo Uganda' :
                       selectedMethod === 'AIRTEL_MONEY' ? 'Airtel Money Uganda' :
                       selectedMethod === 'FLUTTERWAVE' ? 'Flutterwave Gateway' :
                       selectedMethod === 'PESAPAL' ? 'Pesapal East Africa' :
                       selectedMethod === 'STRIPE' ? 'Stripe International Card' : 'Bank Wire Transfer',
        referenceNumber: 'ESC-MAX-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
      };

      setPaymentStep('success');
      setTimeout(() => {
        onPaymentSuccess(newTransaction);
      }, 1400);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Maximus Safe Escrow Checkout</h3>
              <p className="text-xs text-slate-400">Funds held securely in TrustVault until verified Vault Secured Delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentStep === 'processing' && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-white">Contacting {selectedMethod.replace('_', ' ')}...</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Please check your phone for the USSD approval prompt or authenticate your card secure 3D-Secure token.
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-white">Escrow Successfully Funded!</h4>
            <p className="text-xs text-slate-300">
              {formatMoney(agreedTotalUGX, currency)} is securely held in Maximus Escrow Trust. The transporter has been notified to commence loading.
            </p>
          </div>
        )}

        {paymentStep === 'details' && (
          <div className="p-5 space-y-5">
            
            {/* Shipment Summary */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-white line-clamp-1">{job.title}</div>
              <div className="flex justify-between text-slate-400">
                <span>Route:</span>
                <span className="text-slate-200">{job.pickupLocation.name.split(' ')[0]} → {job.deliveryLocation.name.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transporter Payout (90%):</span>
                <span className="font-semibold text-slate-200">{formatMoney(transporterPayoutUGX, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Escrow Fee (10%):</span>
                <span className="font-semibold text-slate-200">{formatMoney(adminFeeUGX, currency)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                <span>Total Escrow Deposit:</span>
                <span className="text-amber-400 text-base">{formatMoney(agreedTotalUGX, currency)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Select Global or Local Payment Gateway:</label>
              <div className="grid grid-cols-2 gap-2">
                
                <button
                  type="button"
                  onClick={() => setSelectedMethod('MTN_MOMO')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2.5 ${
                    selectedMethod === 'MTN_MOMO'
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">MTN MoMo</div>
                    <div className="text-[10px] text-slate-400">Uganda *165# Instant</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('AIRTEL_MONEY')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2.5 ${
                    selectedMethod === 'AIRTEL_MONEY'
                      ? 'bg-red-500/20 border-red-400 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Airtel Money</div>
                    <div className="text-[10px] text-slate-400">Uganda *185# Push</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('FLUTTERWAVE')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2.5 ${
                    selectedMethod === 'FLUTTERWAVE'
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Flutterwave</div>
                    <div className="text-[10px] text-slate-400">African Multi-Currency</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('STRIPE')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-start gap-2.5 ${
                    selectedMethod === 'STRIPE'
                      ? 'bg-indigo-500/20 border-indigo-400 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Stripe / Visa</div>
                    <div className="text-[10px] text-slate-400">Global Credit/Debit</div>
                  </div>
                </button>

              </div>
            </div>

            {/* Input Details */}
            {(selectedMethod === 'MTN_MOMO' || selectedMethod === 'AIRTEL_MONEY') && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registered Mobile Money Number:</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+256 7XX XXX XXX"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400">A push notification prompt will be sent to this line to authorize the escrow lock.</p>
              </div>
            )}

            {selectedMethod === 'STRIPE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Card Details:</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* Legal / Escrow Guarantee Notice */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-[11px] text-amber-300/90 leading-relaxed">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Maximus Escrow Guarantee:</strong> Payment is locked in trust. Transporter only gets paid once you sign the digital Proof of Delivery upon complete cargo inspection.
              </span>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleProcessPayment}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Deposit {formatMoney(agreedTotalUGX, currency)} into Escrow</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
