import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Coins, 
  TrendingUp, 
  AlertCircle,
  Truck,
  User,
  Wallet,
  Sparkles,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { Currency } from '../../types';
import { formatMoney } from '../../services/currency';

export interface PaymentMethodItem {
  id: string;
  type: 'momo_mtn' | 'momo_airtel' | 'equity_till' | 'card_visa' | 'card_mastercard' | 'bank_transfer';
  title: string;
  accountNumberOrPhone: string;
  accountHolderName: string;
  isDefault: boolean;
  category: 'deposit' | 'payout' | 'both';
  badge: string;
}

interface UnifiedPaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: 'client' | 'transporter';
  onSwitchPersona?: (newRole: 'client' | 'transporter') => void;
  currency: Currency;
  userPhone?: string;
  userName?: string;
}

export const UnifiedPaymentMethodsModal: React.FC<UnifiedPaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  onSwitchPersona,
  currency,
  userPhone = '+256 772 491 802',
  userName = 'Ronald Mukasa',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'payouts'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Initial payment methods supporting dual-persona
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([
    {
      id: 'pm-1',
      type: 'momo_mtn',
      title: 'MTN Mobile Money Instant',
      accountNumberOrPhone: userPhone,
      accountHolderName: userName,
      isDefault: true,
      category: 'both',
      badge: 'Escrow Deposit & Driver Payout',
    },
    {
      id: 'pm-2',
      type: 'equity_till',
      title: 'Equity Bank Merchant Till 031801',
      accountNumberOrPhone: 'Merchant Till: 031801 (Maximus TrustVault)',
      accountHolderName: 'Maximus Haulage Ltd Trust Account',
      isDefault: true,
      category: 'deposit',
      badge: 'Zero-Fee Escrow Lock',
    },
    {
      id: 'pm-3',
      type: 'bank_transfer',
      title: 'Stanbic Bank Uganda (Commercial Account)',
      accountNumberOrPhone: '9030018472910 · Forest Mall Branch',
      accountHolderName: `${userName} Heavy Logistics`,
      isDefault: false,
      category: 'both',
      badge: 'High-Value (>4M UGX) EFT',
    },
    {
      id: 'pm-4',
      type: 'momo_airtel',
      title: 'Airtel Money Business',
      accountNumberOrPhone: '+256 750 992 110',
      accountHolderName: userName,
      isDefault: false,
      category: 'payout',
      badge: 'Instant Payout Channel',
    },
    {
      id: 'pm-5',
      type: 'card_visa',
      title: 'Corporate Visa Card (Worldwide Logistics)',
      accountNumberOrPhone: '•••• •••• •••• 4892 (Exp 08/29)',
      accountHolderName: userName,
      isDefault: false,
      category: 'deposit',
      badge: 'International Cargo Booking',
    },
  ]);

  // Form states for adding a new method
  const [newType, setNewType] = useState<PaymentMethodItem['type']>('momo_mtn');
  const [newTitle, setNewTitle] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newHolder, setNewHolder] = useState(userName);
  const [newCategory, setNewCategory] = useState<PaymentMethodItem['category']>('both');

  const filteredMethods = paymentMethods.filter(pm => {
    if (activeTab === 'deposits') return pm.category === 'deposit' || pm.category === 'both';
    if (activeTab === 'payouts') return pm.category === 'payout' || pm.category === 'both';
    return true;
  });

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === id,
    })));
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const handleAddNewMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;

    let defaultTitle = 'Custom Payment Method';
    let badgeText = 'Linked Account';
    if (newType === 'momo_mtn') {
      defaultTitle = 'MTN Mobile Money';
      badgeText = 'Instant MoMo Push';
    } else if (newType === 'momo_airtel') {
      defaultTitle = 'Airtel Money';
      badgeText = 'Instant Airtel Push';
    } else if (newType === 'bank_transfer') {
      defaultTitle = newTitle.trim() || 'Bank Transfer Account';
      badgeText = 'EFT / Wire Transfer';
    } else if (newType === 'equity_till') {
      defaultTitle = 'Equity Bank Till Account';
      badgeText = 'Equity Merchant';
    } else {
      defaultTitle = newTitle.trim() || 'Credit / Debit Card';
      badgeText = 'Card Payment';
    }

    const newPM: PaymentMethodItem = {
      id: 'pm-' + Date.now(),
      type: newType,
      title: newTitle.trim() || defaultTitle,
      accountNumberOrPhone: newNumber.trim(),
      accountHolderName: newHolder.trim() || userName,
      isDefault: false,
      category: newCategory,
      badge: badgeText,
    };

    setPaymentMethods(prev => [...prev, newPM]);
    setShowAddForm(false);
    setNewNumber('');
    setNewTitle('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0A1931] border-2 border-[#C9A86A]/40 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#071324] via-[#0A1931] to-[#122442] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#C9A86A]/20 text-[#C9A86A] border border-[#C9A86A]/30">
              <Wallet className="w-6 h-6 text-[#C9A86A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#C9A86A] text-[#0A1931]">
                  Universal Payment Engine
                </span>
                <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Dual-Persona Ready
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">
                Payment Methods &amp; Dual-Role Wallet
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure both <strong>Client Escrow Deposits</strong> and <strong>Transporter Payouts</strong> — ready for when you operate as both on the same day.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-Persona Status Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-amber-500/10 via-[#0A1931] to-purple-500/10 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#C9A86A]/20 text-[#C9A86A]">
              {activePersona === 'client' ? <User className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-slate-400">Current Dashboard Mode: </span>
              <strong className="text-white capitalize">
                {activePersona === 'client' ? 'Client / Shipper Mode' : 'Transporter / Fleet Owner Mode'}
              </strong>
            </div>
          </div>

          {onSwitchPersona && (
            <button
              onClick={() => onSwitchPersona(activePersona === 'client' ? 'transporter' : 'client')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Switch between Client and Transporter roles"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to {activePersona === 'client' ? 'Transporter' : 'Client'} Mode</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Tabs Filter (All / Deposits / Payouts) */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
            <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl text-xs font-bold">
              {[
                { id: 'all', label: `All Methods (${paymentMethods.length})` },
                { id: 'deposits', label: 'Client Deposits (Escrow Inflow)' },
                { id: 'payouts', label: 'Transporter Payouts (Outflow)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#C9A86A] text-[#0A1931] shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-[#C9A86A] hover:bg-[#d6b77c] text-[#0A1931] font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0A1931]" />
              <span>{showAddForm ? 'Cancel Form' : 'Add Payment Method'}</span>
            </button>
          </div>

          {/* Add New Payment Method Drawer Form */}
          {showAddForm && (
            <form onSubmit={handleAddNewMethod} className="p-4 bg-slate-900 border border-[#C9A86A]/40 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A86A] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Link New Payment / Payout Account
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Bank-Grade Tokenized</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Payment Channel Type:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#050D1A] border border-white/10 rounded-xl p-2.5 text-white text-xs"
                  >
                    <option value="momo_mtn">MTN Mobile Money (Uganda)</option>
                    <option value="momo_airtel">Airtel Money (Uganda)</option>
                    <option value="equity_till">Equity Bank Merchant Till 031801</option>
                    <option value="bank_transfer">Commercial Bank Account (Stanbic / Centenary)</option>
                    <option value="card_visa">Visa Debit / Credit Card</option>
                    <option value="card_mastercard">Mastercard</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Usable For:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#050D1A] border border-white/10 rounded-xl p-2.5 text-white text-xs"
                  >
                    <option value="both">Both (Client Deposit &amp; Transporter Payout)</option>
                    <option value="deposit">Client Cargo Escrow Deposit Only</option>
                    <option value="payout">Transporter Trip Payout Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Account / Mobile Number:</label>
                  <input
                    type="text"
                    required
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder={newType.includes('momo') ? '+256 772 ...' : 'Account or Card Number'}
                    className="w-full bg-[#050D1A] border border-white/10 rounded-xl p-2.5 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Account Holder Name:</label>
                  <input
                    type="text"
                    required
                    value={newHolder}
                    onChange={(e) => setNewHolder(e.target.value)}
                    placeholder="Full Registered Name"
                    className="w-full bg-[#050D1A] border border-white/10 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C9A86A] text-[#0A1931] font-bold text-xs rounded-xl shadow-md hover:bg-[#d6b77c] cursor-pointer"
                >
                  Save &amp; Link Account
                </button>
              </div>
            </form>
          )}

          {/* List of Configured Payment Methods */}
          <div className="space-y-3">
            {filteredMethods.map((pm) => (
              <div 
                key={pm.id}
                className="p-4 rounded-2xl bg-[#071324] border border-white/10 hover:border-[#C9A86A]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-[#C9A86A] shrink-0 mt-0.5">
                    {pm.type.includes('momo') ? (
                      <Smartphone className="w-5 h-5 text-amber-400" />
                    ) : pm.type === 'equity_till' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : pm.type === 'bank_transfer' ? (
                      <Building2 className="w-5 h-5 text-sky-400" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-purple-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm">{pm.title}</h4>
                      {pm.isDefault && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Default Active
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#C9A86A] bg-[#C9A86A]/10 border border-[#C9A86A]/20">
                        {pm.badge}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-300 mt-1">
                      {pm.accountNumberOrPhone}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Holder: <strong className="text-slate-300">{pm.accountHolderName}</strong> · Validated with Bank KYC
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!pm.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(pm.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      Make Default
                    </button>
                  )}
                  {paymentMethods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(pm.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove method"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Explanatory Dual-Role Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Why both deposit &amp; payout methods are kept active:</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              On Maximus Freight, a business often ships international containers as a <strong>Customer</strong> in the morning, and uses their idle fleet to haul domestic backhaul loads as a <strong>Transporter</strong> in the afternoon. Having both methods linked guarantees frictionless daily operations with zero downtime.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#071324] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bank-Grade Escrow via Equity Bank Till 031801</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] font-bold shadow-md cursor-pointer"
          >
            Done &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
