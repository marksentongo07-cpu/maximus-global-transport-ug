import React, { useState, useMemo } from 'react';
import { 
  Job, 
  VehicleType, 
  Currency, 
  ICD,
  CargoType,
  ContainerDetails,
  WideLoadDetails 
} from '../../types';
import { 
  KNOWN_HUBS, 
  estimateTransportPrice,
  VEHICLE_BASE_RATES 
} from '../../services/pricingEngine';
import { formatMoney } from '../../services/currency';
import { 
  Package, 
  MapPin, 
  Scale, 
  Coins, 
  Truck, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Building2,
  AlertTriangle,
  FileCheck,
  Container,
  Car,
  Compass
} from 'lucide-react';

interface ClientPostCargoModalProps {
  currency: Currency;
  icds?: ICD[];
  onClose: () => void;
  onSubmitJob: (newJob: Job) => void;
}

export const ClientPostCargoModal: React.FC<ClientPostCargoModalProps> = ({
  currency,
  icds = [],
  onClose,
  onSubmitJob,
}) => {
  // Pickup and Delivery
  const [pickupHubKey, setPickupHubKey] = useState<string>('kampala');
  const [customPickup, setCustomPickup] = useState<string>('');
  const [useCustomPickup, setUseCustomPickup] = useState(false);

  const [deliveryHubKey, setDeliveryHubKey] = useState<string>('jinja');
  const [customDelivery, setCustomDelivery] = useState<string>('');
  const [useCustomDelivery, setUseCustomDelivery] = useState(false);

  // Cargo Type
  const [cargoType, setCargoType] = useState<CargoType>('General Goods');
  const [category, setCategory] = useState<Job['category']>('General Freight');

  // Free Price Input (no limits, free text)
  const [priceInputText, setPriceInputText] = useState<string>('2115000');
  const [isNegotiable, setIsNegotiable] = useState<boolean>(true);

  // Weight & Dimensions
  const [weightTons, setWeightTons] = useState<number>(5);

  // Vehicle Selection with Groups and Custom Option
  const [vehicleType, setVehicleType] = useState<VehicleType | 'other'>('fuso');
  const [customVehicleDesc, setCustomVehicleDesc] = useState<string>('');

  // Container Specific Fields
  const [containerNumber, setContainerNumber] = useState<string>('MSKU-749201-9');
  const [sealNumber, setSealNumber] = useState<string>('UG-CMA-88491');
  const [shippingLine, setShippingLine] = useState<'Maersk' | 'CMA CGM' | 'MSC' | 'PIL' | 'COSCO' | 'Hapag-Lloyd' | 'Other'>('Maersk');
  const [containerPort, setContainerPort] = useState<'Mombasa Port' | 'Dar es Salaam Port' | 'Entebbe' | 'Other'>('Mombasa Port');
  const [containerSize, setContainerSize] = useState<'20ft' | '40ft' | '40ft HC'>('40ft');

  // Wide Load Specific Fields
  const [wideLength, setWideLength] = useState<number>(14.5);
  const [wideWidth, setWideWidth] = useState<number>(3.8);
  const [wideHeight, setWideHeight] = useState<number>(4.2);
  const [uraPermitNeeded, setUraPermitNeeded] = useState<boolean>(true);
  const [policeEscortNeeded, setPoliceEscortNeeded] = useState<boolean>(true);

  // Additional cargo metadata
  const [cargoTitle, setCargoTitle] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+256 772 100 200');

  // Numeric parse of user price
  const numericPrice = useMemo(() => {
    const cleaned = priceInputText.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }, [priceInputText]);

  // Compute live price benchmark via Pricing Engine
  const priceQuote = useMemo(() => {
    const pickupCoords = KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala;
    const deliveryCoords = KNOWN_HUBS[deliveryHubKey] || KNOWN_HUBS.jinja;

    return estimateTransportPrice(
      { lat: pickupCoords.lat, lng: pickupCoords.lng },
      { lat: deliveryCoords.lat, lng: deliveryCoords.lng },
      vehicleType,
      weightTons,
      {
        isWideLoad: cargoType === 'Wide/Abnormal Load (requires permit)',
        escortNeeded: policeEscortNeeded,
        uraPermitNeeded: uraPermitNeeded,
        wideDimensions: { lengthMeters: wideLength, widthMeters: wideWidth, heightMeters: wideHeight }
      }
    );
  }, [pickupHubKey, deliveryHubKey, vehicleType, weightTons, cargoType, policeEscortNeeded, uraPermitNeeded, wideLength, wideWidth, wideHeight]);

  // Sync default price estimate when button clicked
  const applyRecommendedPrice = () => {
    setPriceInputText(priceQuote.negotiationStartingPriceUGX.toLocaleString());
  };

  // Warning check: Is price very low (< 35% of market benchmark or < 300k for heavy trucks)?
  const isSuspiciouslyLowPrice = useMemo(() => {
    if (!numericPrice || numericPrice <= 0) return false;
    if (priceQuote.totalMarketEstimateUGX > 0 && numericPrice < priceQuote.totalMarketEstimateUGX * 0.35) {
      return true;
    }
    return false;
  }, [numericPrice, priceQuote.totalMarketEstimateUGX]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pCoords = KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala;
    const dCoords = KNOWN_HUBS[deliveryHubKey] || KNOWN_HUBS.jinja;

    const pickupName = useCustomPickup && customPickup.trim() 
      ? customPickup.trim() 
      : pCoords.name;
    const deliveryName = useCustomDelivery && customDelivery.trim() 
      ? customDelivery.trim() 
      : dCoords.name;

    const vehicleDisplay = vehicleType === 'other' && customVehicleDesc.trim() 
      ? customVehicleDesc.trim() 
      : VEHICLE_BASE_RATES[vehicleType as VehicleType]?.label || vehicleType;

    const finalTitle = cargoTitle.trim() 
      ? cargoTitle.trim() 
      : `${weightTons}T ${cargoType} (${pickupName.split(' ')[0]} ➔ ${deliveryName.split(' ')[0]})`;

    // Container and wide load metadata
    let containerData: ContainerDetails | undefined = undefined;
    if (cargoType === 'Containers (20ft/40ft)') {
      containerData = {
        containerNumber,
        sealNumber,
        shippingLine,
        port: containerPort,
        containerSize,
      };
    }

    let wideData: WideLoadDetails | undefined = undefined;
    if (cargoType === 'Wide/Abnormal Load (requires permit)') {
      wideData = {
        lengthMeters: wideLength,
        widthMeters: wideWidth,
        heightMeters: wideHeight,
        weightTons,
        uraPermitNeeded,
        policeEscortNeeded,
        estimatedEscortFeeUGX: policeEscortNeeded ? Math.round(numericPrice * 0.30) : 0,
        uraPermitFeeUGX: uraPermitNeeded ? 250000 : 0,
      };
    }

    const finalClientPrice = numericPrice || priceQuote.negotiationStartingPriceUGX;
    // 8% commission on final agreed amount - MAXIMUS Free Market standard
    const adminFeeUGX = Math.round(finalClientPrice * 0.08);

    const newJob: Job = {
      id: 'job-ug-' + Date.now().toString().slice(-4),
      title: finalTitle,
      clientId: 'client-001',
      clientName: 'Mukwano Commercial Exports',
      clientPhone: clientPhone || '+256 772 100 200',
      cargoDescription: `${cargoType}: ${weightTons}T haulage from ${pickupName} to ${deliveryName}. Vehicle requested: ${vehicleDisplay}. ${isNegotiable ? 'Client offer is negotiable.' : 'Fixed budget.'}`,
      weightTons,
      dimensions: {
        lengthMeters: wideLength || 6.0,
        widthMeters: wideWidth || 2.4,
        heightMeters: wideHeight || 2.0,
      },
      category,
      cargoType,
      containerDetails: containerData,
      wideLoadDetails: wideData,
      pickupLocation: {
        name: pickupName,
        address: `${pickupName}, Uganda`,
        lat: pCoords.lat,
        lng: pCoords.lng,
      },
      deliveryLocation: {
        name: deliveryName,
        address: `${deliveryName}, Uganda`,
        lat: dCoords.lat,
        lng: dCoords.lng,
      },
      estimatedDistanceKm: priceQuote.distanceKm,
      marketPriceEstimateUGX: priceQuote.totalMarketEstimateUGX,
      adminFeeUGX,
      commissionRatePercent: 8,
      shipmentType: 'single',
      clientBudgetUGX: finalClientPrice,
      isNegotiable,
      desiredVehicleType: vehicleType,
      customVehicleType: vehicleType === 'other' ? customVehicleDesc : undefined,
      pickupDate: '2026-09-29 08:30 AM',
      photoUrl: '/src/assets/images/cargo_loading_depot_1790435648670.jpg',
      status: 'open',
      offers: [],
      escrowStatus: 'none',
      createdAt: 'Just now',
    };

    onSubmitJob(newJob);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#1a2a3f] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0f2438] to-[#1a2a3f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Free Market Open Bidding
                </span>
                <span className="text-[11px] text-orange-400 font-semibold">8% Escrow Commission</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">Post Cargo - Free Text Offer</h3>
              <p className="text-xs text-white/60">Set any offer price, select vehicle, or describe custom carrier needs.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Section 1: Cargo Type Selection */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-400" />
                1. Cargo Type &amp; Classification
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">All Goods &amp; Express Supported</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Cargo Type:
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => {
                    const ct = e.target.value as CargoType;
                    setCargoType(ct);
                    if (ct === 'Containers (20ft/40ft)') {
                      setVehicleType('semi_trailer_40ft');
                      setWeightTons(28);
                    } else if (ct === 'Wide/Abnormal Load (requires permit)') {
                      setVehicleType('wide_load_truck');
                      setWeightTons(35);
                    } else if (ct === 'Small Parcel/Document') {
                      setVehicleType('saloon_car');
                      setWeightTons(0.5);
                    } else if (ct === 'Perishable/Cold Chain') {
                      setVehicleType('refrigerated');
                      setWeightTons(12);
                    }
                  }}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="General Goods">📦 General Goods</option>
                  <option value="Containers (20ft/40ft)">🚢 Containers (20ft / 40ft Port Haulage)</option>
                  <option value="Wide/Abnormal Load (requires permit)">⚠️ Wide / Abnormal Load (Heavy Machinery &amp; Escort)</option>
                  <option value="Perishable/Cold Chain">❄️ Perishable / Cold Chain (Dairy, Meat, Produce)</option>
                  <option value="Fragile">🍷 Fragile / High Value (Box Truck Protected)</option>
                  <option value="Vehicle/Car">🚗 Vehicle / Car Haulage</option>
                  <option value="Small Parcel/Document">✉️ Small Parcel / Urgent Document (Saloon Car Express)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Cargo Summary / Title:
                </label>
                <input
                  type="text"
                  value={cargoTitle}
                  onChange={(e) => setCargoTitle(e.target.value)}
                  placeholder="e.g. 28T Steel Rebar or 40ft Maersk Container"
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* CONDITIONAL: Container 20ft or 40ft extra fields */}
            {cargoType === 'Containers (20ft/40ft)' && (
              <div className="mt-3 p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <Container className="w-4 h-4 text-blue-400" />
                  <span>Bonded Container Details (Mombasa / Dar Corridor):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">Container Number:</label>
                    <input
                      type="text"
                      value={containerNumber}
                      onChange={(e) => setContainerNumber(e.target.value)}
                      placeholder="e.g. MSKU-749201-9"
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">Seal Number:</label>
                    <input
                      type="text"
                      value={sealNumber}
                      onChange={(e) => setSealNumber(e.target.value)}
                      placeholder="e.g. UG-CMA-88491"
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">Container Size:</label>
                    <select
                      value={containerSize}
                      onChange={(e) => setContainerSize(e.target.value as any)}
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="20ft">20ft Container ($1,850 flat corridor)</option>
                      <option value="40ft">40ft Container ($2,800 flat corridor)</option>
                      <option value="40ft HC">40ft High Cube</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">Shipping Line:</label>
                    <select
                      value={shippingLine}
                      onChange={(e) => setShippingLine(e.target.value as any)}
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Maersk">Maersk Line</option>
                      <option value="CMA CGM">CMA CGM</option>
                      <option value="MSC">MSC (Mediterranean Shipping Co)</option>
                      <option value="PIL">PIL Pacific International</option>
                      <option value="COSCO">COSCO Shipping</option>
                      <option value="Hapag-Lloyd">Hapag-Lloyd</option>
                      <option value="Other">Other Shipping Line</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-white/60 block mb-1">Origin Ocean / Inland Port:</label>
                    <select
                      value={containerPort}
                      onChange={(e) => setContainerPort(e.target.value as any)}
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Mombasa Port">Mombasa Ocean Port (Kenya) ➔ Uganda</option>
                      <option value="Dar es Salaam Port">Dar es Salaam Port (Tanzania) ➔ Uganda</option>
                      <option value="Entebbe">Entebbe Airport Cargo Terminal</option>
                      <option value="Other">Other Inland Depot</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL: Wide Load extra fields */}
            {cargoType === 'Wide/Abnormal Load (requires permit)' && (
              <div className="mt-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Wide / Abnormal Load Specifications &amp; Police Escort:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">Length (Meters):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wideLength}
                      onChange={(e) => setWideLength(Number(e.target.value))}
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">Width (Meters):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wideWidth}
                      onChange={(e) => setWideWidth(Number(e.target.value))}
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">Height (Meters):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wideHeight}
                      onChange={(e) => setWideHeight(Number(e.target.value))}
                      className="w-full bg-[#0f1c2e] border border-white/10 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0f1c2e] p-2 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={uraPermitNeeded}
                      onChange={(e) => setUraPermitNeeded(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <div>
                      <span className="font-semibold text-white">URA Abnormal Permit Needed</span>
                      <span className="block text-[10px] text-amber-400 font-mono">+250,000 UGX statutory permit</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0f1c2e] p-2 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={policeEscortNeeded}
                      onChange={(e) => setPoliceEscortNeeded(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <div>
                      <span className="font-semibold text-white">Police Escort Vehicle Needed</span>
                      <span className="block text-[10px] text-emerald-400 font-mono">+30% Escort surcharge estimated</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* CONDITIONAL: Saloon Car / Small Parcel note */}
            {cargoType === 'Small Parcel/Document' && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Small cargo express: Economical per km rate (~1,000 UGX/km Kampala local). Ideal for urgent files, keys, samples.</span>
              </div>
            )}
          </div>

          {/* Section 2: Locations (Pickup & Destination) */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                2. Pickup &amp; Destination Route
              </span>
              <span className="text-[11px] text-white/50">
                Route Distance: <strong className="text-white font-mono">{priceQuote.distanceKm} km</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup Location */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Pickup Location:
                </label>
                {!useCustomPickup ? (
                  <select
                    value={pickupHubKey}
                    onChange={(e) => setPickupHubKey(e.target.value)}
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-400"
                  >
                    <optgroup label="Uganda Logistics Hubs">
                      <option value="kampala">Kampala CBD (Central)</option>
                      <option value="namanve">Namanve Industrial Park</option>
                      <option value="entebbe">Entebbe Cargo Hub</option>
                      <option value="jinja">Jinja Industrial Corridor</option>
                      <option value="tororo">Tororo Cement &amp; Mining</option>
                      <option value="malaba">Malaba Border Port</option>
                      <option value="gulu">Gulu Northern Center</option>
                      <option value="mbarara">Mbarara Western Depot</option>
                      <option value="mombasa">Mombasa Ocean Port (Kenya)</option>
                    </optgroup>
                    {icds.length > 0 && (
                      <optgroup label="Bonded Warehouses / ICDs">
                        {icds.map(icd => (
                          <option key={icd.id} value="kampala">{icd.name} ({icd.location})</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customPickup}
                    onChange={(e) => setCustomPickup(e.target.value)}
                    placeholder="Enter custom pickup address..."
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                )}
                <button
                  type="button"
                  onClick={() => setUseCustomPickup(!useCustomPickup)}
                  className="text-[10px] text-blue-400 hover:underline mt-1 block"
                >
                  {useCustomPickup ? 'Select from Hubs list' : 'Or type custom address'}
                </button>
              </div>

              {/* Delivery / Drop Location */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Destination / Drop Point:
                </label>
                {!useCustomDelivery ? (
                  <select
                    value={deliveryHubKey}
                    onChange={(e) => setDeliveryHubKey(e.target.value)}
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="jinja">Jinja Heavy Industrial Corridor</option>
                    <option value="kampala">Kampala CBD</option>
                    <option value="namanve">Namanve Industrial Park</option>
                    <option value="mbale">Mbale Agro-Trading Hub</option>
                    <option value="gulu">Gulu Northern Logistics Center</option>
                    <option value="mbarara">Mbarara Western Logistics</option>
                    <option value="busia">Busia Border Crossing</option>
                    <option value="malaba">Malaba Border Port</option>
                    <option value="tororo">Tororo Mining Zone</option>
                    <option value="nairobi">Nairobi Commercial Hub (Kenya)</option>
                    <option value="kigali">Kigali Free Trade Zone (Rwanda)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customDelivery}
                    onChange={(e) => setCustomDelivery(e.target.value)}
                    placeholder="Enter custom destination address..."
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                )}
                <button
                  type="button"
                  onClick={() => setUseCustomDelivery(!useCustomDelivery)}
                  className="text-[10px] text-blue-400 hover:underline mt-1 block"
                >
                  {useCustomDelivery ? 'Select from Hubs list' : 'Or type custom destination'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle Type - 4 Full Groups + Custom Input */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" />
              3. Vehicle Selection (All 4 Uganda Groups or Custom)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Required Vehicle:
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                >
                  <optgroup label="GROUP 1 - Small & Express (Parcels, Documents, Small Cargo)">
                    <option value="saloon_car">🚗 Saloon Car / Sedan (500kg, urgent documents Kampala)</option>
                    <option value="hatchback">🚗 Hatchback / Small Car (700kg)</option>
                    <option value="station_wagon">🚙 Station Wagon (1T, traders Kikuubo)</option>
                    <option value="pickup_single">🛻 Pickup Single Cab (1.5T)</option>
                    <option value="pickup_double">🛻 Pickup Double Cab (1.2T)</option>
                    <option value="pickup">🛻 Standard Pickup</option>
                  </optgroup>

                  <optgroup label="GROUP 2 - Medium Trucks (Uganda Local)">
                    <option value="canter_3t">🚚 Canter 3T (3-4 tonnes, 14ft body)</option>
                    <option value="fuso">🚛 Fuso 5T / 7T (5-7 tonnes, 20ft body, most popular in UG)</option>
                    <option value="fuso_fighter_10t">🚛 Fuso Fighter 10T (10 tonnes)</option>
                    <option value="box_truck">📦 Box Body Truck 15T (for fragile goods)</option>
                    <option value="refrigerated">❄️ Refrigerated Truck / Cold Chain (dairy, meat, fish)</option>
                  </optgroup>

                  <optgroup label="GROUP 3 - Heavy & Long Distance (Containers & Wide Load)">
                    <option value="semi_trailer_20ft">🚢 Semi-Trailer 20ft Container (28T, Mombasa-Kampala)</option>
                    <option value="semi_trailer_40ft">🚢 Semi-Trailer 40ft Container (30-35T, Mombasa-Kampala)</option>
                    <option value="semi_trailer_40ft_hc">🚢 Semi-Trailer 40ft High Cube</option>
                    <option value="semi_trailer">🚛 Standard Semi-Trailer (25-40T)</option>
                    <option value="flatbed">🏗️ Flatbed Trailer 20ft / 40ft (containers & steel)</option>
                    <option value="lowbed_loader">🚜 Lowbed Trailer / Low Loader (excavators, heavy machinery)</option>
                    <option value="wide_load_truck">⚠️ Wide Load / Abnormal Load Truck (with escort)</option>
                  </optgroup>

                  <optgroup label="GROUP 4 - Specialized">
                    <option value="fuel_tanker">⛽ Fuel Tanker (diesel, petrol)</option>
                    <option value="dump_tipper">🪨 Dump Truck / Tipper (murram, sand)</option>
                    <option value="car_carrier">🚗 Car Carrier / Transporter (Mombasa import)</option>
                    <option value="boda_boda">🛵 Motorcycle / Boda Boda (last mile 50kg)</option>
                    <option value="van">🚐 Van / Mini Van</option>
                  </optgroup>

                  <optgroup label="Custom / Other">
                    <option value="other">✨ Other / Custom - Type your own</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Cargo Weight (Tonnes):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={weightTons}
                    onChange={(e) => setWeightTons(Number(e.target.value))}
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold font-mono text-white focus:outline-none focus:border-blue-400"
                  />
                  <span className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/80">
                    Tons
                  </span>
                </div>
              </div>
            </div>

            {/* Custom vehicle text input when "Other / Custom" selected */}
            {vehicleType === 'other' && (
              <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl space-y-1">
                <label className="text-[11px] font-bold text-amber-300 block">
                  Describe vehicle you need:
                </label>
                <input
                  type="text"
                  value={customVehicleDesc}
                  onChange={(e) => setCustomVehicleDesc(e.target.value)}
                  placeholder="Describe vehicle you need e.g. 'Small saloon with AC for documents' or '40ft + escort for wide load'"
                  className="w-full bg-[#0f1c2e] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            )}
          </div>

          {/* Section 4: FREE TEXT PRICE INPUT (NO LIMITS, 5K to 100M UGX) */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                4. Your Offer Price (Free Market Freedom - No Limits)
              </span>
              <button
                type="button"
                onClick={applyRecommendedPrice}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                title="Fill suggested benchmark price"
              >
                <Sparkles className="w-3 h-3" />
                Suggested: {formatMoney(priceQuote.negotiationStartingPriceUGX, currency)}
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Enter Your Offer Price:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={priceInputText}
                    onChange={(e) => setPriceInputText(e.target.value)}
                    placeholder='Enter your offer e.g. 2,115,000 UGX (negotiable)'
                    className="w-full bg-[#1a2a3f] border border-amber-500/40 rounded-xl px-3 py-2.5 text-base font-extrabold font-mono text-amber-400 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-white/50">
                    UGX
                  </span>
                </div>
              </div>

              {/* Free Market Hint & Negotiable Checkbox */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span className="font-semibold text-white">Price is Negotiable (Allow Transporters to Counter)</span>
                </label>

                <div className="text-[11px] text-white/60">
                  Platform Escrow Fee: <strong className="text-emerald-400 font-mono">8%</strong> ({formatMoney(Math.round(numericPrice * 0.08), currency)})
                </div>
              </div>

              {/* Guidance Hint */}
              <p className="text-[11px] text-white/60 italic">
                💡 Suggested: Kampala-Gulu Fuso ~1.4M but you set your own. You have full freedom from 5,000 UGX to 100,000,000 UGX.
              </p>

              {/* Warning Only (No blocking!) */}
              {isSuspiciouslyLowPrice && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Warning:</span> Price is much lower than the average market benchmark ({formatMoney(priceQuote.totalMarketEstimateUGX, currency)}) — ensure cargo is legit and terms are clear. Transporters can still bid freely.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>MAXIMUS Free Market Escrow: Your money stays 100% protected until verified proof of delivery.</span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              Secured
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Broadcast Cargo Load - Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
