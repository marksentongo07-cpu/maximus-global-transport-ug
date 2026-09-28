import React, { useState } from 'react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  Job, 
  Transporter, 
  EscrowTransaction, 
  Dispute, 
  Currency,
  Language 
} from '../../types';
import { formatMoney, convertFromUGX } from '../../services/currency';
import { t } from '../../services/i18n';
import { 
  ShieldCheck, 
  Lock, 
  Coins, 
  Users, 
  Truck, 
  AlertTriangle, 
  FileSpreadsheet, 
  CheckCircle2, 
  Ban, 
  Search, 
  FileText,
  TrendingUp,
  Download,
  Eye,
  BarChart3,
  Percent,
  Wallet,
  ArrowUpRight,
  ArrowRight,
  Building2,
  Smartphone,
  Receipt,
  CreditCard
} from 'lucide-react';
import { AdminDriverPayoutModal } from './AdminDriverPayoutModal';
import { LeafletLiveFleetMap } from '../Map/LeafletLiveFleetMap';

interface SuperAdminDashboardProps {
  allJobs: Job[];
  transporters: Transporter[];
  escrows: EscrowTransaction[];
  disputes: Dispute[];
  currency: Currency;
  language?: Language;
  userEmail?: string;
  onOpenManageICDs?: () => void;
  onToggleTransporterStatus: (transporterId: string) => void;
  onOpenKYC: (transporter: Transporter) => void;
  onOpenDispute: (dispute: Dispute) => void;
  onConfirmPODByAdmin?: (jobId: string) => void;
  onExecuteDriverPayout?: (jobId: string, payoutData: any) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  allJobs,
  transporters,
  escrows,
  disputes,
  currency,
  language = 'en',
  userEmail = 'marksentongo07@gmail.com',
  onOpenManageICDs,
  onToggleTransporterStatus,
  onOpenKYC,
  onOpenDispute,
  onConfirmPODByAdmin,
  onExecuteDriverPayout,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'map' | 'revenue' | 'analytics' | 'escrow' | 'payouts' | 'users' | 'disputes'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayoutJob, setSelectedPayoutJob] = useState<Job | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedProofJob, setSelectedProofJob] = useState<Job | null>(null);

  // Historical Monthly Financial Performance Data (UGX base, dynamically converted to active currency)
  const monthlyRevenueData = [
    { month: 'Apr 2026', grossUGX: 6800000, commissionUGX: 680000, payoutsUGX: 6120000, loads: 6, growth: 15.2 },
    { month: 'May 2026', grossUGX: 9400000, commissionUGX: 940000, payoutsUGX: 8460000, loads: 8, growth: 38.2 },
    { month: 'Jun 2026', grossUGX: 12500000, commissionUGX: 1250000, payoutsUGX: 11250000, loads: 11, growth: 33.0 },
    { month: 'Jul 2026', grossUGX: 15200000, commissionUGX: 1520000, payoutsUGX: 13680000, loads: 14, growth: 21.6 },
    { month: 'Aug 2026', grossUGX: 18900000, commissionUGX: 1890000, payoutsUGX: 17010000, loads: 16, growth: 24.3 },
    { month: 'Sep 2026', grossUGX: 23600000, commissionUGX: 2360000, payoutsUGX: 21240000, loads: 19, growth: 24.8 },
  ];

  // Converted chart series based on selected currency
  const chartData = monthlyRevenueData.map(d => ({
    month: d.month,
    gross: Math.round(convertFromUGX(d.grossUGX, currency)),
    commission: Math.round(convertFromUGX(d.commissionUGX, currency)),
    payouts: Math.round(convertFromUGX(d.payoutsUGX, currency)),
    loads: d.loads,
    growth: d.growth,
    rawGrossUGX: d.grossUGX,
    rawCommissionUGX: d.commissionUGX,
  }));

  // Gateway Share Data
  const gatewayDistribution = [
    { name: 'MTN MoMo Uganda', share: 48, color: '#F59E0B' },
    { name: 'Airtel Money Uganda', share: 26, color: '#EF4444' },
    { name: 'Stripe Corporate Cards', share: 14, color: '#6366F1' },
    { name: 'Flutterwave Africa', share: 8, color: '#10B981' },
    { name: 'Bank Wire / EFT', share: 4, color: '#0EA5E9' },
  ];

  // Corridor revenue breakdown
  const corridorRevenue = [
    { corridor: 'Kampala-Jinja', volume: Math.round(convertFromUGX(8200000, currency)), fee: Math.round(convertFromUGX(820000, currency)) },
    { corridor: 'Mbale-Namanve', volume: Math.round(convertFromUGX(5900000, currency)), fee: Math.round(convertFromUGX(590000, currency)) },
    { corridor: 'Mbarara-Kampala', volume: Math.round(convertFromUGX(4600000, currency)), fee: Math.round(convertFromUGX(460000, currency)) },
    { corridor: 'Tororo-Malaba', volume: Math.round(convertFromUGX(3100000, currency)), fee: Math.round(convertFromUGX(310000, currency)) },
    { corridor: 'Entebbe-Gulu', volume: Math.round(convertFromUGX(1800000, currency)), fee: Math.round(convertFromUGX(180000, currency)) },
  ];

  // Total Gross Transacted Volume (GTV)
  const gtvUGX = allJobs.reduce((acc, j) => acc + (j.agreedPriceUGX || j.marketPriceEstimateUGX), 0);
  
  // Total Platform Commission Revenue (10% of closed & held jobs)
  const platformRevenueUGX = escrows.reduce((acc, e) => acc + e.platformFeeUGX, 0);

  // Escrow balance currently held in trust
  const escrowHeldUGX = escrows
    .filter(e => e.status === 'held')
    .reduce((acc, e) => acc + e.totalAmountUGX, 0);

  const totalTrucks = transporters.reduce((acc, t) => acc + t.vehicles.reduce((vAcc, v) => vAcc + v.availableUnits, 0), 0);
  const pendingKYCTransporters = transporters.filter(t => t.kycStatus === 'pending');

  return (
    <div className="space-y-6">
      
      {/* SafeBoda KYC Verification Alert for Pending Transporters */}
      {pendingKYCTransporters.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-[#1a2a3f] to-[#1a2a3f] border-2 border-amber-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-black shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-300 text-sm">
                  ⚠️ SafeBoda Trust Gate: {pendingKYCTransporters.length} Transporter(s) Awaiting KYC Verification
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-black">
                  Action Required
                </span>
              </div>
              <span className="text-slate-300 text-[11px] block mt-0.5">
                Verify National ID + Truck Logbook + Truck Photo to stop scammers before they can bid on shipper loads.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenKYC(pendingKYCTransporters[0])}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Verify {pendingKYCTransporters[0].name} Now</span>
          </button>
        </div>
      )}

      {/* Management Confidentiality Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B192C] to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{t('adminConsoleTitle', language)}</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                ENCRYPTED AES-256
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t('confidentialFinancials', language)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userEmail && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Super Admin:</span>
              <span className="font-mono font-semibold text-white">{userEmail}</span>
            </div>
          )}

          {onOpenManageICDs && (
            <button
              onClick={onOpenManageICDs}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Manage ICDs &amp; Fees</span>
            </button>
          )}

          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('exportManagementAudit', language)}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Gross Volume */}
        <div className="bg-[#1a2a3f] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur space-y-1">
          <div className="flex items-center justify-between text-white/60 text-xs font-medium">
            <span>{t('grossTransactedVolume', language)}</span>
            <Coins className="w-4 h-4 text-white/80" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {formatMoney(gtvUGX, currency)}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>Across {allJobs.length} Haulage Jobs</span>
          </div>
        </div>

        {/* Maximus Commission Revenue (10%) */}
        <div className="bg-[#1a2a3f] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur space-y-1">
          <div className="flex items-center justify-between text-white/60 text-xs font-medium">
            <span>{t('platformRevenueTakeRate', language)}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {formatMoney(platformRevenueUGX, currency)}
          </div>
          <div className="text-[11px] text-white/50 pt-1">
            Retained facilitator margin
          </div>
        </div>

        {/* Escrow Balance Held */}
        <div className="bg-[#1a2a3f] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur space-y-1">
          <div className="flex items-center justify-between text-white/60 text-xs font-medium">
            <span>{t('escrowTrustInTransit', language)}</span>
            <ShieldCheck className="w-4 h-4 text-white/80" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono tracking-tight">
            {formatMoney(escrowHeldUGX, currency)}
          </div>
          <div className="text-[11px] text-white/50 pt-1">
            Held safely in escrow trust accounts
          </div>
        </div>

        {/* Active Fleet on Radar */}
        <div className="bg-[#1a2a3f] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur space-y-1">
          <div className="flex items-center justify-between text-white/60 text-xs font-medium">
            <span>{t('verifiedFleetTrucks', language)}</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {totalTrucks} Units
          </div>
          <div className="text-[11px] text-cyan-400 pt-1">
            Across {transporters.length} vetted carriers
          </div>
        </div>

      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 p-1.5 bg-[#1a2a3f] border border-white/10 rounded-full shadow-inner overflow-x-auto max-w-full">
          {[
            { id: 'map', label: 'Live Fleet GPS Map (All Trucks)' },
            { id: 'revenue', label: t('revenueAnalytics', language) },
            { id: 'analytics', label: t('corridorAnalytics', language) },
            { id: 'payouts', label: `Driver Payouts & PODs (${allJobs.filter(j => j.proofOfDelivery || j.status === 'delivered').length})` },
            { id: 'escrow', label: `${t('financialEscrowLedger', language)} (${escrows.length})` },
            { id: 'users', label: `${t('carrierClientDirectory', language)} (${transporters.length})` },
            { id: 'disputes', label: `${t('disputeArbitration', language)} (${disputes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as typeof activeAdminTab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeAdminTab === tab.id
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.id === 'map' && <Truck className="w-3.5 h-3.5" />}
              {tab.id === 'revenue' && <BarChart3 className="w-3.5 h-3.5" />}
              {tab.id === 'payouts' && <Receipt className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: LIVE FLEET GPS MAP (Super Admin Full Fleet Radar) */}
      {activeAdminTab === 'map' && (
        <div className="space-y-4">
          <LeafletLiveFleetMap
            fullScreenMode={true}
            language={language}
          />
        </div>
      )}

      {/* Tab: REVENUE ANALYTICS (Recharts Powered - Confidential Administration Access Only) */}
      {activeAdminTab === 'revenue' && (
        <div className="space-y-6">
          
          {/* Header & Access Governance */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  {t('adminEnterpriseRevenue', language)}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {t('strictlyAdminOnly', language)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {t('revenueSubtitle', language)}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{t('currentReportingCurrency', language)}</span>
              <span className="font-bold text-amber-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {currency}
              </span>
            </div>
          </div>

          {/* Key Revenue Growth Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Sep 2026 Net Commission</span>
                <Percent className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {formatMoney(2360000, currency)}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                <span>+24.8% Month-over-Month</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Trailing 6-Mo Commission</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">
                {formatMoney(8640000, currency)}
              </div>
              <div className="text-[10px] text-slate-400">
                From 74 dispatched freight trips
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Avg Commission / Load</span>
                <Wallet className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-black text-sky-400 font-mono">
                {formatMoney(124210, currency)}
              </div>
              <div className="text-[10px] text-slate-400">
                Across Fuso, Reefer &amp; Semi-Trailers
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Platform Take-Rate</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-400 font-mono">
                10.0% Fixed
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                100% Escrow safe settlement rate
              </div>
            </div>

          </div>

          {/* Main Chart 1: Monthly Income & Commission Trajectory Area Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Monthly Gross Volume vs. Maximus Net Commission (6-Month Trend)
                </h4>
                <p className="text-xs text-slate-400">
                  Tracking rapid commercial freight adoption across Ugandan industrial zones
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                  <span className="text-slate-300 font-medium">Gross Transacted Volume</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400" />
                  <span className="text-slate-300 font-medium">10% Platform Commission</span>
                </div>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748B" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                      return String(val);
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value: any, name: any) => {
                      const num = Number(value) || 0;
                      if (name === 'gross') return [formatMoney(num, currency), 'Gross Freight Transacted'];
                      if (name === 'commission') return [formatMoney(num, currency), 'Maximus Commission (10%)'];
                      return [value, name];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gross" 
                    stroke="#6366F1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#grossGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commission" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#commissionGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts Grid: Commission by Load & Gateway Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Chart 2: Monthly Completed Loads & Commission Income */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white">Monthly Commission Revenue by Volume</h4>
                  <p className="text-xs text-slate-400">Total monthly net earnings retained from client escrow</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Consistent MoM Uptrend
                </span>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false}
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                        return String(val);
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }}
                      formatter={(val: any) => [formatMoney(Number(val) || 0, currency), 'Net Commission']}
                    />
                    <Bar dataKey="commission" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Q2 Total Revenue</div>
                  <div className="font-bold text-white font-mono">{formatMoney(2870000, currency)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Q3 Total Revenue</div>
                  <div className="font-bold text-emerald-400 font-mono">{formatMoney(5770000, currency)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Quarterly Growth</div>
                  <div className="font-bold text-amber-400 font-mono">+101.0%</div>
                </div>
              </div>
            </div>

            {/* Chart 3: Gateway Share Distribution Pie Chart */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white">Payment Gateway Revenue Share</h4>
                  <p className="text-xs text-slate-400">Deposit volume split across local &amp; international gateways</p>
                </div>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  MTN &amp; Airtel Dominant (74%)
                </span>
              </div>

              <div className="w-full h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gatewayDistribution}
                      dataKey="share"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={48}
                      paddingAngle={3}
                    >
                      {gatewayDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }}
                      formatter={(val: any) => [`${val}% of Gross Volume`, 'Gateway Share']}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
                      formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-800">
                MoMo *165# &amp; Airtel *185# lead East African transactions; Stripe facilitates international corporate trade.
              </div>
            </div>

          </div>

          {/* Corridor Commission Yield Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              Corridor Commission Yield &amp; Profitability Breakdown
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Transport Corridor</th>
                    <th className="py-2.5 px-4">Key Freight Types</th>
                    <th className="py-2.5 px-4">Gross Transacted</th>
                    <th className="py-2.5 px-4">Maximus 10% Fee Earned</th>
                    <th className="py-2.5 px-4 text-right">Route Margin Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {corridorRevenue.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white">{c.corridor}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {idx === 0 ? 'Steel, Cement, Industrial Machinery' :
                         idx === 1 ? 'Arabica Coffee, Grains, Produce' :
                         idx === 2 ? 'Cold-Chain Dairy, Beef, Perishables' :
                         idx === 3 ? 'Cross-Border Malaba Transit, Fertilizer' :
                         'Medical Supply, Solar Equipment'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {formatMoney(c.volume, currency)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        +{formatMoney(c.fee, currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                          Tier 1 High Yield
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 1: Financial Escrow Ledger */}
      {activeAdminTab === 'escrow' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Real-time multi-gateway escrow ledger. Secured through Equity Till 031801. Tiered platform commission: 15% single, 10% bulk.
            </span>
            <span className="font-semibold text-amber-400">
              Till Escrow Account: 031801 (Equity Bank Uganda)
            </span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Escrow Ref</th>
                  <th className="py-3 px-4">Job / Route</th>
                  <th className="py-3 px-4">Shipper / Carrier</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Client Refund Destination</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {escrows.map((tx) => {
                  const matchedJob = allJobs.find(j => j.id === tx.jobId || j.escrowTransactionId === tx.id);
                  const isBulk = matchedJob?.shipmentType === 'bulk';
                  const refund = matchedJob?.clientRefundDetails;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{tx.referenceNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white line-clamp-1">{tx.jobTitle}</div>
                        <div className="text-[10px] text-slate-500">ID: {tx.jobId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{tx.clientName.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400">Carrier: {tx.transporterName.split(' ')[0]}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {formatMoney(tx.totalAmountUGX, currency)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        <div>+{formatMoney(tx.platformFeeUGX, currency)}</div>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {isBulk ? '10% Bulk' : '15% Single'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        {refund ? (
                          <div>
                            <span className="text-slate-300 font-semibold block">{refund.bankName || 'Bank'}</span>
                            <span className="font-mono text-[10px] text-slate-400">Acc: {refund.accountNumber || refund.mobileMoneyNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Default MoMo on File</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-300">{tx.paymentMethod}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.status === 'held' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          tx.status === 'released' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: DRIVER PAYOUTS & PROOF OF DELIVERY APPROVALS (Super Admin marksentongo07@gmail.com Authorization Console) */}
      {activeAdminTab === 'payouts' && (
        <div className="space-y-4">
          
          {/* Header Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-[#0B192C] to-slate-900 border border-emerald-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Carrier Payouts &amp; Proof of Delivery (POD) Approval Console</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                    Admin: {userEmail}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Execute direct driver payouts after root POD inspection. Rules: <strong>Mobile Money for ≤ 4,000,000 UGX</strong>; <strong>Bank Wire Transfer for &gt; 4,000,000 UGX</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs">
                Till Escrow: <strong className="text-amber-400 font-bold">031801</strong>
              </span>
            </div>
          </div>

          {/* Delivered / POD Jobs List */}
          <div className="space-y-3">
            {allJobs
              .filter(j => j.proofOfDelivery || j.status === 'delivered' || j.status === 'arrived')
              .map((job) => {
                const assignedCarrier = transporters.find(t => t.id === job.assignedTransporterId) || transporters[0];
                const agreedAmount = job.agreedPriceUGX || job.marketPriceEstimateUGX || 1250000;
                const isBulk = job.shipmentType === 'bulk' || job.weightTons >= 20;
                const commRate = isBulk ? 10 : 15;
                const commUGX = Math.round(agreedAmount * (commRate / 100));
                const netDriverPayout = agreedAmount - commUGX;

                // Threshold: <= 4,000,000 UGX -> Mobile Money; > 4,000,000 UGX -> Bank Transfer
                const isMobileMoney = netDriverPayout <= 4000000;
                const pod = job.proofOfDelivery;
                const isPodConfirmed = Boolean(pod?.confirmedByAdmin);
                const isPaid = job.payoutStatus === 'paid';

                return (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                            Trip #{job.id} · {job.category} ({job.weightTons}T)
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase border ${
                            isBulk ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {isBulk ? '10% Bulk Commission' : '15% Single Shipment'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">{job.title}</h4>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Carrier: <strong className="text-slate-200">{assignedCarrier.companyName}</strong> ({assignedCarrier.name}) · Shipper: {job.clientName}
                        </div>
                      </div>

                      {/* Amounts Summary */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Driver Net Payable:</span>
                        <div className="text-lg font-black text-amber-400 font-mono">
                          {formatMoney(netDriverPayout, currency)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Total: {formatMoney(agreedAmount, currency)} (-{commRate}% fee)
                        </span>
                      </div>
                    </div>

                    {/* Middle: Route & POD Inspection & Payout Channel Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      
                      {/* Box 1: Route & Client Refund info */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Route Corridor</span>
                        <div className="text-slate-300 line-clamp-1">
                          <strong className="text-emerald-400">From:</strong> {job.pickupLocation.name}
                        </div>
                        <div className="text-slate-300 line-clamp-1">
                          <strong className="text-rose-400">To:</strong> {job.deliveryLocation.name}
                        </div>
                        {job.clientRefundDetails && (
                          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                            Client Refund Acc: <strong className="text-slate-300">{job.clientRefundDetails.bankName || 'Bank'} ({job.clientRefundDetails.accountNumber})</strong>
                          </div>
                        )}
                      </div>

                      {/* Box 2: Proof of Delivery Verification */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proof of Delivery (POD)</span>
                          {isPodConfirmed ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Approved by Admin
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-400">
                              Awaiting Approval
                            </span>
                          )}
                        </div>

                        {pod ? (
                          <div className="space-y-1 text-[11px] text-slate-300">
                            <div>Receiver: <strong className="text-white">{pod.recipientName}</strong></div>
                            <div className="text-slate-400">Signed: {pod.timestamp}</div>
                            {pod.confirmationNote && (
                              <div className="text-slate-400 italic line-clamp-1">"{pod.confirmationNote}"</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-500 italic text-[11px]">No POD submitted yet</div>
                        )}
                      </div>

                      {/* Box 3: Payout Channel Target */}
                      <div className={`p-3 rounded-xl border space-y-1.5 ${
                        isMobileMoney 
                          ? 'bg-emerald-950/20 border-emerald-500/30' 
                          : 'bg-indigo-950/20 border-indigo-500/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            {isMobileMoney ? <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> : <Building2 className="w-3.5 h-3.5 text-indigo-400" />}
                            <span className={isMobileMoney ? 'text-emerald-400' : 'text-indigo-400'}>
                              {isMobileMoney ? 'Mobile Money (≤4M)' : 'Bank Transfer (>4M)'}
                            </span>
                          </span>
                        </div>

                        {isMobileMoney ? (
                          <div className="text-[11px] text-slate-300 space-y-0.5">
                            <div>Network: <strong>{assignedCarrier.payoutDetails?.mobileMoneyNetwork || 'MTN'} MoMo</strong></div>
                            <div className="font-mono font-bold text-amber-300">
                              {assignedCarrier.payoutDetails?.mobileMoneyNumber || assignedCarrier.phone}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              Name: {assignedCarrier.payoutDetails?.accountName || assignedCarrier.name}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-300 space-y-0.5">
                            <div className="font-semibold text-white">{assignedCarrier.payoutDetails?.bankName || 'Equity Bank Uganda'}</div>
                            <div className="font-mono font-bold text-indigo-300">
                              Acc: {assignedCarrier.payoutDetails?.bankAccountNumber || '1004829103948'}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              Beneficiary: {assignedCarrier.payoutDetails?.accountName || assignedCarrier.name}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Bottom Action Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                      
                      {/* Step 1: Confirm POD button */}
                      <div>
                        {!isPodConfirmed ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onConfirmPODByAdmin) {
                                onConfirmPODByAdmin(job.id);
                              }
                            }}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm POD as marksentongo07@gmail.com</span>
                          </button>
                        ) : (
                          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>POD Verified &amp; Signed by Root Super Admin ({userEmail})</span>
                          </div>
                        )}
                      </div>

                      {/* Step 2: Driver Payout Action Button */}
                      <div>
                        {isPaid ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Paid {formatMoney(job.payoutTransaction?.amountUGX || netDriverPayout, currency)} via {job.payoutTransaction?.method === 'BANK_TRANSFER' ? 'Bank Wire' : 'Mobile Money'}</span>
                            </span>

                            {job.payoutTransaction?.proofReference && (
                              <button
                                onClick={() => setSelectedProofJob(job)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                              >
                                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                                <span>Ref: {job.payoutTransaction.proofReference}</span>
                              </button>
                            )}
                          </div>
                        ) : isPodConfirmed ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPayoutJob(job);
                              setShowPayoutModal(true);
                            }}
                            className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all ${
                              isMobileMoney
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
                            }`}
                          >
                            <Receipt className="w-4 h-4" />
                            <span>
                              Payout {formatMoney(netDriverPayout, currency)} ({isMobileMoney ? 'Pay via Mobile Money' : 'Pay via Bank Transfer'})
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">
                            (Confirm POD above to unlock driver payout button)
                          </span>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* Tab 2: Carrier & Client Directory */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Manage transporters, audit statutory KYC licenses, or suspend rogue actors.</span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search carrier or plate..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transporters
              .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm">{t.companyName}</h4>
                          <span className={`w-2 h-2 rounded-full ${t.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        </div>
                        <p className="text-xs text-slate-400">Driver: {t.name} · {t.phone}</p>
                        <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                          ⭐ {t.rating} · {t.totalTrips} Trips · {t.loyaltyPoints} Pts
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.kycStatus === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      KYC {t.kycStatus}
                    </span>
                  </div>

                  {/* Vehicles snippet */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="text-slate-400 text-[10px]">Registered Fleet Units:</div>
                    {t.vehicles.map((v) => (
                      <div key={v.id} className="flex justify-between text-slate-300">
                        <span>{v.name} ({v.plateNumber})</span>
                        <span className="text-amber-400 font-bold">{v.availableUnits} Available</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenKYC(t)}
                        className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect KYC Docs</span>
                      </button>

                      {t.kycStatus === 'pending' && (
                        <button
                          onClick={() => onOpenKYC(t)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verify Driver (Allow Bidding)</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onToggleTransporterStatus(t.id)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                        t.status === 'active'
                          ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                      }`}
                    >
                      {t.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dispute Center */}
      {activeAdminTab === 'disputes' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Maximus Super Admin is the binding arbitrator for all damaged cargo, offloading shortfalls, and transit delays.
          </div>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-400">Dispute #{d.id}</span>
                      <span className="text-slate-400">· Opened by: {d.openerName}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{d.jobTitle}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Escrow at Stake:</span>
                    <div className="text-sm font-bold text-amber-400 font-mono">
                      {formatMoney(d.amountAtStakeUGX, currency)}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-rose-300 mb-1">{d.reason}</div>
                  <p className="text-slate-300 leading-relaxed">{d.description}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Filed: {d.createdAt}</span>
                  <button
                    onClick={() => onOpenDispute(d)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                  >
                    Open Arbitration Tribunal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Corridor Analytics */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Haulage Corridors */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                Top East African Haulage Corridors
              </h3>
              
              <div className="space-y-3 text-xs">
                {[
                  { route: 'Kampala ↔ Jinja Heavy Industrial Belt', volume: '42%', revenue: '4.8M UGX' },
                  { route: 'Mbale ↔ Kampala Agro-Export Corridor', volume: '28%', revenue: '3.2M UGX' },
                  { route: 'Mbarara ↔ Kampala Cold Chain Transit', volume: '18%', revenue: '2.4M UGX' },
                  { route: 'Tororo ↔ Malaba Border Port', volume: '12%', revenue: '1.6M UGX' },
                ].map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-slate-200">
                      <span className="font-medium">{c.route}</span>
                      <span className="font-mono text-amber-400 font-bold">{c.revenue}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: c.volume }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Fleet Utilization */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                Vehicle Category Utilization &amp; Demand
              </h3>

              <div className="space-y-2.5 text-xs">
                {[
                  { type: 'Fuso (5 - 10T Tipper / Box)', demand: 'High (84% active)', avgRate: '4,500 UGX/km' },
                  { type: 'Semi-Trailer (25 - 40T)', demand: 'Peak (91% active)', avgRate: '8,800 UGX/km' },
                  { type: 'Refrigerated Reefer', demand: 'Critical (95% active)', avgRate: '9,500 UGX/km' },
                  { type: 'Pickup (1 - 2T)', demand: 'Moderate (68% active)', avgRate: '2,800 UGX/km' },
                ].map((v, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{v.type}</div>
                      <div className="text-[10px] text-emerald-400">{v.demand}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-slate-200">{v.avgRate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin Driver Payout Authorization Modal */}
      {showPayoutModal && selectedPayoutJob && (
        <AdminDriverPayoutModal
          job={selectedPayoutJob}
          transporter={transporters.find(t => t.id === selectedPayoutJob.assignedTransporterId) || transporters[0]}
          currency={currency}
          adminEmail={userEmail}
          onClose={() => {
            setShowPayoutModal(false);
            setSelectedPayoutJob(null);
          }}
          onConfirmPayout={(jobId, payoutData) => {
            if (onExecuteDriverPayout) {
              onExecuteDriverPayout(jobId, payoutData);
            }
            setShowPayoutModal(false);
            setSelectedPayoutJob(null);
          }}
        />
      )}

      {/* Receipt Proof Inspection Modal */}
      {selectedProofJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">Settlement Payout Proof</span>
              <button onClick={() => setSelectedProofJob(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>Ref: <strong className="text-amber-400 font-mono">{selectedProofJob.payoutTransaction?.proofReference}</strong></div>
              <div>Method: <strong className="text-white">{selectedProofJob.payoutTransaction?.method === 'BANK_TRANSFER' ? 'Bank Transfer (>4M)' : 'Mobile Money (≤4M)'}</strong></div>
              <div>Recipient: <strong className="text-white">{selectedProofJob.payoutTransaction?.recipientName}</strong> ({selectedProofJob.payoutTransaction?.recipientPhoneOrAccount})</div>
              <div>Amount: <strong className="text-emerald-400 font-mono">{formatMoney(selectedProofJob.payoutTransaction?.amountUGX || 0, currency)}</strong></div>
              <div>Approved by: <strong className="text-slate-300 font-mono">{selectedProofJob.payoutTransaction?.approvedBy || userEmail}</strong></div>
              <div>Date: <strong className="text-slate-400">{selectedProofJob.payoutTransaction?.paidAt}</strong></div>
              {selectedProofJob.payoutTransaction?.notes && (
                <div className="italic text-slate-400">"{selectedProofJob.payoutTransaction.notes}"</div>
              )}
            </div>
            {selectedProofJob.payoutTransaction?.proofUrl && (
              <img
                src={selectedProofJob.payoutTransaction.proofUrl}
                alt="Payment Proof"
                className="w-full h-40 object-cover rounded-xl border border-slate-800"
              />
            )}
            <div className="text-right">
              <button
                onClick={() => setSelectedProofJob(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
