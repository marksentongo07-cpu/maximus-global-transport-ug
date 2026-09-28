import React, { useState } from 'react';
import { Job, Currency, Transporter, Language } from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import { 
  Package, 
  Clock, 
  MapPin, 
  Truck, 
  Coins, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  Phone, 
  Star, 
  Navigation, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Plus,
  LocateFixed,
  X
} from 'lucide-react';
import { LeafletLiveFleetMap } from '../Map/LeafletLiveFleetMap';

interface ClientDashboardProps {
  jobs: Job[];
  currency: Currency;
  language?: Language;
  onOpenPostJob: () => void;
  onOpenNegotiation: (job: Job) => void;
  onOpenEscrow: (job: Job) => void;
  onOpenPOD: (job: Job) => void;
  onOpenInvoice: (job: Job) => void;
  onOpenDispute: (job: Job) => void;
  onRateTransporter: (jobId: string, rating: number, comment: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  jobs,
  currency,
  language = 'en',
  onOpenPostJob,
  onOpenNegotiation,
  onOpenEscrow,
  onOpenPOD,
  onOpenInvoice,
  onOpenDispute,
  onRateTransporter,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'open' | 'delivered'>('all');
  const [callingTransporter, setCallingTransporter] = useState<string | null>(null);
  const [ratingJob, setRatingJob] = useState<Job | null>(null);
  const [starCount, setStarCount] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [trackingMapJobId, setTrackingMapJobId] = useState<string | null>(null);

  const activeShipments = jobs.filter(j => j.status === 'in_transit' || j.status === 'loaded' || j.status === 'booked');
  const openNegotiatingJobs = jobs.filter(j => j.status === 'open' || j.status === 'negotiating' || j.status === 'escrow_pending');
  const deliveredJobs = jobs.filter(j => j.status === 'delivered');

  const filteredJobs = jobs.filter((j) => {
    if (filterTab === 'active') return j.status === 'in_transit' || j.status === 'loaded' || j.status === 'booked';
    if (filterTab === 'open') return j.status === 'open' || j.status === 'negotiating' || j.status === 'escrow_pending';
    if (filterTab === 'delivered') return j.status === 'delivered';
    return true;
  });

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'in_transit':
        return <span className="text-amber-400 font-bold flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 animate-spin" /> {t('statusInTransit', language)}</span>;
      case 'loaded':
        return <span className="text-cyan-400 font-bold">{t('statusLoaded', language)}</span>;
      case 'booked':
        return <span className="text-emerald-400 font-bold">{t('statusBooked', language)}</span>;
      case 'escrow_pending':
        return <span className="text-amber-300 font-bold">{t('statusEscrowPending', language)}</span>;
      case 'negotiating':
        return <span className="text-sky-400 font-bold">{t('statusNegotiating', language)}</span>;
      case 'open':
        return <span className="text-slate-300 font-medium">{t('statusOpen', language)}</span>;
      case 'delivered':
        return <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {t('statusDelivered', language)}</span>;
      case 'disputed':
        return <span className="text-rose-400 font-bold">{t('statusDisputed', language)}</span>;
      default:
        return <span className="text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="bg-[#1a2a3f] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-700 border border-white/10 flex items-center justify-center text-white">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{activeShipments.length}</div>
            <div className="text-[14px] text-white/60 font-medium">{t('activeShipmentsRoad', language)}</div>
          </div>
        </div>

        <div className="bg-[#1a2a3f] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-700 border border-white/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {formatMoney(
                activeShipments.reduce((acc, j) => acc + (j.agreedPriceUGX || j.marketPriceEstimateUGX), 0),
                currency
              )}
            </div>
            <div className="text-[14px] text-white/60 font-medium">{t('protectedInEscrow', language)}</div>
          </div>
        </div>

        <div className="bg-[#1a2a3f] border border-white/10 p-5 rounded-2xl shadow-xl backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-700 border border-white/10 flex items-center justify-center text-cyan-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">{deliveredJobs.length}</div>
              <div className="text-[14px] text-white/60 font-medium">{t('safeDeliveriesCompleted', language)}</div>
            </div>
          </div>
          <button
            onClick={onOpenPostJob}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>{t('postLoad', language)}</span>
          </button>
        </div>

