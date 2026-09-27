import React, { useState, useEffect } from 'react';
import { Job, Currency, Language } from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import {
  SmartBiddingAnalysis,
  BiddingStrategyOption,
  fetchSmartBiddingAnalysis,
  findSimilarHistoricalComps,
  generateLocalSmartBiddingAnalysis,
} from '../../services/smartBiddingService';
import {
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Fuel,
  Compass,
  ArrowRight,
  Truck,
  Coins,
  Bot
} from 'lucide-react';

interface SmartBiddingAssistantProps {
  job: Job;
  currency: Currency;
  language?: Language;
  historicalJobs?: Job[];
  onApplyOffer: (priceUGX: number, pitchMessage: string) => void;
  isTransporter: boolean;
}

export const SmartBiddingAssistant: React.FC<SmartBiddingAssistantProps> = ({
  job,
  currency,
  language = 'en',
  historicalJobs = [],
  onApplyOffer,
  isTransporter,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<SmartBiddingAnalysis | null>(null);
  const [showHistoricalComps, setShowHistoricalComps] = useState<boolean>(false);
  const [appliedStrategyKey, setAppliedStrategyKey] = useState<string | null>(null);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const result = await fetchSmartBiddingAnalysis(job, historicalJobs, language);
      setAnalysis(result);
    } catch (e) {
      console.error('Error fetching smart bidding analysis:', e);
      const comps = findSimilarHistoricalComps(job, historicalJobs);
      setAnalysis(generateLocalSmartBiddingAnalysis(job, comps, language));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [job.id, language]);

  const handleApply = (strategy: BiddingStrategyOption) => {
    onApplyOffer(strategy.recommendedPriceUGX, strategy.suggestedMessage);
    setAppliedStrategyKey(strategy.key);
    setTimeout(() => {
      setAppliedStrategyKey(null);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 my-3 shadow-xl backdrop-blur-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="h-4 w-48 bg-slate-800 rounded mb-1.5"></div>
              <div className="h-3 w-64 bg-slate-850 rounded"></div>
            </div>
          </div>
          <div className="h-7 w-28 bg-slate-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="h-32 bg-slate-900/60 rounded-xl border border-slate-800"></div>
          <div className="h-32 bg-slate-900/60 rounded-xl border border-slate-800"></div>
          <div className="h-32 bg-slate-900/60 rounded-xl border border-slate-800"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { strategies, marketDynamics, historicalComps } = analysis;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/35 rounded-2xl p-4 sm:p-5 my-2 shadow-2xl overflow-hidden relative">
      
      {/* Top Banner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                {t('smartBiddingTitle', language)}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Gemini 3.8 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {t('smartBiddingSubtitle', language)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnalysis}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
            title={t('reanalyzeLiveRates', language)}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('reanalyzeLiveRates', language)}</span>
          </button>
        </div>
      </div>

      {/* Corridor Benchmark Snapshot Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 my-2 bg-slate-950/70 border border-slate-800/70 rounded-xl px-3 text-[11px]">
        <div>
          <span className="text-slate-400 block text-[10px]">{t('corridor', language)}:</span>
          <span className="font-semibold text-slate-200 line-clamp-1" title={analysis.routeCorridor}>
            {analysis.routeCorridor}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">{t('historicalAvgRate', language)}:</span>
          <span className="font-bold text-amber-400">
            {formatMoney(analysis.corridorAverageRatePerKmUGX, currency)} / km
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">{t('demandIndex', language)}:</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {marketDynamics.demandLevel} Demand
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">{t('backhaulRisk', language)}:</span>
          <span className="font-semibold text-sky-400">
            {marketDynamics.backhaulRisk} Risk
          </span>
        </div>
      </div>

      {/* Suggested 3 Counter-Offer Value Cards */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            {t('aiBiddingStrategies', language)}
          </span>
          <span className="text-[10px] text-slate-400">
            Click &apos;Apply to Offer&apos; to load price &amp; negotiation pitch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          
          {/* 1. AGGRESSIVE (FAST CLOSE) */}
          <div className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-slate-300">
                  {t('fastCloseCompetitive', language)}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {strategies.aggressive.winProbabilityPercent}% Win
                </span>
              </div>

              <div className="mt-1.5 mb-1">
                <div className="text-base sm:text-lg font-black text-white">
                  {formatMoney(strategies.aggressive.recommendedPriceUGX, currency)}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <span>Net Payout:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatMoney(strategies.aggressive.estimatedNetProfitUGX, currency)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {strategies.aggressive.rationale}
              </p>
            </div>

            <button
              onClick={() => handleApply(strategies.aggressive)}
              disabled={!isTransporter}
              className={`mt-2.5 w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                appliedStrategyKey === 'aggressive'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white'
              }`}
            >
              {appliedStrategyKey === 'aggressive' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>{t('offerApplied', language)}</span>
                </>
              ) : (
                <>
                  <span>{t('applyToOffer', language)}</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* 2. BALANCED (RECOMMENDED SWEET SPOT) */}
          <div className="bg-gradient-to-b from-amber-950/20 to-slate-950 border-2 border-amber-500/50 rounded-xl p-3 flex flex-col justify-between shadow-lg relative">
            <div className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
              Recommended Sweet Spot
            </div>

            <div>
              <div className="flex items-center justify-between gap-1 mb-1 mt-0.5">
                <span className="text-[11px] font-bold text-amber-300">
                  {t('balancedSweetSpot', language)}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {strategies.balanced.winProbabilityPercent}% Win
                </span>
              </div>

              <div className="mt-1.5 mb-1">
                <div className="text-base sm:text-lg font-black text-amber-400">
                  {formatMoney(strategies.balanced.recommendedPriceUGX, currency)}
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <span>Net Payout:</span>
                  <span className="font-semibold text-amber-300">
                    {formatMoney(strategies.balanced.estimatedNetProfitUGX, currency)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {strategies.balanced.rationale}
              </p>
            </div>

            <button
              onClick={() => handleApply(strategies.balanced)}
              disabled={!isTransporter}
              className={`mt-2.5 w-full py-1.5 px-2.5 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-md ${
                appliedStrategyKey === 'balanced'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {appliedStrategyKey === 'balanced' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('offerApplied', language)}</span>
                </>
              ) : (
                <>
                  <span>{t('applyToOffer', language)}</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* 3. PREMIUM MARGIN (MAX YIELD) */}
          <div className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-slate-300">
                  {t('premiumYield', language)}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {strategies.premium.winProbabilityPercent}% Win
                </span>
              </div>

              <div className="mt-1.5 mb-1">
                <div className="text-base sm:text-lg font-black text-white">
                  {formatMoney(strategies.premium.recommendedPriceUGX, currency)}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <span>Net Payout:</span>
                  <span className="font-semibold text-purple-400">
                    {formatMoney(strategies.premium.estimatedNetProfitUGX, currency)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {strategies.premium.rationale}
              </p>
            </div>

            <button
              onClick={() => handleApply(strategies.premium)}
              disabled={!isTransporter}
              className={`mt-2.5 w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                appliedStrategyKey === 'premium'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white'
              }`}
            >
              {appliedStrategyKey === 'premium' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>{t('offerApplied', language)}</span>
                </>
              ) : (
                <>
                  <span>{t('applyToOffer', language)}</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Corridor Dynamics & Tactical Advice */}
      <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[10px] sm:text-[11px] text-slate-400">
            <strong className="text-slate-200">{t('routeDynamics', language)}:</strong>{' '}
            {marketDynamics.corridorAdvice}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono shrink-0">
          {marketDynamics.fuelSensitivity}
        </div>
      </div>

      {/* Historical Comps Expandable Accordion */}
      <div className="mt-2.5 border-t border-slate-800/80 pt-2">
        <button
          onClick={() => setShowHistoricalComps(!showHistoricalComps)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            {t('historicalCompsTitle', language)} ({historicalComps.length} {t('events', language)})
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            {showHistoricalComps ? 'Hide Comps' : 'View Comps'}
            {showHistoricalComps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showHistoricalComps && (
          <div className="mt-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2 px-3">Cargo &amp; Route</th>
                  <th className="py-2 px-2">Vehicle</th>
                  <th className="py-2 px-2">Dist.</th>
                  <th className="py-2 px-2 text-right">Closed Fare</th>
                  <th className="py-2 px-2 text-right">Rate/Km</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[10px]">
                {historicalComps.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-900/40 text-slate-300">
                    <td className="py-2 px-3 font-sans">
                      <div className="font-bold text-white line-clamp-1">{comp.title}</div>
                      <div className="text-[10px] text-slate-400">{comp.route}</div>
                    </td>
                    <td className="py-2 px-2 font-sans capitalize text-slate-300">
                      {comp.vehicleType.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-2 text-slate-300">{comp.distanceKm} km</td>
                    <td className="py-2 px-2 text-right font-bold text-amber-400">
                      {formatMoney(comp.finalPriceUGX, currency)}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">
                      {formatMoney(comp.ratePerKmUGX, currency)}/km
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        {comp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
