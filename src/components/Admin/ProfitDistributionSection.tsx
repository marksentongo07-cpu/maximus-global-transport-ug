import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Settings2, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  RefreshCw, 
  DollarSign, 
  Coins, 
  Building2, 
  Smartphone, 
  HeartHandshake, 
  Server, 
  FileText, 
  Sliders, 
  Lock, 
  Send, 
  Info,
  Check,
  TrendingUp,
  Receipt,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Currency } from '../../types';
import { formatMoney } from '../../services/currency';

interface ProfitDistributionSectionProps {
  currency: Currency;
  accountData: any;
  onRefreshData?: () => void;
}

export const ProfitDistributionSection: React.FC<ProfitDistributionSectionProps> = ({
  currency,
  accountData,
  onRefreshData,
}) => {
  // Profit distribution configuration (1% for Jesus, biggest % for Mark Sentongo, certain % for maintenance)
  const [maintenancePercent, setMaintenancePercent] = useState<number>(
    accountData?.profitDistribution?.config?.maintenance_percent || 19
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);
  const [activeScope, setActiveScope] = useState<'cumulative' | 'today' | 'custom'>('cumulative');
  const [customAmountInput, setCustomAmountInput] = useState<string>('5000000');
  
  // Modal for Disbursing/Transferring Profit
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseTarget, setDisburseTarget] = useState<'all' | 'jesus' | 'owner' | 'maintenance'>('all');
  const [disburseNotes, setDisburseNotes] = useState('');
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [disburseReceipt, setDisburseReceipt] = useState<any | null>(null);

  // Local disbursements log from server or fallback
  const [localDisbursements, setLocalDisbursements] = useState<any[]>(
    accountData?.profitDistribution?.disbursements || []
  );

  // Core Rule: 
  // 1% is strictly for Jesus
  // maintenancePercent is configurable
  // ownerPercent is ALWAYS the biggest %: (99 - maintenancePercent)
  const jesusPercent = 1.0;
  const ownerPercent = Math.max(50, Math.round((99.0 - maintenancePercent) * 10) / 10);

  // Base pool amounts
  const cumulativeNetUGX = accountData?.netRevenueUGX || 16600000;
  const cumulativeNetUSD = accountData?.netRevenueUSD || 4420;
  const todayNetUGX = accountData?.commissionTodayUGX || 1840000;
  const todayNetUSD = accountData?.commissionTodayUSD || 490;
  
  const customUGX = Math.max(0, Number(customAmountInput) || 0);
  const customUSD = Math.round((customUGX / 3750) * 100) / 100;

  // Selected pool based on active scope
  const activePoolUGX = 
    activeScope === 'cumulative' ? cumulativeNetUGX :
    activeScope === 'today' ? todayNetUGX : customUGX;

  const activePoolUSD = 
    activeScope === 'cumulative' ? cumulativeNetUSD :
    activeScope === 'today' ? todayNetUSD : customUSD;

  // Derived splits for the active pool
  const jesusUGX = Math.round(activePoolUGX * (jesusPercent / 100));
  const jesusUSD = Math.round(activePoolUSD * (jesusPercent / 100) * 100) / 100;

  const ownerUGX = Math.round(activePoolUGX * (ownerPercent / 100));
  const ownerUSD = Math.round(activePoolUSD * (ownerPercent / 100) * 100) / 100;

  const maintenanceUGX = Math.round(activePoolUGX * (maintenancePercent / 100));
  const maintenanceUSD = Math.round(activePoolUSD * (maintenancePercent / 100) * 100) / 100;

  // Save distribution policy to backend
  const handleSavePolicy = async () => {
    setIsSavingConfig(true);
    setConfigSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/profit-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenance_percent: maintenancePercent,
        }),
      });
      if (res.ok) {
        setConfigSuccessMsg(`Profit policy saved! 1% for Jesus · ${ownerPercent}% for Mark Sentongo (Biggest Share) · ${maintenancePercent}% for App Maintenance.`);
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error('Error saving profit policy:', e);
    } finally {
      setIsSavingConfig(false);
      setTimeout(() => setConfigSuccessMsg(null), 5000);
    }
  };

  // Execute disbursement / logging
  const handleExecuteDisbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisbursing(true);
    try {
      const res = await fetch('/api/admin/disburse-profit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: disburseTarget,
          amountUGX: activePoolUGX,
          recipientNotes: disburseNotes || `Scheduled profit distribution split (${activeScope.toUpperCase()})`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDisburseReceipt(data.disbursement);
        if (data.allDisbursements) {
          setLocalDisbursements(data.allDisbursements);
        }
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error('Error executing profit disburse:', e);
    } finally {
      setIsDisbursing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1D33] via-[#0B1526] to-[#080E1A] border-2 border-[#C9A86A]/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A86A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono flex items-center gap-1.5">
                <span>✝</span> 1% FOR JESUS
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                BIGGEST % FOR ME (MARK SENTONGO)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                <Server className="w-3 h-3 text-emerald-400" />
                APP MAINTENANCE FEE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Admin Profit Distribution &amp; Sacred Tithe Engine</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every coin of freight commission earned across Uganda and East Africa is systematically distributed according to the founder's divine covenant and platform governance rules:
            </p>

            {/* Scriptural & Visionary Badge */}
            <div className="p-3 bg-black/40 rounded-2xl border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
              <span className="text-base text-amber-300">✝</span>
              <div className="text-[11px] leading-relaxed">
                <strong className="text-white font-semibold">Divine Covenant (Proverbs 3:9-10):</strong>
                <span className="text-purple-200 ml-1">
                  "Honor the Lord with your wealth, with the firstfruits of all your crops." The first 1% is consecrated to Jesus Christ for continuous highway favor, angelic protection over freight, and benevolence. The majority dividend belongs to Mark Sentongo, and the maintenance reserve ensures flawless 24/7 technical uptime.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => {
                setDisburseTarget('all');
                setShowDisburseModal(true);
                setDisburseReceipt(null);
              }}
              className="px-5 py-3 rounded-xl font-black text-xs bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] shadow-xl shadow-[#C9A86A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Execute Profit Split &amp; Payout</span>
            </button>
            <button
              onClick={() => {
                if (onRefreshData) onRefreshData();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C9A86A]" />
              <span>Sync Live Accounts Balance</span>
            </button>
          </div>
        </div>

        {/* Visual Split Distribution Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              Active Profit Allocation Formula (100% Total)
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-purple-400 font-bold">✝ Jesus: {jesusPercent}%</span>
              <span className="text-[#C9A86A] font-bold">👑 Me: {ownerPercent}%</span>
              <span className="text-emerald-400 font-bold">⚙ Maintenance: {maintenancePercent}%</span>
            </div>
          </div>

          <div className="h-5 w-full bg-slate-900 rounded-xl overflow-hidden p-1 border border-white/10 flex gap-1 shadow-inner">
            {/* 1% Jesus */}
            <div 
              style={{ width: `${Math.max(4, jesusPercent)}%` }} 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg relative group transition-all"
              title="1% Fee for Jesus"
            >
              <span className="sr-only">1% Jesus</span>
            </div>

            {/* Biggest % for Me (Mark Sentongo) */}
            <div 
              style={{ width: `${ownerPercent}%` }} 
              className="h-full bg-gradient-to-r from-[#C9A86A] via-amber-400 to-[#b79653] rounded-lg relative group transition-all flex items-center justify-center overflow-hidden"
              title={`${ownerPercent}% for Mark Sentongo (Biggest %)`}
            >
              <span className="text-[10px] font-black text-[#0A1931] uppercase tracking-wider font-mono">
                {ownerPercent}% FOR ME (MARK SENTONGO - BIGGEST SHARE)
              </span>
            </div>

            {/* Certain % for App Maintenance */}
            <div 
              style={{ width: `${maintenancePercent}%` }} 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg relative group transition-all flex items-center justify-center overflow-hidden"
              title={`${maintenancePercent}% for App Maintenance`}
            >
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider font-mono">
                {maintenancePercent}% APP MAINTENANCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Switcher: Cumulative vs Today's Commissions vs Arbitrary Simulator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1526] border border-white/10">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-[#C9A86A]" />
          <div>
            <h3 className="text-sm font-bold text-white">Select Profit Calculation Base</h3>
            <p className="text-[11px] text-slate-400">View real-time distribution across cumulative revenue or today's intake.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 bg-black/40 border border-white/10 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveScope('cumulative')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeScope === 'cumulative' 
                  ? 'bg-[#C9A86A] text-[#0A1931] shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cumulative Net ({formatMoney(cumulativeNetUGX, 'UGX')})
            </button>
            <button
              onClick={() => setActiveScope('today')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeScope === 'today' 
                  ? 'bg-emerald-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Today's Net ({formatMoney(todayNetUGX, 'UGX')})
            </button>
            <button
              onClick={() => setActiveScope('custom')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeScope === 'custom' 
                  ? 'bg-purple-500 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Custom Simulator Input Bar (if active) */}
      {activeScope === 'custom' && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-xs font-bold text-purple-200">Simulate Freight Profit Amount (UGX)</span>
              <p className="text-[10px] text-purple-300">Enter any arbitrary profit to preview the split instantly.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-300">UGX</span>
            <input
              type="number"
              value={customAmountInput}
              onChange={(e) => setCustomAmountInput(e.target.value)}
              className="px-3 py-2 bg-black/60 border border-purple-400/50 rounded-xl text-white font-mono text-sm w-44 focus:outline-none focus:border-purple-300"
              placeholder="e.g. 5000000"
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3 CORE PROFIT ALLOCATION PILLARS CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: 1% FOR JESUS */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#16122C] to-[#0D0B1C] border-2 border-purple-500/50 p-6 shadow-xl space-y-4 hover:border-purple-400 transition-all flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg shadow">
                  ✝
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 font-mono">
                    Fixed Divine Covenant
                  </span>
                  <h3 className="text-lg font-black text-white">1% Fee for Jesus</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-200 border border-purple-500/50 font-mono">
                1.0% FIXED
              </span>
            </div>

            {/* Calculated Amount */}
            <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1">
              <div className="text-[11px] text-purple-300 font-semibold uppercase">
                {activeScope === 'cumulative' ? 'Cumulative Divine Tithe' : activeScope === 'today' ? 'Today\'s Tithe (Active)' : 'Simulated Tithe'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-200 font-mono">
                {formatMoney(jesusUGX, 'UGX')}
              </div>
              <div className="text-xs font-mono text-purple-400 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${jesusUSD.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Beneficiary Details */}
            <div className="text-xs text-slate-300 space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5 font-mono text-[11px]">
              <div><strong className="text-purple-300">Beneficiary:</strong> Kingdom Ministry &amp; Benevolence Vault</div>
              <div><strong className="text-purple-300">Purpose:</strong> Faith-Based Highway Missions, Driver Charity &amp; Thanksgiving</div>
              <div><strong className="text-purple-300">Account:</strong> Equity Bank Sub-Ledger / Tithe Escrow</div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "Honoring the Provider of all wealth. Acknowledging that every safe delivery and profitable route across Uganda, Kenya, and DRC is sustained by divine grace."
            </p>
          </div>

          <div className="pt-2 border-t border-purple-500/20 relative z-10">
            <button
              onClick={() => {
                setDisburseTarget('jesus');
                setShowDisburseModal(true);
                setDisburseReceipt(null);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
              <span>Disburse Tithe to Ministry</span>
            </button>
          </div>
        </div>

        {/* CARD 2: BIGGEST % FOR ME (MARK SENTONGO) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#221B0E] to-[#0F0D07] border-2 border-[#C9A86A] p-6 shadow-2xl space-y-4 hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#C9A86A]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#C9A86A]/20 border border-[#C9A86A]/50 flex items-center justify-center text-[#C9A86A] font-bold text-lg shadow">
                  <Crown className="w-5 h-5 text-[#C9A86A]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                    Sole Founder &amp; Owner
                  </span>
                  <h3 className="text-lg font-black text-white">Biggest % is for Me</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-200 border border-amber-500/50 font-mono">
                {ownerPercent}% BIGGEST SHARE
              </span>
            </div>

            {/* Calculated Amount */}
            <div className="p-4 rounded-2xl bg-black/40 border border-[#C9A86A]/40 space-y-1">
              <div className="text-[11px] text-amber-300 font-semibold uppercase">
                {activeScope === 'cumulative' ? 'Cumulative Owner Dividend' : activeScope === 'today' ? 'Today\'s Founder Payout' : 'Simulated Founder Dividend'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {formatMoney(ownerUGX, 'UGX')}
              </div>
              <div className="text-xs font-mono text-amber-200 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${ownerUSD.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Beneficiary Details */}
            <div className="text-xs text-slate-300 space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5 font-mono text-[11px]">
              <div><strong className="text-amber-300">Recipient:</strong> Mark Sentongo (Principal Owner)</div>
              <div><strong className="text-amber-300">Email:</strong> marksentongo07@gmail.com</div>
              <div><strong className="text-amber-300">Settlement:</strong> Equity Bank Merchant Till 031801 / MTN MoMo *165*3*031801#</div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              The lion's share of platform earnings rewarded directly to the founder for capital risk, platform architecture, leadership, and operational stewardship.
            </p>
          </div>

          <div className="pt-2 border-t border-[#C9A86A]/30 relative z-10">
            <button
              onClick={() => {
                setDisburseTarget('owner');
                setShowDisburseModal(true);
                setDisburseReceipt(null);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#0A1931]" />
              <span>Disburse to Mark Sentongo (MoMo/Till)</span>
            </button>
          </div>
        </div>

        {/* CARD 3: APP MAINTENANCE & ADMINISTRATION FEE */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0E1E1C] to-[#081210] border-2 border-emerald-500/50 p-6 shadow-xl space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-lg shadow">
                  <Server className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                    Operational Engine
                  </span>
                  <h3 className="text-lg font-black text-white">App Maintenance Fee</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 font-mono">
                {maintenancePercent}% FEE
              </span>
            </div>

            {/* Calculated Amount */}
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
              <div className="text-[11px] text-emerald-300 font-semibold uppercase">
                {activeScope === 'cumulative' ? 'Cumulative Tech Reserve' : activeScope === 'today' ? 'Today\'s Tech Allocation' : 'Simulated Tech Reserve'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                {formatMoney(maintenanceUGX, 'UGX')}
              </div>
              <div className="text-xs font-mono text-emerald-200 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${maintenanceUSD.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Beneficiary Details */}
            <div className="text-xs text-slate-300 space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5 font-mono text-[11px]">
              <div><strong className="text-emerald-300">Allocation:</strong> Cloud Servers &amp; Infrastructure Escrow</div>
              <div><strong className="text-emerald-300">Coverage:</strong> Google Cloud Hosting, URA EFRIS Sync, Maps Quotas</div>
              <div><strong className="text-emerald-300">Engineering:</strong> Security Audits, Bug Fixes &amp; 99.9% Uptime</div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Guarantees the application remains lightning-fast, highly secure, fully compliant with URA ASYCUDA fiscal rules, and accessible 24/7.
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-500/20 relative z-10">
            <button
              onClick={() => {
                setDisburseTarget('maintenance');
                setShowDisburseModal(true);
                setDisburseReceipt(null);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-emerald-300" />
              <span>Allocate to Tech Infrastructure</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* INTERACTIVE CONTROLS: TUNE APP MAINTENANCE PERCENTAGE */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#0B1526] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C9A86A]" />
              <span>Owner Profit Split Governance (Tune Maintenance %)</span>
            </h3>
            <p className="text-xs text-slate-300">
              Adjust the App Maintenance fee between 5% and 30%. As you adjust, <strong className="text-purple-300">1% for Jesus remains strictly locked</strong>, and <strong className="text-amber-300">Mark Sentongo's share dynamically re-balances to always remain the biggest percentage ({ownerPercent}%)</strong>.
            </p>
          </div>

          {configSuccessMsg && (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{configSuccessMsg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Slider control */}
          <div className="lg:col-span-2 space-y-3 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-300">App Maintenance (Administration Fee)</span>
              <span className="text-emerald-400 text-base">{maintenancePercent}%</span>
            </div>

            <input
              type="range"
              min="5"
              max="30"
              step="0.5"
              value={maintenancePercent}
              onChange={(e) => setMaintenancePercent(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5% (Minimal server upkeep)</span>
              <span>19% (Optimal standard recommended)</span>
              <span>30% (High expansion &amp; fleet R&amp;D)</span>
            </div>
          </div>

          {/* Resulting split summary & save button */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F223D] to-[#0A1931] border border-[#C9A86A]/40 space-y-3">
            <div className="text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>✝ For Jesus:</span>
                <strong className="text-purple-300 font-bold">{jesusPercent}%</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>👑 For Me (Mark Sentongo):</span>
                <strong className="text-[#C9A86A] font-bold text-sm">{ownerPercent}% (Biggest)</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>⚙ App Maintenance:</span>
                <strong className="text-emerald-300 font-bold">{maintenancePercent}%</strong>
              </div>
              <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-white">
                <span>Total Distributed:</span>
                <span>{(jesusPercent + ownerPercent + maintenancePercent).toFixed(1)}%</span>
              </div>
            </div>

            <button
              onClick={handleSavePolicy}
              disabled={isSavingConfig}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSavingConfig ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Policy to Platform</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HISTORICAL PROFIT SPLIT AUDIT LOG (PER TRIP COMMISSION) */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#0B1526] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#C9A86A]" />
              <span>Real-Time Freight Profit Disbursement Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit trail of platform commissions split between Jesus (1%), Mark Sentongo ({ownerPercent}%), and App Maintenance ({maintenancePercent}%).
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold self-start sm:self-center">
            {localDisbursements.length} Completed Allocations
          </span>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Ref Code / Time</th>
                <th className="py-3 px-3">Source Trip / Cargo</th>
                <th className="py-3 px-3 text-right">Net Commission</th>
                <th className="py-3 px-3 text-right text-purple-400">✝ Jesus (1%)</th>
                <th className="py-3 px-3 text-right text-[#C9A86A]">👑 Mark Sentongo ({ownerPercent}%)</th>
                <th className="py-3 px-3 text-right text-emerald-400">⚙ Maint ({maintenancePercent}%)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {localDisbursements.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-white">{row.referenceCode}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{row.timestamp}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs">
                    <span className="font-semibold text-slate-200">{row.sourceDescription}</span>
                    {row.jobId && (
                      <span className="block text-[10px] text-amber-300/80 font-mono">{row.jobId}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-white">
                    {formatMoney(row.netProfitUGX, 'UGX')}
                    <div className="text-[10px] text-slate-400">${(row.netProfitUSD || 0).toLocaleString()} USD</div>
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-purple-300">
                    +{formatMoney(row.jesusAmountUGX, 'UGX')}
                    <div className="text-[10px] text-purple-400/80">${(row.jesusAmountUSD || 0).toLocaleString()}</div>
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-amber-300">
                    +{formatMoney(row.ownerAmountUGX, 'UGX')}
                    <div className="text-[10px] text-amber-400/80">${(row.ownerAmountUSD || 0).toLocaleString()}</div>
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-emerald-300">
                    +{formatMoney(row.maintenanceAmountUGX, 'UGX')}
                    <div className="text-[10px] text-emerald-400/80">${(row.maintenanceAmountUSD || 0).toLocaleString()}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.status === 'DISBURSED' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: DISBURSE / PAYOUT MODAL */}
      {/* ---------------------------------------------------- */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-[#0B1526] border-2 border-[#C9A86A]/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowDisburseModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            {!disburseReceipt ? (
              <form onSubmit={handleExecuteDisbursement} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#C9A86A]/20 border border-[#C9A86A]/40 flex items-center justify-center text-[#C9A86A]">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Execute Profit Payout</h3>
                    <p className="text-xs text-slate-300">
                      Disburse platform earnings to target beneficiaries.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Total Profit to Split:</span>
                    <strong className="text-white text-sm">{formatMoney(activePoolUGX, 'UGX')}</strong>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/10 font-mono text-[11px]">
                    <div className="flex justify-between text-purple-300">
                      <span>✝ 1% for Jesus:</span>
                      <strong>{formatMoney(jesusUGX, 'UGX')} (${jesusUSD} USD)</strong>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>👑 {ownerPercent}% for Mark Sentongo:</span>
                      <strong>{formatMoney(ownerUGX, 'UGX')} (${ownerUSD} USD)</strong>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>⚙ {maintenancePercent}% for App Maintenance:</span>
                      <strong>{formatMoney(maintenanceUGX, 'UGX')} (${maintenanceUSD} USD)</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Select Payout Recipient
                  </label>
                  <select
                    value={disburseTarget}
                    onChange={(e: any) => setDisburseTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050D1A] border border-white/20 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-[#C9A86A]"
                  >
                    <option value="all">All Beneficiaries (Pro-Rata Triple Split)</option>
                    <option value="jesus">✝ Jesus Only (Kingdom Ministry &amp; Benevolence Vault)</option>
                    <option value="owner">👑 Mark Sentongo Only (Equity Till 031801 / MTN MoMo)</option>
                    <option value="maintenance">⚙ App Maintenance Only (Cloud Servers &amp; EFRIS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Settlement Notes / Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={disburseNotes}
                    onChange={(e) => setDisburseNotes(e.target.value)}
                    placeholder="e.g. October Corridor Commission Dividend Payout"
                    className="w-full px-3.5 py-2.5 bg-[#050D1A] border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-[#C9A86A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Secured by Super Admin Hardware Credentials. Transfers are digitally recorded with an EFRIS-compliant audit trail.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isDisbursing}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDisbursing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transacting Payout...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Disburse Profit</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Receipt View */
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Disbursement Successful!</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Profit distributed according to the sacred formula.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reference:</span>
                    <strong className="text-amber-300">{disburseReceipt.referenceCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-white">{disburseReceipt.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Profit:</span>
                    <strong className="text-white">{formatMoney(disburseReceipt.netProfitUGX, 'UGX')}</strong>
                  </div>
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-purple-300">
                      <span>✝ Jesus (1%):</span>
                      <span>{formatMoney(disburseReceipt.jesusAmountUGX, 'UGX')}</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-bold">
                      <span>👑 Mark Sentongo ({ownerPercent}%):</span>
                      <span>{formatMoney(disburseReceipt.ownerAmountUGX, 'UGX')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>⚙ App Maintenance ({maintenancePercent}%):</span>
                      <span>{formatMoney(disburseReceipt.maintenanceAmountUGX, 'UGX')}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDisburseModal(false);
                    setDisburseReceipt(null);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