      </div>

      {/* Filter Tabs & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-[18px] font-bold text-white tracking-tight">{t('cargoHaulageShipments', language)}</h2>
          <p className="text-[14px] text-white/60 leading-6">{t('monitorNegotiations', language)}</p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-[#1a2a3f] border border-white/10 rounded-full shadow-inner">
          {[
            { id: 'all', label: `${t('allLoads', language)} (${jobs.length})` },
            { id: 'active', label: `${t('inTransit', language)} (${activeShipments.length})` },
            { id: 'open', label: `${t('bidding', language)} (${openNegotiatingJobs.length})` },
            { id: 'delivered', label: `${t('delivered', language)} (${deliveredJobs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as typeof filterTab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                filterTab === tab.id
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Cards Grid */}
      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-[#1a2a3f] border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur">
            <Package className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <h3 className="text-[18px] font-bold text-white">{t('noCargoFound', language)}</h3>
            <p className="text-[14px] text-white/60 leading-6 mt-1 mb-4">{t('postNewLoadPrompt', language)}</p>
            <button
              onClick={onOpenPostJob}
              className="px-6 py-2.5 bg-orange-500 text-black font-bold text-xs rounded-full shadow-md hover:bg-orange-400 transition-all"
            >
              {t('postCargoRequest', language)}
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#1a2a3f] border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-xl backdrop-blur transition-all space-y-4"
            >
              {/* Top row: Status, ID, Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono font-bold text-white">#{job.id}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/70">{job.category}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/70">Date: {job.pickupDate}</span>
                </div>
                <div className="text-xs">
                  {getStatusBadge(job.status)}
                </div>
              </div>

              {/* Main Content Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Left: Cargo & Weight */}
                <div className="space-y-1.5">
                  <h3 className="text-[18px] font-bold text-white">{job.title}</h3>
                  <p className="text-[14px] text-white/70 line-clamp-2 leading-6">{job.cargoDescription}</p>
                  <div className="flex items-center gap-2 text-xs text-white/80 pt-1">
                    <span className="px-2.5 py-1 rounded-md bg-slate-700 font-mono font-bold text-white border border-white/10">
                      {job.weightTons} Tonnes
                    </span>
                    <span className="text-white/60">Vehicle: {job.desiredVehicleType.toUpperCase()}</span>
                  </div>
                </div>

                {/* Middle: Route & Distance */}
                <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-white/5 text-[14px] leading-6">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <div>
                      <span className="text-white/50 text-xs block">{t('pickup', language)}:</span>
                      <div className="font-semibold text-white">{job.pickupLocation.name}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
                    <div>
                      <span className="text-white/50 text-xs block">{t('destination', language)}:</span>
                      <div className="font-semibold text-white">{job.deliveryLocation.name}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-white/60">
                    <span>{t('estDistance', language)}:</span>
                    <span className="font-mono text-white font-semibold">{job.estimatedDistanceKm} km</span>
                  </div>
                </div>

                {/* Right: Pricing & Transporter */}
                <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-white/5 text-xs flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-white/50">{t('marketBenchmark', language)}:</div>
                    <div className="text-[16px] font-bold text-white">{formatMoney(job.marketPriceEstimateUGX, currency)}</div>
                    
                    {job.agreedPriceUGX ? (
                      <div className="mt-1.5 pt-1.5 border-t border-white/10">
                        <span className="text-[11px] text-white/70 font-bold">{t('agreedLockedFare', language)}:</span>
                        <div className="text-[18px] font-extrabold text-orange-400 font-mono">
                          {formatMoney(job.agreedPriceUGX, currency)}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-[12px] text-white/60">
                        {job.offers.length} {t('carrierBidsReceived', language)}
                      </div>
                    )}
                  </div>

                  {job.offers[0] && (
                    <div className="text-[12px] text-white/80 pt-1">
                      {t('carrier', language)}: <span className="font-semibold text-white">{job.offers[0].transporterName}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Live GPS Telemetry Bar (if in transit) */}
              {job.currentGps && job.status === 'in_transit' && (
                <div className="p-4 bg-slate-900/80 border border-white/10 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-orange-400 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 animate-spin text-orange-400" />
                      {t('liveTelemetry', language)}: {job.currentGps.lastUpdated}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">
                        {job.currentGps.progressPercent}% Route Completed
                      </span>
                      <button
                        onClick={() => setTrackingMapJobId(trackingMapJobId === job.id ? null : job.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                          trackingMapJobId === job.id
                            ? 'bg-rose-500 text-white'
                            : 'bg-orange-500 hover:bg-orange-400 text-black'
                        }`}
                      >
                        <LocateFixed className="w-3.5 h-3.5" />
                        <span>{trackingMapJobId === job.id ? 'Close Live Map' : 'Track My Truck on Live Map 🚛'}</span>
                      </button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${job.currentGps.progressPercent}%` }}
                    />
                  </div>

                  {/* Expanded Client Leaflet Map (Limited to this job's truck) */}
                  {trackingMapJobId === job.id && (
                    <div className="pt-2">
                      <LeafletLiveFleetMap
                        clientJobId={job.id}
                        language={language}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                
                {/* Secondary Help / Call Masking */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCallingTransporter(callingTransporter === job.id ? null : job.id)}
                    className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-white/80" />
                    <span>{t('callCarrierMasked', language)}</span>
                  </button>

                  <button
                    onClick={() => onOpenDispute(job)}
                    className="px-3 py-2 text-white/60 hover:text-rose-400 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{t('reportIssue', language)}</span>
                  </button>
                </div>

                {/* Primary State Actions */}
                <div className="flex items-center gap-2">
                  
                  {/* Negotiate / Offers */}
                  {(job.status === 'open' || job.status === 'negotiating') && (
                    <button
                      onClick={() => onOpenNegotiation(job)}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-black" />
                      <span>{t('negotiateOffers', language)} ({job.offers.length})</span>
                    </button>
                  )}

                  {/* Escrow Deposit */}
                  {job.status === 'escrow_pending' && (
                    <button
                      onClick={() => onOpenEscrow(job)}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-black" />
                      <span>{t('depositIntoEscrow', language)}</span>
                    </button>
                  )}

                  {/* Confirm POD */}
                  {job.status === 'in_transit' && (
                    <button
                      onClick={() => onOpenPOD(job)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>{t('signPodReleaseEscrow', language)}</span>
                    </button>
                  )}

                  {/* Invoice */}
                  <button
                    onClick={() => onOpenInvoice(job)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-white/80" />
                    <span>{t('invoice', language)}</span>
                  </button>

                  {/* Rate Transporter (if delivered) */}
                  {job.status === 'delivered' && !job.review && (
                    <button
                      onClick={() => setRatingJob(job)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white border border-white/10 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                      <span>{t('rateCarrier', language)}</span>
                    </button>
                  )}

                </div>

              </div>

              {/* Call Masking Privacy Dialog Drawer */}
              {callingTransporter === job.id && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t('virtualCallMasking', language)}</span>
                  </div>
                  <p className="text-slate-300">
                    {t('callMaskingDesc', language)}
                  </p>
                  <div className="font-mono text-white font-bold text-sm bg-slate-900 p-2 rounded-lg border border-slate-800 inline-block">
                    +256 700 000 891 [Virtual Bridge ID #9928]
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* Rating & Review Dialog */}
      {ratingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4 text-slate-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Rate Transporter Performance
            </h3>
            <p className="text-xs text-slate-400">
              Your rating establishes carrier trust badges and awards safe delivery loyalty points.
            </p>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setStarCount(star)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= starCount ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How was the driver's punctuality, cargo handling, and communication?"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRatingJob(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRateTransporter(ratingJob.id, starCount, reviewComment);
                  setRatingJob(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
