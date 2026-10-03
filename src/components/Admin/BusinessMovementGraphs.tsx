import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Layers, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Globe,
  Sparkles,
  RefreshCw,
  Coins
} from 'lucide-react';
import { Currency } from '../../types';
import { formatMoney } from '../../services/currency';

interface BusinessMovementGraphsProps {
  currency: Currency;
  onCurrencyToggle?: () => void;
}

type Timeframe = '7d' | '30d' | '6m' | 'ytd';

interface DataPoint {
  label: string;
  gmvUGX: number;
  commissionUGX: number;
  tonnage: number;
  activeTrips: number;
  gmvUSD: number;
}

export const BusinessMovementGraphs: React.FC<BusinessMovementGraphsProps> = ({
  currency,
  onCurrencyToggle,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'tonnage' | 'trips'>('revenue');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Timeframe-specific business progression datasets
  const datasets: Record<Timeframe, DataPoint[]> = useMemo(() => ({
    '7d': [
      { label: 'Mon', gmvUGX: 185000000, commissionUGX: 16650000, tonnage: 480, activeTrips: 18, gmvUSD: 50000 },
      { label: 'Tue', gmvUGX: 220000000, commissionUGX: 19800000, tonnage: 590, activeTrips: 22, gmvUSD: 59450 },
      { label: 'Wed', gmvUGX: 295000000, commissionUGX: 26550000, tonnage: 740, activeTrips: 31, gmvUSD: 79720 },
      { label: 'Thu', gmvUGX: 310000000, commissionUGX: 27900000, tonnage: 810, activeTrips: 34, gmvUSD: 83780 },
      { label: 'Fri', gmvUGX: 390000000, commissionUGX: 35100000, tonnage: 1050, activeTrips: 42, gmvUSD: 105400 },
      { label: 'Sat', gmvUGX: 260000000, commissionUGX: 23400000, tonnage: 690, activeTrips: 26, gmvUSD: 70270 },
      { label: 'Sun', gmvUGX: 182500000, commissionUGX: 16425000, tonnage: 490, activeTrips: 19, gmvUSD: 49320 },
    ],
    '30d': [
      { label: 'Week 1', gmvUGX: 340000000, commissionUGX: 30600000, tonnage: 920, activeTrips: 38, gmvUSD: 91890 },
      { label: 'Week 2', gmvUGX: 420000000, commissionUGX: 37800000, tonnage: 1140, activeTrips: 48, gmvUSD: 113510 },
      { label: 'Week 3', gmvUGX: 510000000, commissionUGX: 45900000, tonnage: 1390, activeTrips: 62, gmvUSD: 137830 },
      { label: 'Week 4', gmvUGX: 572500000, commissionUGX: 51525000, tonnage: 1560, activeTrips: 71, gmvUSD: 154720 },
    ],
    '6m': [
      { label: 'May', gmvUGX: 1150000000, commissionUGX: 103500000, tonnage: 3100, activeTrips: 140, gmvUSD: 310800 },
      { label: 'Jun', gmvUGX: 1320000000, commissionUGX: 118800000, tonnage: 3580, activeTrips: 162, gmvUSD: 356750 },
      { label: 'Jul', gmvUGX: 1480000000, commissionUGX: 133200000, tonnage: 4020, activeTrips: 185, gmvUSD: 400000 },
      { label: 'Aug', gmvUGX: 1640000000, commissionUGX: 147600000, tonnage: 4450, activeTrips: 205, gmvUSD: 443240 },
      { label: 'Sep', gmvUGX: 1790000000, commissionUGX: 161100000, tonnage: 4850, activeTrips: 228, gmvUSD: 483780 },
      { label: 'Oct (Current)', gmvUGX: 1842500000, commissionUGX: 168400000, tonnage: 5120, activeTrips: 242, gmvUSD: 498000 },
    ],
    'ytd': [
      { label: 'Q1 2026', gmvUGX: 2850000000, commissionUGX: 256500000, tonnage: 7800, activeTrips: 340, gmvUSD: 770270 },
      { label: 'Q2 2026', gmvUGX: 3940000000, commissionUGX: 354600000, tonnage: 10700, activeTrips: 480, gmvUSD: 1064860 },
      { label: 'Q3 2026', gmvUGX: 4920000000, commissionUGX: 442800000, tonnage: 13400, activeTrips: 610, gmvUSD: 1329720 },
      { label: 'Q4 2026 (Pacing)', gmvUGX: 5850000000, commissionUGX: 526500000, tonnage: 15900, activeTrips: 740, gmvUSD: 1581080 },
    ],
  }), []);

  const activeData = datasets[timeframe];

  // Aggregate totals
  const totalGMV = useMemo(() => activeData.reduce((acc, curr) => acc + curr.gmvUGX, 0), [activeData]);
  const totalCommission = useMemo(() => activeData.reduce((acc, curr) => acc + curr.commissionUGX, 0), [activeData]);
  const totalTonnage = useMemo(() => activeData.reduce((acc, curr) => acc + curr.tonnage, 0), [activeData]);
  const totalTrips = useMemo(() => activeData.reduce((acc, curr) => acc + curr.activeTrips, 0), [activeData]);

  // Corridor Distribution Data
  const corridorBreakdown = [
    {
      name: 'Guangzhou ➔ Mombasa ➔ Kampala Corridor',
      share: 38,
      tonnage: Math.round(totalTonnage * 0.38),
      revenueUGX: Math.round(totalGMV * 0.42),
      color: '#C9A86A',
      tag: 'International Cross-Border',
    },
    {
      name: 'Dar es Salaam Port ➔ Kampala Corridor',
      share: 24,
      tonnage: Math.round(totalTonnage * 0.24),
      revenueUGX: Math.round(totalGMV * 0.23),
      color: '#38BDF8',
      tag: 'Tanzania Rail/Road Link',
    },
    {
      name: 'Domestic Uganda Trunk Routes (Gulu, Mbale, Mbarara)',
      share: 26,
      tonnage: Math.round(totalTonnage * 0.26),
      revenueUGX: Math.round(totalGMV * 0.22),
      color: '#10B981',
      tag: 'Uganda Regional Logistics',
    },
    {
      name: 'Great Lakes Regional (DRC Goma / South Sudan Juba)',
      share: 12,
      tonnage: Math.round(totalTonnage * 0.12),
      revenueUGX: Math.round(totalGMV * 0.13),
      color: '#A855F7',
      tag: 'High-Margin Transit',
    },
  ];

  // SVG Chart Geometry Calculation
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = useMemo(() => {
    if (activeMetric === 'revenue') return Math.max(...activeData.map(d => d.gmvUGX)) * 1.15;
    if (activeMetric === 'tonnage') return Math.max(...activeData.map(d => d.tonnage)) * 1.15;
    return Math.max(...activeData.map(d => d.activeTrips)) * 1.15;
  }, [activeData, activeMetric]);

  const points = useMemo(() => {
    const usableW = chartWidth - paddingX * 2;
    const usableH = chartHeight - paddingY * 2;

    return activeData.map((d, i) => {
      const x = paddingX + (i / (activeData.length - 1 || 1)) * usableW;
      const currentMetricValue = activeMetric === 'revenue' 
        ? d.gmvUGX 
        : activeMetric === 'tonnage' 
        ? d.tonnage 
        : d.activeTrips;
      const y = chartHeight - paddingY - (currentMetricValue / (maxVal || 1)) * usableH;
      return { x, y, data: d };
    });
  }, [activeData, activeMetric, maxVal]);

  const commissionPoints = useMemo(() => {
    if (activeMetric !== 'revenue') return [];
    const usableW = chartWidth - paddingX * 2;
    const usableH = chartHeight - paddingY * 2;

    return activeData.map((d, i) => {
      const x = paddingX + (i / (activeData.length - 1 || 1)) * usableW;
      // Scale commission relative to maxVal (scaled visually for clarity)
      const scaledCommission = (d.commissionUGX * 4); // amplified visually
      const y = chartHeight - paddingY - (scaledCommission / (maxVal || 1)) * usableH;
      return { x, y, val: d.commissionUGX };
    });
  }, [activeData, activeMetric, maxVal]);

  // Generate SVG Path String
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = chartHeight - paddingY;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [linePath, points]);

  const commissionLinePath = useMemo(() => {
    if (commissionPoints.length === 0) return '';
    return commissionPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [commissionPoints]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Vault Top Controls Bar */}
      <div className="p-5 rounded-3xl bg-[#0B1526] border border-[#C9A86A]/40 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C9A86A] text-[#0A1931]">
              Owner Analytics Vault
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Telemetry Feed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#C9A86A]" />
            <span>How Business is Moving · Maximus Freight Momentum</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time Gross Merchandise Volume, 8%–12% escrow commission velocity, corridor tonnages, and cashflow turnover.
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-1 bg-black/60 border border-white/10 rounded-2xl text-xs font-bold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '6m', label: '6 Months' },
              { id: 'ytd', label: '2026 Year-to-Date' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as Timeframe)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-[#C9A86A] text-[#0A1931] shadow-md scale-102 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {onCurrencyToggle && (
            <button
              onClick={onCurrencyToggle}
              className="px-3 py-2 rounded-2xl bg-slate-900 border border-white/10 hover:border-[#C9A86A] text-xs font-mono font-bold text-amber-300 transition-colors cursor-pointer"
            >
              Currency: {currency}
            </button>
          )}
        </div>
      </div>

      {/* 4 Sparkline Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Gross Merchandise Volume */}
        <div 
          onClick={() => setActiveMetric('revenue')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
            activeMetric === 'revenue' 
              ? 'bg-[#0f1f38] border-[#C9A86A] shadow-[#C9A86A]/10 scale-[1.02]' 
              : 'bg-[#0B1526] border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Gross Freight GMV</span>
            <div className="p-1.5 rounded-lg bg-[#C9A86A]/20 text-[#C9A86A]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {formatMoney(totalGMV, currency)}
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/5">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +32.4% MoM
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ≈ ${(Math.round(totalGMV / 3750)).toLocaleString()} USD
            </span>
          </div>
        </div>

        {/* Metric 2: Net Maximus Commission */}
        <div 
          onClick={() => setActiveMetric('revenue')}
          className="p-5 rounded-2xl bg-[#0B1526] border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-xl cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Net Platform Cut (8%-12%)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {formatMoney(totalCommission, currency)}
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/5">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +28.1% Velocity
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Held in Equity Till 031801
            </span>
          </div>
        </div>

        {/* Metric 3: Total Cargo Tonnage */}
        <div 
          onClick={() => setActiveMetric('tonnage')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
            activeMetric === 'tonnage' 
              ? 'bg-[#0f1f38] border-sky-400 shadow-sky-400/10 scale-[1.02]' 
              : 'bg-[#0B1526] border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Tonnage Transported</span>
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {totalTonnage.toLocaleString()} Tons
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/5">
            <span className="text-sky-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +19.7% Corridor Volume
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Containers &amp; Breakbulk
            </span>
          </div>
        </div>

        {/* Metric 4: Fleet & Completed Shipments */}
        <div 
          onClick={() => setActiveMetric('trips')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xl ${
            activeMetric === 'trips' 
              ? 'bg-[#0f1f38] border-purple-400 shadow-purple-400/10 scale-[1.02]' 
              : 'bg-[#0B1526] border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Dispatches</span>
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {totalTrips.toLocaleString()} Shipments
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/5">
            <span className="text-purple-300 font-bold">
              342 Verified Trucks Active
            </span>
            <span className="text-emerald-400 font-bold text-[11px]">
              98.4% On-Time
            </span>
          </div>
        </div>

      </div>

      {/* Main Graph Card */}
      <div className="p-6 rounded-3xl bg-[#0B1526] border border-[#C9A86A]/30 shadow-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="text-xs uppercase font-extrabold text-[#C9A86A] tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C9A86A]" />
              <span>Revenue &amp; Momentum Velocity Graph</span>
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">
              {activeMetric === 'revenue' 
                ? 'Gross Merchandise Volume (Gold) vs Net Commission (Emerald)' 
                : activeMetric === 'tonnage' 
                ? 'Tonnage Moved Across Trade Corridors (Metric Tons)' 
                : 'Shipment Trips Dispatched & Completed'}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#C9A86A]" />
              <span className="text-slate-300 font-bold">Gross Volume (GMV)</span>
            </div>
            {activeMetric === 'revenue' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">Platform Cut (4x View)</span>
              </div>
            )}
          </div>
        </div>

        {/* Visual Responsive SVG Chart */}
        <div className="relative w-full overflow-hidden pt-2 pb-4">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-64 overflow-visible"
          >
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C9A86A" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#C9A86A" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
              const y = chartHeight - paddingY - (chartHeight - paddingY * 2) * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.3)"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {activeMetric === 'revenue' 
                      ? `${Math.round((maxVal * ratio) / 1000000)}M`
                      : Math.round(maxVal * ratio)}
                  </text>
                </g>
              );
            })}

            {/* Area under curve */}
            <path d={areaPath} fill="url(#goldGradient)" />

            {/* Main GMV Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#C9A86A"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Secondary Commission Line */}
            {activeMetric === 'revenue' && (
              <path
                d={commissionLinePath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2 1"
              />
            )}

            {/* Interactive Data Nodes */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPointIndex === idx;
              return (
                <g
                  key={idx}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                >
                  {/* Vertical Guide when hovered */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={chartHeight - paddingY}
                      stroke="#C9A86A"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill="#0B1526"
                    stroke="#C9A86A"
                    strokeWidth="3"
                  />

                  {/* X-Axis Period Label */}
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill={isHovered ? '#C9A86A' : 'rgba(255,255,255,0.6)'}
                    fontSize="10"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fontFamily="monospace"
                  >
                    {pt.data.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPointIndex !== null && points[hoveredPointIndex] && (
            <div className="mt-3 p-3.5 bg-black/85 border border-[#C9A86A] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A86A] animate-pulse" />
                <span className="font-mono font-bold text-white uppercase">
                  Period: {points[hoveredPointIndex].data.label}
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">GMV Volume:</span>
                  <strong className="text-[#C9A86A] text-sm">
                    {formatMoney(points[hoveredPointIndex].data.gmvUGX, currency)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Maximus Cut:</span>
                  <strong className="text-emerald-400 text-sm">
                    {formatMoney(points[hoveredPointIndex].data.commissionUGX, currency)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tonnage Moved:</span>
                  <strong className="text-white text-sm">
                    {points[hoveredPointIndex].data.tonnage} Tons
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Corridor Breakdown & Escrow Turnover Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card A: Top Freight Corridors Progression */}
        <div className="p-6 rounded-3xl bg-[#0B1526] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div className="text-[11px] uppercase font-bold text-[#C9A86A] tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#C9A86A]" />
                <span>Trade Corridors Traffic</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">Top Haulage Routes by Tonnage &amp; Flow</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C9A86A]/20 text-[#C9A86A]">
              Cross-Border &amp; Domestic
            </span>
          </div>

          <div className="space-y-4">
            {corridorBreakdown.map((corridor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: corridor.color }} 
                    />
                    <span className="truncate max-w-[240px] sm:max-w-none">{corridor.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <strong className="text-white">{corridor.share}%</strong>
                    <span className="text-slate-400 text-[11px] ml-1.5">({corridor.tonnage}T)</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${corridor.share}%`, backgroundColor: corridor.color }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-0.5">
                  <span>Category: {corridor.tag}</span>
                  <span className="text-[#C9A86A] font-semibold">{formatMoney(corridor.revenueUGX, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card B: TrustVault Cashflow & Settlement Velocity */}
        <div className="p-6 rounded-3xl bg-[#0B1526] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>TrustVault Liquidity Dynamics</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">Escrow Inflow &amp; Payout Turnaround</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
              Equity Bank Till 031801
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-white/5 space-y-1">
              <span className="text-slate-400 block text-[11px]">Average Release Cycle:</span>
              <div className="text-xl font-black text-emerald-400 font-mono">14.2 Minutes</div>
              <p className="text-[10px] text-slate-400 leading-tight">Post-digital POD sign-off directly to driver MoMo / Bank</p>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-white/5 space-y-1">
              <span className="text-slate-400 block text-[11px]">Fraud &amp; Cargo Loss Rate:</span>
              <div className="text-xl font-black text-white font-mono">0.00%</div>
              <p className="text-[10px] text-slate-400 leading-tight">Zero losses thanks to Bank-Grade NIN &amp; Logbook vetting</p>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-white/5 space-y-1">
              <span className="text-slate-400 block text-[11px]">URA Fiscal Invoicing:</span>
              <div className="text-xl font-black text-sky-400 font-mono">100% EFRIS</div>
              <p className="text-[10px] text-slate-400 leading-tight">Automated FDIN QR code generated on escrow settlement</p>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-white/5 space-y-1">
              <span className="text-slate-400 block text-[11px]">Daily Till Turnaround:</span>
              <div className="text-xl font-black text-[#C9A86A] font-mono">
                {formatMoney(Math.round(totalGMV * 0.14), currency)}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Real-time settlement pool in Equity Bank Uganda</p>
            </div>
          </div>

          {/* Quick Summary Note */}
          <div className="p-3 bg-black/40 rounded-xl border border-emerald-500/20 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A86A]" />
              <span>System operational health score:</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">99.8% Perfect SLA</span>
          </div>
        </div>

      </div>

    </div>
  );
};
