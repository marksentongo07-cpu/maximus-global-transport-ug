import React, { useState, useEffect } from 'react';
import { Job, Currency, Language } from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import { 
  calculateFuelEfficientRoute, 
  FuelEfficientRouteResult 
} from '../../services/fuelEfficientRouting';
import { 
  Fuel, 
  Leaf, 
  TrendingDown, 
  Clock, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Gauge,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';

interface FuelEfficientRouteModalProps {
  job: Job;
  currency: Currency;
  language?: Language;
  onClose: () => void;
  onApplyEcoRoute?: (jobId: string) => void;
}

export const FuelEfficientRouteModal: React.FC<FuelEfficientRouteModalProps> = ({
  job,
  currency,
  language = 'en',
  onClose,
  onApplyEcoRoute,
}) => {
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState<FuelEfficientRouteResult | null>(null);
  const [selectedView, setSelectedView] = useState<'eco' | 'standard'>('eco');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchRoute() {
      setLoading(true);
      const res = await calculateFuelEfficientRoute({
        origin: {
          lat: job.pickupLocation.lat,
          lng: job.pickupLocation.lng,
          name: job.pickupLocation.name,
        },
        destination: {
          lat: job.deliveryLocation.lat,
          lng: job.deliveryLocation.lng,
          name: job.deliveryLocation.name,
        },
        vehicleType: job.desiredVehicleType,
        cargoWeightTons: job.weightTons,
        emissionType: 'DIESEL',
      });
      if (isMounted) {
        setRouteData(res);
        setLoading(false);
      }
    }
    fetchRoute();
    return () => { isMounted = false; };
  }, [job]);

  const handleApply = () => {
    setApplied(true);
    if (onApplyEcoRoute) {
      onApplyEcoRoute(job.id);
    }
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B192C] via-emerald-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {t('googleMapsEcoOptimizer', language)}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t('ecoRoutesApi', language)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cargo: {job.title} ({job.weightTons} Tons · {job.desiredVehicleType.toUpperCase()})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mx-auto" />
            <div className="text-sm font-bold text-white">Calculating Topography &amp; Fuel Optimization...</div>
            <p className="text-xs text-slate-400">
              Querying Google Maps Routes API for fuel-efficient reference routes and diesel consumption curves.
            </p>
          </div>
        ) : routeData ? (
          <div className="p-5 space-y-5 overflow-y-auto">
            
            {/* Top Savings Callout Card */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 shadow-inner flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {t('transporterProfitAdvantage', language)}
                </span>
                <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                  <span className="text-emerald-400">+{formatMoney(routeData.savings.moneySavedUGX, currency)}</span>
                  <span className="text-xs text-slate-400 font-normal">{t('directFuelSaved', language)}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Saves <strong className="text-emerald-400 font-bold">{routeData.savings.litersSaved} Liters of Diesel</strong> (~{routeData.savings.percentageFuelSaved}% consumption reduction) and cuts <strong className="text-slate-200">{routeData.savings.co2AvertedKg} kg</strong> of CO₂.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-center px-3">
                  <div className="text-lg font-black text-emerald-400 font-mono">-{routeData.savings.percentageFuelSaved}%</div>
                  <div className="text-[9px] text-slate-400 uppercase">{t('fuelBurn', language)}</div>
                </div>
                <div className="p-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-center px-3">
                  <div className="text-lg font-black text-white font-mono">+{routeData.savings.litersSaved}L</div>
                  <div className="text-[9px] text-slate-400 uppercase">{t('dieselSaved', language)}</div>
                </div>
              </div>
            </div>

            {/* Route Selector Tabs (Side-by-side comparison) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">{t('compareRouteProfiles', language)}</div>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Option 1: Eco Route */}
                <button
                  type="button"
                  onClick={() => setSelectedView('eco')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedView === 'eco'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500 text-slate-950 uppercase">
                    {t('recommendedRoute', language)}
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('maximusFuelEfficientRoute', language)}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('dieselBurn', language)}</span>
                      <span className="font-bold text-emerald-400 font-mono">{routeData.fuelEfficientRoute.fuelLiters} Liters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('fuelCost', language)}</span>
                      <span className="font-mono text-white font-bold">{formatMoney(routeData.fuelEfficientRoute.fuelCostUGX, currency)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{t('distanceAndTime', language)}</span>
                      <span className="text-slate-300">{routeData.fuelEfficientRoute.distanceKm} km · ~{Math.floor(routeData.fuelEfficientRoute.durationMinutes / 60)}h {routeData.fuelEfficientRoute.durationMinutes % 60}m</span>
                    </div>
                  </div>
                </button>

                {/* Option 2: Standard Route */}
                <button
                  type="button"
                  onClick={() => setSelectedView('standard')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedView === 'standard'
                      ? 'bg-slate-800 border-slate-600 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('standardFastestRoute', language)}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('dieselBurn', language)}</span>
                      <span className="font-bold text-slate-200 font-mono">{routeData.standardRoute.fuelLiters} Liters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('fuelCost', language)}</span>
                      <span className="font-mono text-slate-300">{formatMoney(routeData.standardRoute.fuelCostUGX, currency)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{t('distanceAndTime', language)}</span>
                      <span className="text-slate-300">{routeData.standardRoute.distanceKm} km · ~{Math.floor(routeData.standardRoute.durationMinutes / 60)}h {routeData.standardRoute.durationMinutes % 60}m</span>
                    </div>
                  </div>
                </button>

              </div>
            </div>

            {/* Turn-by-Turn Waypoint Guidance for Minimum Fuel Consumption */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Fuel-Efficient Waypoints &amp; Throttle Strategy:</span>
                <span className="text-slate-500 text-[10px]">Optimized for heavy freight inertia</span>
              </div>

              <div className="space-y-2">
                {routeData.waypoints.map((wp, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{wp.instruction}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-mono whitespace-nowrap">
                        ~{wp.distanceKm} km · {wp.roadQuality}
                      </span>
                    </div>
                    <div className="pl-7 text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 shrink-0" />
                      <span>{wp.fuelTip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Eco-Haul Tactics */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                East African Corridor Eco-Driving Tips for Heavy Trucks:
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {routeData.ecoDrivingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center gap-3">
              <div className="text-[11px] text-slate-400">
                Route telemetry synced with Google Maps Routes Platform.
              </div>

              <button
                type="button"
                onClick={handleApply}
                disabled={applied}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Applied to Driver GPS!</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>Apply Fuel-Efficient Route</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
