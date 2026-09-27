import React, { useState, useMemo } from 'react';
import { 
  Transporter, 
  Job, 
  Vehicle, 
  VehicleType, 
  Currency,
  Language,
  ICD
} from '../../types';
import { formatMoney } from '../../services/currency';
import { t } from '../../services/i18n';
import { getDistanceToICD, DEFAULT_ICDS } from '../../services/icdService';
import { 
  Truck, 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Coins, 
  Plus, 
  ShieldCheck, 
  Navigation, 
  MessageSquare, 
  FileText, 
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Fuel,
  Leaf,
  Building2,
  Radio,
  Filter,
  CreditCard,
  Smartphone,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { EquityTillBanner } from '../Payment/EquityTillBanner';
import { DriverPayoutSettingsModal } from './DriverPayoutSettingsModal';
import { AdminDriverPayoutModal } from '../Admin/AdminDriverPayoutModal';

interface TransporterDashboardProps {
  transporter: Transporter;
  allJobs: Job[];
  currency: Currency;
  language?: Language;
  icds?: ICD[];
  userEmail?: string;
  onUpdateJobStatus: (jobId: string, newStatus: Job['status']) => void;
  onSimulateGpsProgress: (jobId: string) => void;
  onOpenNegotiation: (job: Job) => void;
  onOpenPOD: (job: Job) => void;
  onOpenInvoice: (job: Job) => void;
  onOpenEcoRoute: (job: Job) => void;
  onAddVehicle: (newVehicle: Vehicle) => void;
  onOpenKYC: () => void;
  onUpdatePayoutDetails?: (details: Transporter['payoutDetails']) => void;
  onConfirmPODByAdmin?: (jobId: string) => void;
  onExecuteDriverPayout?: (jobId: string, payoutData: any) => void;
}

export const TransporterDashboard: React.FC<TransporterDashboardProps> = ({
  transporter,
  allJobs,
  currency,
  language = 'en',
  icds = DEFAULT_ICDS,
  userEmail = 'marksentongo07@gmail.com',
  onUpdateJobStatus,
  onSimulateGpsProgress,
  onOpenNegotiation,
  onOpenPOD,
  onOpenInvoice,
  onOpenEcoRoute,
  onAddVehicle,
  onOpenKYC,
  onUpdatePayoutDetails,
  onConfirmPODByAdmin,
  onExecuteDriverPayout,
}) => {
  const [activeTab, setActiveTab] = useState<'loads' | 'active_trips' | 'fleet'>('active_trips');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showPayoutSettingsModal, setShowPayoutSettingsModal] = useState(false);
  const [selectedPayoutJob, setSelectedPayoutJob] = useState<Job | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedProofJob, setSelectedProofJob] = useState<Job | null>(null);
  const [filterICDNearMeOnly, setFilterICDNearMeOnly] = useState<boolean>(false);
  
  // New vehicle form state
  const [vehName, setVehName] = useState('Isuzu Forward 12T Heavy Box');
  const [vehType, setVehType] = useState<VehicleType>('box_truck');
  const [vehPlate, setVehPlate] = useState('UBN 771K');
  const [vehCapacity, setVehCapacity] = useState<number>(12);
  const [vehUnits, setVehUnits] = useState<number>(2);
  const [vehRate, setVehRate] = useState<number>(5500);

  // Filter jobs for this transporter
  const myAssignedJobs = allJobs.filter(
    (j) => j.assignedTransporterId === transporter.id || j.offers.some(o => o.transporterId === transporter.id)
  );

  // Compute distance from transporter current location to each ICD
  const icdDistances = useMemo(() => {
    return icds.map(icd => {
      const dist = getDistanceToICD(transporter.currentLocation.lat, transporter.currentLocation.lng, icd);
      return {
        icd,
        distanceKm: dist,
        isWithin5Km: dist <= 5,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [icds, transporter.currentLocation]);

  // Geofence alert: Detect any open ICD job whose origin ICD is within 5km of transporter
  const geofencedAlertJobs = useMemo(() => {
    return allJobs.filter(j => {
      if (j.status !== 'open' && j.status !== 'negotiating') return false;
      const matchedICD = icds.find(i => 
        i.id === j.pickupICDId || 
        j.pickupLocation.name.toLowerCase().includes(i.name.toLowerCase())
      );
      if (!matchedICD) return false;
      const dist = getDistanceToICD(transporter.currentLocation.lat, transporter.currentLocation.lng, matchedICD);
      return dist <= 5;
    });
  }, [allJobs, icds, transporter.currentLocation]);

  const availableLoads = useMemo(() => {
    const baseLoads = allJobs.filter((j) => j.status === 'open' || j.status === 'negotiating');

    if (filterICDNearMeOnly) {
      return baseLoads.filter((j) => {
        if (!j.isICDJob && !j.pickupICDId && !j.pickupLocation.name.toLowerCase().includes('icd')) return false;
        const matchedICD = icds.find(i => 
          i.id === j.pickupICDId || 
          j.pickupLocation.name.toLowerCase().includes(i.name.toLowerCase())
        );
        if (matchedICD) {
          const dist = getDistanceToICD(transporter.currentLocation.lat, transporter.currentLocation.lng, matchedICD);
          return dist <= 5;
        }
        return false;
      });
    }

    return baseLoads;
  }, [allJobs, filterICDNearMeOnly, icds, transporter.currentLocation]);

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVeh: Vehicle = {
      id: 'veh-' + Date.now().toString().slice(-4),
      transporterId: transporter.id,
      type: vehType,
      name: vehName,
      plateNumber: vehPlate,
      capacityTons: vehCapacity,
      availableUnits: vehUnits,
      ratePerKmUGX: vehRate,
      currentLocation: {
        name: 'Kampala Depot Central',
        lat: 0.3476,
        lng: 32.5825,
      },
    };
    onAddVehicle(newVeh);
    setShowAddVehicleModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Transporter Header & Loyalty Stats Card */}
      <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-[#12233b] border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={transporter.avatarUrl}
                alt={transporter.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-900" title="Online & Available" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{transporter.companyName}</h1>
                <button
                  onClick={onOpenKYC}
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/30 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t('kycVerified', language)}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {t('principalFleetDriver', language)}: <strong className="text-slate-200">{transporter.name}</strong> · {transporter.phone}
              </p>

              {/* Badges List */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {transporter.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1"
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 w-full md:w-auto justify-around">
            <div className="text-center px-2">
              <div className="text-xl font-black text-amber-400 font-mono">⭐ {transporter.rating}</div>
              <div className="text-[10px] text-slate-400">{t('driverRating', language)}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-white font-mono">{transporter.totalTrips}</div>
              <div className="text-[10px] text-slate-400">{t('tripsCompleted', language)}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-emerald-400 font-mono">
                {transporter.loyaltyPoints}
              </div>
              <div className="text-[10px] text-slate-400">{t('loyaltyPts', language)}</div>
            </div>
          </div>

        </div>

        {/* Driver Profile Payout & Banking Details Section */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Driver Payout Account Profile (Till 031801 Escrow Release Routing)</span>
            </span>

            <button
              onClick={() => setShowPayoutSettingsModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Payout &amp; Bank Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* Field 1: Mobile Money Number (MTN/Airtel) */}
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-slate-400 block font-medium">1. Mobile Money Number (≤ 4M UGX):</span>
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${
                  transporter.payoutDetails?.mobileMoneyNetwork === 'MTN' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <span className="text-white font-mono">{transporter.payoutDetails?.mobileMoneyNumber || '+256 772 842 110'}</span>
              </div>
              <span className="text-[9px] text-slate-500">{transporter.payoutDetails?.mobileMoneyNetwork || 'MTN'} MoMo Instant</span>
            </div>

            {/* Field 2: Bank Name */}
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30">
              <span className="text-[10px] text-slate-400 block font-medium">2. Bank Name (&gt; 4M UGX):</span>
              <div className="font-bold text-indigo-300 flex items-center gap-1.5 mt-0.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{transporter.payoutDetails?.bankName || 'Equity Bank Uganda'}</span>
              </div>
              <span className="text-[9px] text-slate-500">Commercial Wire / EFT</span>
            </div>

            {/* Field 3: Bank Account Number */}
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30">
              <span className="text-[10px] text-slate-400 block font-medium">3. Bank Account Number:</span>
              <div className="font-mono font-bold text-white mt-0.5">
                {transporter.payoutDetails?.bankAccountNumber || '1004829103948'}
              </div>
              <span className="text-[9px] text-slate-500">Uganda Clearing House</span>
            </div>

            {/* Field 4: Account Name */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">4. Registered Account Name:</span>
              <div className="font-bold text-slate-200 mt-0.5 truncate">
                {transporter.payoutDetails?.accountName || transporter.name}
              </div>
              <span className="text-[9px] text-slate-500">Matches KYC verification</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('active_trips')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'active_trips' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t('activeTripsAssigned', language)} ({myAssignedJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('loads')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'loads' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('marketplaceLoadBoard', language)} ({availableLoads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'fleet' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t('fleetVehicles', language)} ({transporter.vehicles.length})</span>
          </button>
        </div>

        {activeTab === 'fleet' && (
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addVehicle', language)}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Active Trips & Stepper Console */}
      {activeTab === 'active_trips' && (
        <div className="space-y-4">
          {myAssignedJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
              <Truck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="font-bold text-white text-sm">No Active Trips Assigned Yet</div>
              <p className="text-xs text-slate-400 mt-1">Browse the Marketplace Load Board to bid on high-paying routes.</p>
            </div>
          ) : (
            myAssignedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
              >
                {/* Trip Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      {t('tripOrder', language)} #{job.id} · {job.category}
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{job.title}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">{t('totalAgreedPayout', language)}:</span>
                    <div className="text-lg font-extrabold text-amber-400 font-mono">
                      {formatMoney((job.agreedPriceUGX || job.marketPriceEstimateUGX) * 0.9, currency)}
                    </div>
                    <span className="text-[9px] text-emerald-400">{t('maximusFeeDeducted', language)}</span>
                  </div>
                </div>

                {/* Route specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400">{t('pickupOrigin', language)}:</span>
                        <div className="font-semibold text-slate-200">{job.pickupLocation.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400">{t('deliveryDestination', language)}:</span>
                        <div className="font-semibold text-slate-200">{job.deliveryLocation.name}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">{t('shipperClient', language)}:</span>
                      <div className="font-semibold text-white">{job.clientName}</div>
                      <div className="text-slate-400 text-[11px]">{job.clientPhone}</div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-800 text-slate-300">
                      <span>{t('distance', language)}: {job.estimatedDistanceKm} km</span>
                      <span className="font-bold text-amber-400">{job.weightTons} {t('cargoWeight', language)}</span>
                    </div>
                  </div>
                </div>

                {/* Eco-Fuel Optimization Strip (Google Maps Routes API) */}
                <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 p-3 rounded-xl border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{t('fuelEfficientRouteAvailable', language)}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500 text-slate-950 uppercase">
                          {t('ecoRoutesApi', language)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {t('fuelSavingsNote', language)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenEcoRoute(job)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>{t('calcFuelEfficientRoute', language)}</span>
                  </button>
                </div>

                {/* TRIP STATUS PROGRESSION STEPPER */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-amber-400" />
                      {t('driverTripStatusController', language)}:
                    </span>
                    <span className="text-amber-400 font-bold uppercase text-[11px]">
                      {t('currentStage', language)}: {job.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* 4-Step Flow */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    
                    {/* Step 1: Loaded */}
                    <button
                      onClick={() => onUpdateJobStatus(job.id, 'loaded')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        job.status === 'loaded' || job.status === 'in_transit' || job.status === 'delivered'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-normal opacity-70">Step 1</div>
                      <div>{t('stepCargoLoaded', language)}</div>
                    </button>

                    {/* Step 2: In Transit */}
                    <button
                      onClick={() => onUpdateJobStatus(job.id, 'in_transit')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        job.status === 'in_transit' || job.status === 'delivered'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-normal opacity-70">Step 2</div>
                      <div>{t('stepDepartTransit', language)}</div>
                    </button>

                    {/* Step 3: Advance GPS Telemetry */}
                    <button
                      onClick={() => onSimulateGpsProgress(job.id)}
                      disabled={job.status !== 'in_transit'}
                      className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all text-center disabled:opacity-40"
                    >
                      <div className="text-[10px] font-normal opacity-70">GPS Ping</div>
                      <div>{t('stepUpdateGps', language)}</div>
                    </button>

                    {/* Step 4: Deliver & Collect Signature */}
                    <button
                      onClick={() => onOpenPOD(job)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        job.status === 'delivered'
                          ? 'bg-emerald-500 text-slate-950 font-extrabold'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-[10px] font-normal opacity-70">Step 4</div>
                      <div>{t('stepCollectSignature', language)}</div>
                    </button>

                  </div>

                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpenEcoRoute(job)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('ecoFuelOptimizer', language)}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenNegotiation(job)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('clientChatNotes', language)}</span>
                    </button>
                    <button
                      onClick={() => onOpenInvoice(job)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('viewWaybillInvoice', language)}</span>
                    </button>
                  </div>
                </div>

                {/* DRIVER PAYOUT & POD APPROVAL SECTION */}
                {(() => {
                  const agreedAmount = job.agreedPriceUGX || job.marketPriceEstimateUGX || 1250000;
                  const isBulk = job.shipmentType === 'bulk' || job.weightTons >= 20;
                  const commissionRate = isBulk ? 10 : 15;
                  const commissionFeeUGX = Math.round(agreedAmount * (commissionRate / 100));
                  const driverPayoutAmountUGX = agreedAmount - commissionFeeUGX;
                  const isMobileMoney = driverPayoutAmountUGX <= 4000000;
                  const pod = job.proofOfDelivery;
                  const isPodConfirmed = Boolean(pod?.confirmedByAdmin);
                  const isPaid = job.payoutStatus === 'paid';
                  const dp = transporter.payoutDetails || {
                    mobileMoneyNumber: '+256 772 842 110',
                    mobileMoneyNetwork: 'MTN',
                    bankName: 'Equity Bank Uganda',
                    bankAccountNumber: '1004829103948',
                    accountName: transporter.name || 'Ronald Kato',
                  };

                  return (
                    <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      
                      {/* POD Status & Approval Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white text-xs">
                            Driver Settlement &amp; Escrow Release (Till 031801)
                          </span>
                        </div>

                        <div>
                          {isPaid ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Paid &amp; Settled to Driver</span>
                            </span>
                          ) : isPodConfirmed ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>POD Confirmed by marksentongo07@gmail.com</span>
                            </span>
                          ) : pod ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>POD Submitted · Awaiting marksentongo07@gmail.com Approval</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>In Transit · Collect POD at Destination</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tiered Commission Ledger (15% Single vs 10% Bulk) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Agreed Trip Value:</span>
                          <span className="font-bold text-white font-mono text-sm">{formatMoney(agreedAmount, currency)}</span>
                          <span className="text-[9px] text-slate-500 block">Escrow Till 031801</span>
                        </div>

                        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">
                            Tiered Commission ({commissionRate}% {isBulk ? 'Bulk' : 'Single'}):
                          </span>
                          <span className="font-bold text-emerald-400 font-mono text-sm">-{formatMoney(commissionFeeUGX, currency)}</span>
                          <span className="text-[9px] text-slate-500 block">Maximus Platform Fee</span>
                        </div>

                        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
                          <span className="text-[10px] text-amber-400 font-bold block">Net Driver Payout:</span>
                          <span className="font-black text-amber-300 font-mono text-base">{formatMoney(driverPayoutAmountUGX, currency)}</span>
                          <span className="text-[9px] text-amber-200/70 block">Disbursed to Carrier</span>
                        </div>
                      </div>

                      {/* DYNAMIC PAYOUT SECTION: <= 4,000,000 UGX vs > 4,000,000 UGX */}
                      <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                        isMobileMoney 
                          ? 'bg-emerald-950/20 border-emerald-500/40' 
                          : 'bg-indigo-950/20 border-indigo-500/40'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg text-slate-950 font-bold ${
                              isMobileMoney ? 'bg-emerald-400' : 'bg-indigo-400'
                            }`}>
                              {isMobileMoney ? <Smartphone className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                                {isMobileMoney ? 'Pay via Mobile Money' : 'Pay via Bank Transfer'}
                                <span className="text-[9px] font-normal px-2 py-0.2 rounded bg-black/40 text-slate-300">
                                  {isMobileMoney ? 'Amount ≤ 4,000,000 UGX' : 'Amount > 4,000,000 UGX'}
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-300">
                                {isMobileMoney 
                                  ? `Driver Mobile Money Account: ${dp.mobileMoneyNetwork} MoMo (${dp.mobileMoneyNumber})`
                                  : `Bank Wire: ${dp.bankName} · Acc: ${dp.bankAccountNumber}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                          {isMobileMoney ? (
                            <>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Driver MM Number:</span>
                                <strong className="font-mono text-amber-300 text-xs">{dp.mobileMoneyNetwork}: {dp.mobileMoneyNumber}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Registered Account Name:</span>
                                <strong className="text-slate-200">{dp.accountName || transporter.name}</strong>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Bank Name &amp; Account:</span>
                                <strong className="text-white text-xs">{dp.bankName}</strong>
                                <div className="font-mono text-indigo-300 font-bold">{dp.bankAccountNumber}</div>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Beneficiary Name:</span>
                                <strong className="text-slate-200">{dp.accountName || transporter.name}</strong>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Client Refund Bank Details Display */}
                        {job.clientRefundDetails && (
                          <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                            <span>Client Refund Backup: <strong className="text-slate-300">{job.clientRefundDetails.bankName || 'Bank'} ({job.clientRefundDetails.accountNumber || job.clientRefundDetails.mobileMoneyNumber})</strong></span>
                            <span>Beneficiary: <strong className="text-slate-300">{job.clientRefundDetails.accountName || job.clientName}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* PAYOUT BUTTON & POD APPROVAL CONTROLS */}
                      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        
                        {/* Admin POD Quick Confirmation Trigger if not confirmed */}
                        {!isPodConfirmed && (
                          <div className="flex items-center gap-2">
                            {pod ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onConfirmPODByAdmin) {
                                    onConfirmPODByAdmin(job.id);
                                  }
                                }}
                                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirm POD as marksentongo07@gmail.com</span>
                              </button>
                            ) : (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 italic">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Complete Step 4 (Deliver &amp; Collect Signature) to unlock POD confirmation.</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payout Action Button (Shows after POD is confirmed by admin) */}
                        <div className="w-full sm:w-auto ml-auto">
                          {isPaid ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Paid {formatMoney(job.payoutTransaction?.amountUGX || driverPayoutAmountUGX, currency)}</span>
                              </span>
                              {job.payoutTransaction?.proofReference && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedProofJob(job)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                                  <span>View Proof ({job.payoutTransaction.proofReference})</span>
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
                              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                                isMobileMoney
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                                  : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
                              }`}
                            >
                              <Receipt className="w-4 h-4" />
                              <span>
                                Payout {formatMoney(driverPayoutAmountUGX, currency)} ({isMobileMoney ? 'Pay via Mobile Money' : 'Pay via Bank Transfer'})
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              (Payout button appears after marksentongo07@gmail.com confirms POD)
                            </span>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })()}

                {/* EQUITY TILL PAYMENT SECTION AT BOTTOM OF DRIVER TRIP SCREEN */}
                <div className="pt-2 border-t border-slate-800/80">
                  <EquityTillBanner
                    amountUGX={job.agreedPriceUGX || 1250000}
                    currency={currency}
                    tripId={job.id}
                  />
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Available Load Marketplace */}
      {activeTab === 'loads' && (
        <div className="space-y-4">
          
          {/* Distance to Each ICD Banner */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                Distance to Uganda ICDs from Your Current Yard ({transporter.currentLocation.address.split(',')[0]}):
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                5km Geofence Radar Active
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {icdDistances.map(({ icd, distanceKm, isWithin5Km }) => (
                <div
                  key={icd.id}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
                    isWithin5Km
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Building2 className={`w-3.5 h-3.5 ${isWithin5Km ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-white text-[11px] block">{icd.name}</span>
                    <span className={`text-[10px] ${isWithin5Km ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      {distanceKm} km {isWithin5Km && '· 5km Geofence Match!'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Geofence Notification if transporter is within 5km of an ICD with open jobs */}
          {geofencedAlertJobs.length > 0 && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-lg animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-amber-300 text-xs block">
                    🔔 Automated Geofence Alert: You are parked near an ICD with open cargo!
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {geofencedAlertJobs.length} cargo load(s) originating within 5km of your truck position. Fast dispatch priority available.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setFilterICDNearMeOnly(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 shadow-sm"
              >
                View Nearby ICD Jobs
              </button>
            </div>
          )}

          {/* Filter Bar & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="text-xs text-slate-400">
              {t('availableLoadsDesc', language)} ({availableLoads.length} loads)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterICDNearMeOnly(!filterICDNearMeOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  filterICDNearMeOnly
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-400/50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Jobs from ICDs near me (≤5km)</span>
                {filterICDNearMeOnly && (
                  <span className="ml-1 px-1.5 py-0.2 bg-slate-950 text-emerald-400 rounded-full text-[10px]">
                    Active
                  </span>
                )}
              </button>

              {filterICDNearMeOnly && (
                <button
                  onClick={() => setFilterICDNearMeOnly(false)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableLoads.map((job) => {
              const matchedICD = icds.find(i => 
                i.id === job.pickupICDId || 
                job.pickupLocation.name.toLowerCase().includes(i.name.toLowerCase())
              );
              const isICD = Boolean(job.isICDJob || matchedICD);
              const distToICD = matchedICD 
                ? getDistanceToICD(transporter.currentLocation.lat, transporter.currentLocation.lng, matchedICD)
                : null;
              const isNear5km = distToICD !== null && distToICD <= 5;

              return (
                <div
                  key={job.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-3 transition-colors ${
                    isNear5km 
                      ? 'border-emerald-500/60 shadow-emerald-950/20' 
                      : isICD 
                      ? 'border-amber-500/50' 
                      : 'border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          {job.category} · {job.weightTons} Tons
                        </span>

                        {/* Prominent ICD Job Badge */}
                        {isICD && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-amber-400" />
                            ICD Job
                          </span>
                        )}

                        {isNear5km && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 animate-pulse">
                            <Radio className="w-3 h-3 text-emerald-400" />
                            Within 5km Geofence
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{job.title}</h4>
                    </div>

                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-mono shrink-0">
                      ~{job.estimatedDistanceKm} km
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="text-slate-300 line-clamp-1">
                      <strong className="text-emerald-400">From:</strong> {job.pickupLocation.name}
                    </div>
                    <div className="text-slate-300 line-clamp-1">
                      <strong className="text-rose-400">To:</strong> {job.deliveryLocation.name}
                    </div>

                    {/* Show distance from driver to ICD */}
                    {distToICD !== null && (
                      <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span>Distance to ICD Pickup:</span>
                        <span className="font-bold font-mono">{distToICD} km from your yard</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-between items-center text-xs gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[10px]">{t('marketBenchmark', language)}:</span>
                      <div className="font-bold text-slate-200">{formatMoney(job.marketPriceEstimateUGX, currency)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenEcoRoute(job)}
                        className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        title="Calculate fuel efficiency and diesel savings"
                      >
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('ecoRoute', language)}</span>
                      </button>

                      <button
                        onClick={() => onOpenNegotiation(job)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1"
                      >
                        <span>{t('sendBid', language)}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Fleet Vehicles Management */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            {t('registeredFleetUnits', language)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transporter.vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {v.type.replace('_', ' ')} · {v.plateNumber}
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">{v.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {v.availableUnits} {t('available', language)}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">{t('maxCapacity', language)}:</div>
                    <div className="font-semibold text-slate-200">{v.capacityTons} Tonnes</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">{t('ratePerKm', language)}:</div>
                    <div className="font-semibold text-amber-400">{formatMoney(v.ratePerKmUGX, currency)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">{t('depot', language)}:</div>
                    <div className="font-semibold text-slate-200 line-clamp-1">{v.currentLocation.name.split(' ')[0]}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                  <span>GPS Tracking: Live Snapped</span>
                  <button className="text-amber-400 hover:underline font-semibold">
                    Edit Rates / Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4 text-slate-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              Register Fleet Vehicle
            </h3>
            
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Vehicle Model &amp; Make:</label>
                <input
                  type="text"
                  required
                  value={vehName}
                  onChange={(e) => setVehName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold">Vehicle Category:</label>
                  <select
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value as VehicleType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="fuso">Fuso 5-10T</option>
                    <option value="semi_trailer">Semi-Trailer 35T</option>
                    <option value="box_truck">Box Truck 10T</option>
                    <option value="pickup">Pickup 1-2T</option>
                    <option value="flatbed">Flatbed 30T</option>
                    <option value="refrigerated">Refrigerated Reefer</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Number Plate:</label>
                  <input
                    type="text"
                    required
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold">Capacity (T):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={vehCapacity}
                    onChange={(e) => setVehCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold">Units:</label>
                  <input
                    type="number"
                    min="1"
                    value={vehUnits}
                    onChange={(e) => setVehUnits(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold">Rate/Km:</label>
                  <input
                    type="number"
                    step="100"
                    value={vehRate}
                    onChange={(e) => setVehRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Payout & Banking Settings Modal */}
      {showPayoutSettingsModal && (
        <DriverPayoutSettingsModal
          transporter={transporter}
          onClose={() => setShowPayoutSettingsModal(false)}
          onSave={(updatedPayoutDetails) => {
            if (onUpdatePayoutDetails) {
              onUpdatePayoutDetails(updatedPayoutDetails);
            }
          }}
        />
      )}

      {/* Admin Driver Payout Authorization Modal */}
      {showPayoutModal && selectedPayoutJob && (
        <AdminDriverPayoutModal
          job={selectedPayoutJob}
          transporter={transporter}
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

      {/* Payment Proof Receipt Inspection Modal */}
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
