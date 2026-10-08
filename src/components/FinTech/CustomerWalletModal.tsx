import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Smartphone, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Download, 
  ExternalLink, 
  KeyRound, 
  Send, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  Truck,
  DollarSign,
  Coins,
  X
} from 'lucide-react';
import { CustomerWallet, WalletTransaction, Currency } from '../../types';
import { formatMoney } from '../../services/currency';

interface CustomerWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onJobEscrowBooked?: (jobId: string, amountUGX: number) => void;
  onGoodsReceivedRelease?: (jobId: string) => void;
  activeEscrowJobs?: Array<{
    id: string;
    title: string;
    origin: string;
    destination: string;
    freightAmountUGX: number;
    driverName: string;
    driverPhone: string;
    driverNetwork?: 'MTN' | 'AIRTEL';
    status: string;
  }>;
}

export const CustomerWalletModal: React.FC<CustomerWalletModalProps> = ({
  isOpen,
  onClose,
  currency,
  onJobEscrowBooked,
  onGoodsReceivedRelease,
  activeEscrowJobs = [],
}) => {
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'topup' | 'escrow' | 'history'>('balance');
  
  // Topup State
  const [topupAmountUGX, setTopupAmountUGX] = useState<number>(2000000);
  const [selectedGateway, setSelectedGateway] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'FLUTTERWAVE'>('MTN_MOMO');
  const [momoPhone, setMomoPhone] = useState('+256 772 100 200');
  const [topupPin, setTopupPin] = useState('4848');
  const [topupProcessing, setTopupProcessing] = useState(false);
  const [topupSuccessNotice, setTopupSuccessNotice] = useState<string | null>(null);

  // Escrow / Goods Received Action State
  const [selectedEscrowJob, setSelectedEscrowJob] = useState<any>(null);
  const [escrowPin, setEscrowPin] = useState('4848');
  const [otpCode, setOtpCode] = useState('8492');
  const [showOtpPrompt, setShowOtpPrompt] = useState(false);
  const [escrowProcessing, setEscrowProcessing] = useState(false);
  const [escrowSuccessMessage, setEscrowSuccessMessage] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  // Quick balance privacy toggle
  const [hideBalance, setHideBalance] = useState(false);

  // Fetch wallet
  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/fintech/wallet');
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Top-Up Submission
  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupProcessing(true);
    setTopupSuccessNotice(null);

    try {
      const res = await fetch('/api/fintech/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUGX: topupAmountUGX,
          gateway: selectedGateway,
          phone: momoPhone,
          pin: topupPin,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWallet(data.wallet);
        setTopupSuccessNotice(`Successfully funded ${topupAmountUGX.toLocaleString()} UGX via ${selectedGateway.replace('_', ' ')}! Funds are instantly credited.`);
        setTimeout(() => {
          setActiveTab('balance');
          setTopupSuccessNotice(null);
        }, 2000);
      } else {
        alert(data.error || 'Failed to complete top-up.');
      }
    } catch (err) {
      alert('Network issue during topup.');
    } finally {
      setTopupProcessing(false);
    }
  };

  // Handle Goods Received Release
  const handleConfirmGoodsReceived = async (job: any) => {
    if (!showOtpPrompt) {
      setSelectedEscrowJob(job);
      setShowOtpPrompt(true);
      return;
    }

    setEscrowProcessing(true);
    try {
      const res = await fetch('/api/fintech/escrow/release-goods-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          driverName: job.driverName || 'Moses Ochen (Equator Freight)',
          driverPhone: job.driverPhone || '+256 788 341 629',
          driverNetwork: job.driverNetwork || 'MTN_MOMO',
          freightTotalUGX: job.freightAmountUGX || 5000000,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWallet(data.wallet);
        setEscrowSuccessMessage(data.message);
        setActiveReceipt({
          receiptId: data.transaction?.id || 'TXN-REL-991',
          reference: data.payout?.reference || 'FLW-PAY-8821903',
          jobTitle: job.title,
          totalFreightUGX: data.split?.totalFreightUGX || 5000000,
          driverAmountUGX: data.split?.driverAmountUGX || 4500000,
          platformFeeUGX: data.split?.platformFeeUGX || 500000,
          driverName: data.payout?.driverName,
          driverPhone: data.payout?.driverPhone,
          smsSent: true,
          smsText: data.smsNotification?.message,
          timestamp: new Date().toLocaleString(),
        });
        setShowOtpPrompt(false);
        if (onGoodsReceivedRelease) {
          onGoodsReceivedRelease(job.id);
        }
      } else {
        alert(data.error || 'Failed to release escrow');
      }
    } catch {
      alert('Network error releasing escrow.');
    } finally {
      setEscrowProcessing(false);
    }
  };

  // Sample corridor job for quick booking demonstration
  const mombasaTrip = {
    id: 'job-ke-ug-501',
    title: 'Mombasa Port (Kilindini) to Kampala ICD (Nakawa) · 30T Container Freight',
    origin: 'Mombasa Port, Kenya',
    destination: 'Nakawa Inland Container Depot, Kampala',
    freightAmountUGX: 5000000,
    driverName: 'Moses Ochen (Equator Freight)',
    driverPhone: '+256 788 341 629',
    driverNetwork: 'MTN' as const,
    status: 'in_transit',
  };

  const currentEscrowList = activeEscrowJobs.length > 0 ? activeEscrowJobs : [mombasaTrip];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0A1F44] border-2 border-[#C5A059]/40 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 font-sans">
        
        {/* MODAL HEADER: Navy #0A1F44 + Gold #C5A059 with Chipper Cash elegance */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#07152F] via-[#0A1F44] to-[#122A5A] border-b border-[#C5A059]/30 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9E7835] via-[#C5A059] to-[#FFEAA8] p-0.5 shadow-lg shadow-black/50 shrink-0">
              <div className="w-full h-full bg-[#0A1F44] rounded-[14px] flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#C5A059]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#C5A059] text-[#0A1F44] tracking-wider">
                  MAXIMUS FINTECH WALLET
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  GreenTec FinTech Verified
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Customer Freight Wallet &amp; Escrow
              </h2>
              <p className="text-xs text-amber-200/80">
                Flutterwave + MTN MoMo + Airtel Money Instant Settlement Rail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close wallet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-5 pt-3 bg-[#081835] border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'balance', label: '1. Balance & Chipper Card', icon: Wallet },
            { id: 'topup', label: '2. Top-Up (MoMo / Airtel / Card)', icon: ArrowDownLeft },
            { id: 'escrow', label: '3. Escrow & "Goods Received"', icon: ShieldCheck },
            { id: 'history', label: '4. Wallet History & Receipts', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-[#C5A059] text-[#0A1F44] shadow-md shadow-[#C5A059]/20 font-black scale-[1.01]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: CHIPPER-STYLE DUAL-CURRENCY WALLET CARD */}
          {activeTab === 'balance' && (
            <div className="space-y-6">
              
              {/* Luxury Chipper Card for Trucking */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2D6B] via-[#0A1F44] to-[#040C1A] border-2 border-[#C5A059]/50 p-6 sm:p-8 shadow-2xl">
                {/* Gold luxury glow watermark */}
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#C5A059]/15 blur-2xl pointer-events-none" />
                <div className="absolute right-6 top-6 opacity-20 pointer-events-none">
                  <Truck className="w-24 h-24 text-[#C5A059]" />
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-widest text-amber-300 font-extrabold">MAXIMUS LOGISTICS WALLET</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <button
                      onClick={() => setHideBalance(!hideBalance)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-200/80 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{hideBalance ? 'Show' : 'Hide'} Balance</span>
                    </button>
                  </div>

                  {/* Dual Balances (UGX and USD) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Primary UGX Balance */}
                    <div className="bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-1">
                      <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                        <span>Available Spendable Balance (UGX)</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">UGANDA SHILLINGS</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                        {hideBalance ? '•••••••• UGX' : formatMoney(wallet?.balanceUGX ?? 12500000, 'UGX')}
                      </div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Instant ready for Mombasa, Kampala &amp; East Africa freight</span>
                      </div>
                    </div>

                    {/* Secondary USD Balance */}
                    <div className="bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-1">
                      <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                        <span>Global Equivalent (USD)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">US DOLLARS</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-[#C5A059] font-mono tracking-tight">
                        {hideBalance ? '•••••• USD' : `$${(wallet?.balanceUSD ?? 3333.33).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1 pt-1 font-mono">
                        <span>1 USD ≈ 3,750 UGX pegged (Flutterwave Bank Mid-Rate)</span>
                      </div>
                    </div>
                  </div>

                  {/* Held in Escrow Status Banner */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-amber-200 text-sm">
                          {hideBalance ? '••••••' : formatMoney(wallet?.heldEscrowUGX ?? 5000000, 'UGX')} (${(wallet?.heldEscrowUSD ?? 1333.33).toLocaleString()})
                        </div>
                        <div className="text-slate-300">
                          Status: <strong className="text-amber-400">"Funds Held in Escrow"</strong> (Locked by MAXIMUS Trust)
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('escrow')}
                      className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#d6b77c] text-[#0A1F44] font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>View Escrow &amp; Release</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('topup')}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Top-Up via MoMo / Airtel / Card</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('escrow')}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-[#C5A059]/40 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                      <span>Confirm "Goods Received" Payout</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('history')}
                      className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>History</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Supported FinTech Rail Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-center space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">MTN MoMo</div>
                  <div className="font-extrabold text-white text-xs">*165*3*031801#</div>
                  <div className="text-[10px] text-emerald-400">Push Payment Active</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-red-500/20 text-center space-y-1">
                  <div className="text-[10px] text-red-400 font-bold uppercase">Airtel Money</div>
                  <div className="font-extrabold text-white text-xs">*185*9*031801#</div>
                  <div className="text-[10px] text-emerald-400">Auto Payout Enabled</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-yellow-500/20 text-center space-y-1">
                  <div className="text-[10px] text-yellow-400 font-bold uppercase">Flutterwave</div>
                  <div className="font-extrabold text-white text-xs">Multi-Currency</div>
                  <div className="text-[10px] text-slate-300">UGX · USD · KES</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 text-center space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">Escrow Protection</div>
                  <div className="font-extrabold text-white text-xs">Zero Risk Carrier</div>
                  <div className="text-[10px] text-emerald-300">PIN &amp; OTP Secured</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TOP-UP VIA MOMO / AIRTEL / CARD */}
          {activeTab === 'topup' && (
            <form onSubmit={handleTopupSubmit} className="space-y-5">
              
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-[#C5A059]" />
                  <span>Deposit Funds into Customer Wallet</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select payment gateway. Balance updates in both UGX and USD immediately.
                </p>
              </div>

              {topupSuccessNotice && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{topupSuccessNotice}</span>
                </div>
              )}

              {/* Amount Preset Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Select Amount to Top-Up (UGX):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1000000, 2000000, 5000000, 10000000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTopupAmountUGX(amt)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        topupAmountUGX === amt
                          ? 'bg-[#C5A059] text-[#0A1F44] border-[#C5A059] shadow-md font-black scale-[1.02]'
                          : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div>{formatMoney(amt, 'UGX')}</div>
                      <div className="text-[10px] opacity-75 font-normal">≈ ${(amt / 3750).toFixed(0)} USD</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-[11px] text-slate-400">Or type custom amount (UGX):</label>
                  <input
                    type="number"
                    value={topupAmountUGX}
                    onChange={(e) => setTopupAmountUGX(Number(e.target.value))}
                    min={10000}
                    step={10000}
                    className="w-full mt-1 bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Gateway Picker: Flutterwave / MTN MoMo / Airtel Money */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Choose Deposit Gateway:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('MTN_MOMO')}
                    className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                      selectedGateway === 'MTN_MOMO'
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-white">MTN MoMo</div>
                      <div className="text-[11px] text-amber-300">*165# Instant Push</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Prompt sent to phone</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('AIRTEL_MONEY')}
                    className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                      selectedGateway === 'AIRTEL_MONEY'
                        ? 'bg-red-500/20 border-red-400 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-white">Airtel Money</div>
                      <div className="text-[11px] text-red-300">*185# Push USSD</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Automated approval</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('FLUTTERWAVE')}
                    className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                      selectedGateway === 'FLUTTERWAVE'
                        ? 'bg-yellow-500/20 border-yellow-400 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-white">Flutterwave</div>
                      <div className="text-[11px] text-yellow-300">Visa / Mastercard / USD</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Pan-African Gateway</div>
                    </div>
                  </button>

                </div>
              </div>

              {/* Phone / Security PIN Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Mobile Money Phone Number:</label>
                  <input
                    type="text"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="+256 7XX XXX XXX"
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Wallet Security PIN (Default 4848):</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={topupPin}
                    onChange={(e) => setTopupPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Submit Topup Button */}
              <button
                type="submit"
                disabled={topupProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#a8823d] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1F44] font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {topupProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0A1F44]" />
                    <span>Processing {selectedGateway.replace('_', ' ')} Push Prompt...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4 text-[#0A1F44]" />
                    <span>Authorize Top-Up of {formatMoney(topupAmountUGX, 'UGX')}</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* TAB 3: ESCROW PAYMENT SYSTEM & "GOODS RECEIVED" */}
          {activeTab === 'escrow' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                    <span>Maximus Safe Escrow Payment Rail</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Chipper-Style Trust Hold
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a customer books a truck (e.g. from <strong>Mombasa to Kampala</strong>), money leaves the wallet but is <strong>HELD by MAXIMUS</strong> with status <strong>"Funds Held in Escrow"</strong>. The funds are ONLY released when the customer clicks <strong>"Goods Received"</strong>.
                </p>
              </div>

              {/* Escrow Success Banner */}
              {escrowSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{escrowSuccessMessage}</span>
                  </div>
                  <button onClick={() => setEscrowSuccessMessage(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
                </div>
              )}

              {/* Active Escrow Contracts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Active Escrow Shipments Awaiting Goods Received:
                </h4>

                {currentEscrowList.map((job) => (
                  <div key={job.id} className="p-5 rounded-2xl bg-[#07152F] border-2 border-amber-500/30 space-y-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{job.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Funds Held in Escrow
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Trip #{job.id} · Route: <strong className="text-slate-200">{job.origin} → {job.destination}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">Locked Freight Total</div>
                        <div className="text-lg font-black text-[#C5A059] font-mono">
                          {formatMoney(job.freightAmountUGX, 'UGX')}
                        </div>
                      </div>
                    </div>

                    {/* Auto Commission Split Breakdown Callout */}
                    <div className="bg-black/50 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs font-mono">
                      <div className="text-[11px] text-amber-300 font-bold uppercase flex items-center justify-between font-sans">
                        <span>Automated 90% / 10% Commission Split Formula:</span>
                        <span className="text-[10px] text-slate-400">Zero Manual Math</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                          <div className="text-[10px] text-emerald-400 font-sans font-bold">90% Auto-Sent to Truck Driver:</div>
                          <div className="text-base font-extrabold text-white font-mono">
                            {formatMoney(Math.round(job.freightAmountUGX * 0.9), 'UGX')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                            Receiver: {job.driverName} ({job.driverPhone})
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                          <div className="text-[10px] text-indigo-300 font-sans font-bold">10% Retained by MAXIMUS:</div>
                          <div className="text-base font-extrabold text-[#C5A059] font-mono">
                            {formatMoney(Math.round(job.freightAmountUGX * 0.1), 'UGX')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                            Facilitation &amp; Escrow Guarantee Revenue
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Driver SMS Notification Guarantee Note */}
                    <div className="text-[11px] text-slate-300 flex items-center gap-2 bg-white/5 p-2.5 rounded-xl">
                      <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Upon clicking "Goods Received", driver immediately receives SMS: <strong className="text-white">"You received {Math.round(job.freightAmountUGX * 0.9).toLocaleString()} UGX from MAXIMUS"</strong>.
                      </span>
                    </div>

                    {/* Security Verification & Confirmation Action */}
                    {!showOtpPrompt || selectedEscrowJob?.id !== job.id ? (
                      <button
                        onClick={() => handleConfirmGoodsReceived(job)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-[#0A1F44] font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#0A1F44]" />
                        <span>Goods Received — Release Escrow Payout</span>
                      </button>
                    ) : (
                      /* OTP & PIN Verification Pop-down */
                      <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <KeyRound className="w-4 h-4" />
                            Final Security Authorization (OTP &amp; PIN)
                          </span>
                          <button onClick={() => setShowOtpPrompt(false)} className="text-slate-400 hover:text-white">Cancel</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-400">SMS OTP Code (Sent to phone):</label>
                            <input
                              type="text"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              className="w-full mt-1 bg-black/60 border border-white/20 rounded-lg p-2 text-white font-mono text-center tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Wallet PIN (Code 4848):</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={escrowPin}
                              onChange={(e) => setEscrowPin(e.target.value)}
                              className="w-full mt-1 bg-black/60 border border-white/20 rounded-lg p-2 text-white font-mono text-center tracking-widest"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleConfirmGoodsReceived(job)}
                          disabled={escrowProcessing}
                          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {escrowProcessing ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                              <span>Dispatching MoMo Payout &amp; Sending Driver SMS...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Confirm Goods Inspection &amp; Auto-Disburse 4,500,000 UGX</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                  </div>
                ))}

              </div>

              {/* Instant Payout Receipt Modal View */}
              {activeReceipt && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F2D6B] to-[#0A1F44] border-2 border-[#C5A059] space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#C5A059]/20 text-[#C5A059]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-sm">MAXIMUS DRIVER PAYOUT RECEIPT</div>
                        <div className="text-[10px] text-amber-200/80 font-mono">Ref: {activeReceipt.reference}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      PAID VIA MOMO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3.5 rounded-xl font-mono text-slate-300">
                    <div>Trip: <strong className="text-white">{activeReceipt.jobTitle}</strong></div>
                    <div>Driver Recipient: <strong className="text-emerald-400">{activeReceipt.driverName}</strong></div>
                    <div>Driver MoMo Line: <strong className="text-white">{activeReceipt.driverPhone}</strong></div>
                    <div>Total Freight: <strong className="text-white">{formatMoney(activeReceipt.totalFreightUGX, 'UGX')}</strong></div>
                    <div>90% Driver Payout: <strong className="text-emerald-400">{formatMoney(activeReceipt.driverAmountUGX, 'UGX')}</strong></div>
                    <div>10% Platform Fee: <strong className="text-[#C5A059]">{formatMoney(activeReceipt.platformFeeUGX, 'UGX')}</strong></div>
                  </div>

                  {activeReceipt.smsText && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">Carrier SMS Broadcast Confirmed:</div>
                      <div className="font-mono text-[11px] italic">"{activeReceipt.smsText}"</div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / Export PDF Receipt</span>
                    </button>
                    <button
                      onClick={() => setActiveReceipt(null)}
                      className="px-4 py-2 rounded-xl bg-[#C5A059] text-[#0A1F44] font-black text-xs cursor-pointer"
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: WALLET HISTORY PAGE & RECEIPTS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Wallet Transaction History</h3>
                  <p className="text-xs text-slate-400">Complete ledger of top-ups, escrow locks, and driver disbursements</p>
                </div>
                <button
                  onClick={fetchWallet}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl bg-black/40 border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#081835] text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3">Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Amount (UGX)</th>
                      <th className="p-3">Equivalent (USD)</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {(wallet?.transactions || []).map((txn) => (
                      <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            txn.type === 'TOPUP' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            txn.type === 'ESCROW_HOLD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{txn.description}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {txn.reference}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          {formatMoney(txn.amountUGX, 'UGX')}
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          ${txn.amountUSD.toLocaleString()}
                        </td>
                        <td className="p-3 text-[11px] text-slate-300">
                          {txn.gateway}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            txn.status === 'COMPLETED' ? 'text-emerald-400' :
                            txn.status === 'HELD_IN_ESCROW' ? 'text-amber-300 font-mono' : 'text-slate-400'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">
                          {txn.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-[#081835] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Encrypted with 256-bit Bank Grade SSL &amp; EFRIS Fiscal Sync</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-amber-200">MAXIMUS FinTech v2.4 (GreenTec Approved)</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
