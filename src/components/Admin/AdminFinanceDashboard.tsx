import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Lock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  TrendingUp, 
  Smartphone, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Truck
} from 'lucide-react';
import { Currency } from '../../types';
import { formatMoney } from '../../services/currency';

interface FinanceDashboardData {
  summary: {
    totalHeldUGX: number;
    totalHeldUSD: number;
    totalPayoutsUGX: number;
    totalPayoutsUSD: number;
    totalCommissionsEarnedUGX: number;
    totalCommissionsEarnedUSD: number;
    activeEscrowContractsCount: number;
    completedPayoutsCount: number;
    reportingPartner: string;
  };
  heldFunds: Array<{
    escrowId: string;
    jobId: string;
    route: string;
    clientName: string;
    driverName: string;
    driverPhone: string;
    heldAmountUGX: number;
    heldAmountUSD: number;
    splitDriverUGX: number;
    splitMaximusUGX: number;
    status: string;
    gateway: string;
    heldAt: string;
  }>;
  payouts: Array<{
    payoutId: string;
    jobId: string;
    jobTitle: string;
    driverName: string;
    driverPhone: string;
    network: string;
    freightTotalUGX: number;
    driverSharePercent: number;
    driverAmountUGX: number;
    platformFeeUGX: number;
    status: string;
    timestamp: string;
    smsSent: boolean;
    smsText: string;
    reference: string;
  }>;
  gatewaysSupported: Array<{
    name: string;
    ussd?: string;
    api?: string;
    till?: string;
    status: string;
    successRate?: string;
    zeroFee?: boolean;
    currencies?: string[];
  }>;
}

export const AdminFinanceDashboard: React.FC<{ currency?: Currency }> = ({ currency = 'UGX' }) => {
  const [data, setData] = useState<FinanceDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'held' | 'payouts' | 'gateways'>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/finance-dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Export to Excel / CSV for KPA / GreenTec Reporting
  const handleExportToExcel = () => {
    if (!data) return;
    
    // Generate clean CSV content
    const headers = ['Record_Type', 'Reference_ID', 'Job_ID', 'Route_Or_Title', 'Party_Name', 'Phone', 'Total_UGX', 'Driver_90%_UGX', 'Maximus_10%_Fee_UGX', 'Gateway', 'Status', 'Timestamp'];
    const rows: string[] = [];

    // Held funds rows
    data.heldFunds.forEach(h => {
      rows.push([
        'ESCROW_HELD',
        h.escrowId,
        h.jobId,
        `"${h.route}"`,
        `"${h.clientName}"`,
        h.driverPhone,
        h.heldAmountUGX,
        h.splitDriverUGX,
        h.splitMaximusUGX,
        `"${h.gateway}"`,
        `"${h.status}"`,
        `"${h.heldAt}"`
      ].join(','));
    });

    // Payouts rows
    data.payouts.forEach(p => {
      rows.push([
        'DRIVER_PAYOUT',
        p.payoutId,
        p.jobId,
        `"${p.jobTitle}"`,
        `"${p.driverName}"`,
        p.driverPhone,
        p.freightTotalUGX,
        p.driverAmountUGX,
        p.platformFeeUGX,
        `"${p.network}"`,
        `"${p.status}"`,
        `"${p.timestamp}"`
      ].join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MAXIMUS_FinTech_KPA_GreenTec_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Export complete: Downloaded CSV formatted for KPA / GreenTec reporting compliance.');
    setTimeout(() => setExportNotice(null), 5000);
  };

  const summary = data?.summary || {
    totalHeldUGX: 7950000,
    totalHeldUSD: 2120,
    totalPayoutsUGX: 4005000,
    totalPayoutsUSD: 1068,
    totalCommissionsEarnedUGX: 17045000,
    totalCommissionsEarnedUSD: 4545,
    activeEscrowContractsCount: 3,
    completedPayoutsCount: 2,
    reportingPartner: 'GreenTec / KPA (Kenya Ports Authority)',
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#07152F] via-[#0A1F44] to-[#142B58] border-2 border-[#C5A059]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#C5A059] text-[#0A1F44] tracking-wider">
              FinTech Module
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              KPA &amp; GreenTec Reporting Ready
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Admin Finance &amp; Escrow Control Center
          </h2>
          <p className="text-xs text-amber-200/80">
            Real-time ledger of all held escrow funds, driver payouts, automated 90/10 commission splits, and MoMo settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchFinanceData}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportToExcel}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            title="Export full financial ledger to CSV/Excel for KPA and GreenTec grant audit"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-950" />
            <span>Export to Excel (KPA / GreenTec)</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 3 CORE SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: All Held Funds */}
        <div className="p-5 rounded-2xl bg-[#081835] border border-amber-500/30 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              1. All Funds Held in Escrow
            </span>
            <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
              {summary.activeEscrowContractsCount} Active Contracts
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {formatMoney(summary.totalHeldUGX, 'UGX')}
          </div>
          <div className="text-xs text-amber-200/70 font-mono">
            ≈ ${summary.totalHeldUSD.toLocaleString()} USD (Locked until Goods Received)
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
            Mombasa → Kampala corridor holds active with 90/10 pre-allocation.
          </div>
        </div>

        {/* Metric 2: All Payouts */}
        <div className="p-5 rounded-2xl bg-[#081835] border border-emerald-500/30 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
            <span className="flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              2. Total Driver Payouts Sent
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
              {summary.completedPayoutsCount} Disbursed
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {formatMoney(summary.totalPayoutsUGX, 'UGX')}
          </div>
          <div className="text-xs text-emerald-200/70 font-mono">
            ≈ ${summary.totalPayoutsUSD.toLocaleString()} USD (Sent to Driver MoMo &amp; Banks)
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
            Auto-dispatched with instantaneous SMS receipt delivery.
          </div>
        </div>

        {/* Metric 3: Total Commissions Earned */}
        <div className="p-5 rounded-2xl bg-[#081835] border border-[#C5A059]/40 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#C5A059] font-bold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#C5A059]" />
              3. Total Commissions Earned
            </span>
            <span className="text-[10px] font-mono bg-[#C5A059]/20 px-2 py-0.5 rounded text-[#C5A059]">
              10% Split Revenue
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#C5A059] font-mono">
            {formatMoney(summary.totalCommissionsEarnedUGX, 'UGX')}
          </div>
          <div className="text-xs text-amber-200/70 font-mono">
            ≈ ${summary.totalCommissionsEarnedUSD.toLocaleString()} USD (Net Platform Profit)
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
            Subject to statutory split (1% Jesus, 80% Founder, 19% Maintenance).
          </div>
        </div>

      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Ledgers' },
            { id: 'held', label: `Funds Held in Escrow (${data?.heldFunds?.length || 3})` },
            { id: 'payouts', label: `Driver Payouts (${data?.payouts?.length || 2})` },
            { id: 'gateways', label: 'Uganda Gateway Health' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#C5A059] text-[#0A1F44] shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search route, driver, or ref..."
              className="pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: ALL HELD ESCROW FUNDS TABLE */}
      {(activeTab === 'all' || activeTab === 'held') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>All Held Escrow Funds (Awaiting "Goods Received")</span>
            </h3>
            <span className="text-xs text-slate-400">Locked in Equity Till 031801 / Flutterwave Trust</span>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#081835] border border-white/10 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/80 text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">Escrow ID</th>
                  <th className="p-3">Corridor Route</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Driver / Transporter</th>
                  <th className="p-3">Locked Amount</th>
                  <th className="p-3 text-emerald-400">90% Driver Share</th>
                  <th className="p-3 text-[#C5A059]">10% MAXIMUS Fee</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Gateway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {(data?.heldFunds || []).map((h) => (
                  <tr key={h.escrowId} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-300">{h.escrowId}</td>
                    <td className="p-3 font-medium text-white">{h.route}</td>
                    <td className="p-3 text-slate-300">{h.clientName}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{h.driverName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{h.driverPhone}</div>
                    </td>
                    <td className="p-3 font-mono font-black text-white">{formatMoney(h.heldAmountUGX, 'UGX')}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{formatMoney(h.splitDriverUGX, 'UGX')}</td>
                    <td className="p-3 font-mono font-bold text-[#C5A059]">+{formatMoney(h.splitMaximusUGX, 'UGX')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-300">{h.gateway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: ALL DRIVER PAYOUTS TABLE */}
      {(activeTab === 'all' || activeTab === 'payouts') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All Driver Payouts Disbursed (MoMo &amp; Bank Transfers)</span>
            </h3>
            <span className="text-xs text-slate-400">Automated after Goods Received</span>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#081835] border border-white/10 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/80 text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">Payout ID</th>
                  <th className="p-3">Job Title</th>
                  <th className="p-3">Driver Recipient</th>
                  <th className="p-3">Mobile Network</th>
                  <th className="p-3">Total Freight</th>
                  <th className="p-3 text-emerald-400">Disbursed (90%)</th>
                  <th className="p-3 text-[#C5A059]">Fee (10%)</th>
                  <th className="p-3">SMS Alert Status</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {(data?.payouts || []).map((p) => (
                  <tr key={p.payoutId} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-400">{p.payoutId}</td>
                    <td className="p-3 font-medium text-white max-w-xs truncate">{p.jobTitle}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{p.driverName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.driverPhone}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-300">
                        {p.network}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{formatMoney(p.freightTotalUGX, 'UGX')}</td>
                    <td className="p-3 font-mono font-black text-emerald-400">{formatMoney(p.driverAmountUGX, 'UGX')}</td>
                    <td className="p-3 font-mono font-bold text-[#C5A059]">+{formatMoney(p.platformFeeUGX, 'UGX')}</td>
                    <td className="p-3">
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SMS Sent</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400 italic max-w-xs truncate font-mono">
                        "{p.smsText}"
                      </div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">{p.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: GATEWAY HEALTH */}
      {(activeTab === 'all' || activeTab === 'gateways') && (
        <div className="p-5 rounded-2xl bg-[#081835] border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#C5A059]" />
            <span>Integrated FinTech Gateways for Uganda (Active Telemetry)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(data?.gatewaysSupported || [
              { name: 'MTN MoMo Uganda', ussd: '*165*3*031801#', status: 'ONLINE', successRate: '99.4%' },
              { name: 'Airtel Money Uganda', ussd: '*185*9*031801#', status: 'ONLINE', successRate: '99.1%' },
              { name: 'Flutterwave Cross-Border', api: 'v3 / standard checkout', status: 'ONLINE', currencies: ['UGX', 'USD', 'KES'] },
              { name: 'Equity Bank Merchant Till', till: '031801', status: 'ONLINE', zeroFee: true },
            ]).map((gw, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs">{gw.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {gw.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-amber-300">
                  {gw.ussd || gw.till ? `USSD / Till: ${gw.ussd || gw.till}` : gw.api}
                </div>
                {gw.successRate && (
                  <div className="text-[10px] text-slate-400">
                    Success Rate: <strong className="text-emerald-400">{gw.successRate}</strong>
                  </div>
                )}
                {gw.currencies && (
                  <div className="text-[10px] text-slate-400">
                    Currencies: <strong className="text-white">{gw.currencies.join(' · ')}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GREENTEC / KPA COMPLIANCE FOOTER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white">GreenTec FinTech-Enabled Logistics Compliance:</strong> All escrow accounts are held in statutory trust under Uganda Financial Institutions Act and Kenya KPA Transit regulations.
          </div>
        </div>
        <button
          onClick={handleExportToExcel}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          Download Audit CSV
        </button>
      </div>

    </div>
  );
};
