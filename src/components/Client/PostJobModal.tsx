import React, { useState, useMemo, useEffect } from 'react';
import { 
  Job, 
  VehicleType, 
  Currency,
  ICD
} from '../../types';
import { 
  KNOWN_HUBS, 
  estimateTransportPrice 
} from '../../services/pricingEngine';
import { formatMoney } from '../../services/currency';
import { calculateICDStorageFee } from '../../services/icdService';
import { 
  Truck, 
  Calculator, 
  MapPin, 
  Scale, 
  Calendar, 
  ShieldCheck, 
  X, 
  Sparkles,
  ArrowRight,
  Camera,
  Building2,
  Clock,
  Coins
} from 'lucide-react';

interface PostJobModalProps {
  currency: Currency;
  icds?: ICD[];
  initialICD?: ICD | null;
  onClose: () => void;
  onSubmitJob: (newJob: Job) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  currency,
  icds = [],
  initialICD = null,
  onClose,
  onSubmitJob,
}) => {
  const [title, setTitle] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [weightTons, setWeightTons] = useState<number>(5);
  const [category, setCategory] = useState<Job['category']>('Agriculture');
  const [vehicleType, setVehicleType] = useState<VehicleType>('fuso');
  const [shipmentType, setShipmentType] = useState<'single' | 'bulk'>('single');
  const [selectedICDId, setSelectedICDId] = useState<string>(initialICD ? initialICD.id : '');
  const [pickupHubKey, setPickupHubKey] = useState<string>('kampala');
  const [deliveryHubKey, setDeliveryHubKey] = useState<string>('jinja');
  const [pickupDate, setPickupDate] = useState('2026-09-28 08:00 AM');
  const [extraStorageDays, setExtraStorageDays] = useState<number>(0);
  const [lengthMeters, setLengthMeters] = useState<number>(6.0);
  const [widthMeters, setWidthMeters] = useState<number>(2.2);
  const [heightMeters, setHeightMeters] = useState<number>(1.8);
  const [photoUrl, setPhotoUrl] = useState<string>('/src/assets/images/cargo_loading_depot_1790435648670.jpg');

  // Client Refund Bank & Mobile Money Details
  const [showRefundFields, setShowRefundFields] = useState(false);
  const [refundBankName, setRefundBankName] = useState('Stanbic Bank Uganda');
  const [refundAccountNumber, setRefundAccountNumber] = useState('9030005839201');
  const [refundAccountName, setRefundAccountName] = useState('Mukwano Agro-Industries Escrow');
  const [refundMobileMoney, setRefundMobileMoney] = useState('+256 772 100 200');
  const [refundMobileNetwork, setRefundMobileNetwork] = useState<'MTN' | 'AIRTEL'>('MTN');

  // Handle pre-selected ICD
  useEffect(() => {
    if (initialICD) {
      setSelectedICDId(initialICD.id);
    }
  }, [initialICD]);

  const selectedICD = icds.find(i => i.id === selectedICDId) || null;

  // Compute live price estimate via Pricing Engine
  const priceQuote = useMemo(() => {
    const pickupCoords = selectedICD 
      ? { lat: selectedICD.lat, lng: selectedICD.lng }
      : (KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala);
    const dHub = KNOWN_HUBS[deliveryHubKey] || KNOWN_HUBS.jinja;

    return estimateTransportPrice(
      { lat: pickupCoords.lat, lng: pickupCoords.lng },
      { lat: dHub.lat, lng: dHub.lng },
      vehicleType,
      weightTons
    );
  }, [selectedICD, pickupHubKey, deliveryHubKey, vehicleType, weightTons]);

  // Compute ICD storage surcharge if extra days requested
  const storageCalc = useMemo(() => {
    if (!selectedICD || extraStorageDays <= 0) return { totalStorageFeeUGX: 0, breakdown: '' };
    return calculateICDStorageFee(extraStorageDays, selectedICD.storageFeePerDay, category === 'Cold Chain / Perishables' ? 1.5 : 1.0);
  }, [selectedICD, extraStorageDays, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dHub = KNOWN_HUBS[deliveryHubKey] || KNOWN_HUBS.jinja;

    const pickupLocationObj = selectedICD ? {
      name: `${selectedICD.name} (${selectedICD.location})`,
      address: `${selectedICD.name}, ${selectedICD.location}`,
      lat: selectedICD.lat,
      lng: selectedICD.lng,
    } : {
      name: (KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala).name,
      address: `${(KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala).name}, Uganda`,
      lat: (KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala).lat,
      lng: (KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala).lng,
    };

    const finalMarketEstimate = priceQuote.totalMarketEstimateUGX + storageCalc.totalStorageFeeUGX;
    const finalClientBudget = priceQuote.negotiationStartingPriceUGX + storageCalc.totalStorageFeeUGX;
    const commissionRate = shipmentType === 'bulk' ? 10 : 15;
    const finalAdminFee = Math.round(finalMarketEstimate * (commissionRate / 100));

    const newJob: Job = {
      id: 'job-ug-' + Date.now().toString().slice(-4),
      title: title || (selectedICD ? `ICD Dispatch: ${weightTons}T ${category} from ${selectedICD.name}` : `${weightTons}T ${category} Freight`),
      clientId: 'client-001',
      clientName: 'Mukwano Agricultural Exports',
      clientPhone: '+256 772 100 200',
      cargoDescription: cargoDescription || (selectedICD 
        ? `Bonded cargo haulage dispatched directly from ${selectedICD.name}. Customs cleared. ${storageCalc.totalStorageFeeUGX > 0 ? `Includes ${extraStorageDays} extra day(s) ICD storage.` : ''}`
        : `Standard freight haulage of ${category}. Secured packaging.`),
      weightTons,
      dimensions: { lengthMeters, widthMeters, heightMeters },
      category,
      pickupLocation: pickupLocationObj,
      deliveryLocation: {
        name: dHub.name,
        address: `${dHub.name}, Uganda`,
        lat: dHub.lat,
        lng: dHub.lng,
      },
      estimatedDistanceKm: priceQuote.distanceKm,
      marketPriceEstimateUGX: finalMarketEstimate,
      adminFeeUGX: finalAdminFee,
      commissionRatePercent: commissionRate,
      shipmentType,
      clientBudgetUGX: finalClientBudget,
      desiredVehicleType: vehicleType,
      pickupDate,
      photoUrl,
      status: 'open',
      offers: [],
      escrowStatus: 'none',
      isICDJob: Boolean(selectedICD),
      pickupICDId: selectedICD?.id,
      pickupICDName: selectedICD?.name,
      extraStorageDays: extraStorageDays > 0 ? extraStorageDays : undefined,
      extraStorageFeeUGX: storageCalc.totalStorageFeeUGX > 0 ? storageCalc.totalStorageFeeUGX : undefined,
      clientRefundDetails: {
        bankName: refundBankName,
        accountNumber: refundAccountNumber,
        accountName: refundAccountName,
        mobileMoneyNumber: refundMobileMoney,
        mobileMoneyNetwork: refundMobileNetwork,
      },
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    onSubmitJob(newJob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Post Cargo Transport Job</h3>
              <p className="text-xs text-slate-400">Powered by Maximus Global Price Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Cargo Title / Summary:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10 Tonnes Maize Grain Bags"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Job['category'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Agriculture">Agriculture &amp; Produce</option>
                <option value="Building Materials">Building Materials &amp; Steel</option>
                <option value="Manufactured Goods">Manufactured Goods</option>
                <option value="Cold Chain / Perishables">Cold Chain / Perishables</option>
                <option value="Machinery">Heavy Machinery</option>
                <option value="General Freight">General Freight</option>
              </select>
            </div>
          </div>

          {/* ICD / Warehouse Selector Dropdown */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-xs font-semibold text-amber-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                Select ICD / Warehouse (Pickup Origin):
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {selectedICD ? 'Bonded ICD Pickup Selected' : 'Custom Pickup Location'}
              </span>
            </label>
            <select
              value={selectedICDId}
              onChange={(e) => setSelectedICDId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="">Custom Location (Select City / Logistics Hub below)</option>
              {icds.map((icd) => (
                <option key={icd.id} value={icd.id}>
                  🏢 {icd.name} — {icd.location} ({formatMoney(icd.storageFeePerDay, currency)}/day)
                </option>
              ))}
            </select>

            {/* ICD Details Banner if ICD selected */}
            {selectedICD && (
              <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedICD.operatingHours}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    Storage Rate: {formatMoney(selectedICD.storageFeePerDay, currency)} / Day
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedICD.contact} · Direct URA Customs Bonded Area
                </div>

                {/* Optional: Extra Days Storage Surcharge */}
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Extra Storage / Demurrage Days:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={extraStorageDays}
                      onChange={(e) => setExtraStorageDays(Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold text-center"
                    />
                    <span className="text-[11px] text-slate-400">days</span>
                    {extraStorageDays > 0 && (
                      <span className="text-amber-400 font-bold text-xs">
                        (+{formatMoney(storageCalc.totalStorageFeeUGX, currency)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!selectedICD ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Pickup Location (City / Hub):
                </label>
                <select
                  value={pickupHubKey}
                  onChange={(e) => setPickupHubKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {Object.entries(KNOWN_HUBS).map(([k, hub]) => (
                    <option key={k} value={k}>{hub.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Pickup Point (Fixed to ICD):
                </label>
                <div className="p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-300 font-semibold flex items-center justify-between">
                  <span className="line-clamp-1">{selectedICD.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">ICD Depot</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Delivery Destination:
              </label>
              <select
                value={deliveryHubKey}
                onChange={(e) => setDeliveryHubKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {Object.entries(KNOWN_HUBS).map(([k, hub]) => (
                  <option key={k} value={k}>{hub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weight, Vehicle Type, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Weight (Tons):
              </label>
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                required
                value={weightTons}
                onChange={(e) => setWeightTons(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Desired Vehicle:
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="pickup">Pickup (1 - 2 Tonnes)</option>
                <option value="fuso">Fuso Tipper/Box (5 - 10 Tonnes)</option>
                <option value="box_truck">Box Truck (7 - 12 Tonnes)</option>
                <option value="semi_trailer">Semi-Trailer (25 - 40 Tonnes)</option>
                <option value="flatbed">Flatbed (20 - 35 Tonnes)</option>
                <option value="refrigerated">Refrigerated Reefer (10 - 25 Tonnes)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Required Date &amp; Time:
              </label>
              <input
                type="text"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                placeholder="2026-09-28 08:00 AM"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Cargo Dimensions */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Cargo Dimensions (Meters):
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500">Length (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Width (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={widthMeters}
                  onChange={(e) => setWidthMeters(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Height (m):</label>
                <input
                  type="number"
                  step="0.1"
                  value={heightMeters}
                  onChange={(e) => setHeightMeters(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Tiered Commission Plan (15% Single vs 10% Bulk) */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Commission Tier (Escrow Facilitation):</span>
              <span className="text-amber-400 font-mono text-[10px]">
                {shipmentType === 'bulk' ? '10% Bulk Discount Rate' : '15% Single Load Rate'}
              </span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShipmentType('single')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  shipmentType === 'single'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-white text-[11px]">Single Shipment</div>
                <div className="text-[10px] text-slate-400">15% Escrow commission rate</div>
              </button>

              <button
                type="button"
                onClick={() => setShipmentType('bulk')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  shipmentType === 'bulk'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-white text-[11px]">Bulk Freight / Contract</div>
                <div className="text-[10px] text-emerald-400">10% Preferred bulk rate (≥20T/Multi)</div>
              </button>
            </div>
          </div>

          {/* Client Refund Bank & Mobile Money Details Accordion */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <button
              type="button"
              onClick={() => setShowRefundFields(!showRefundFields)}
              className="w-full flex items-center justify-between text-left font-bold text-slate-300 hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Client Refund Destination (In case of cancellation or dispute)</span>
              </span>
              <span className="text-amber-400 text-xs font-semibold">
                {showRefundFields ? 'Hide ▲' : 'Show / Edit Details ▼'}
              </span>
            </button>

            {showRefundFields && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Refund Bank Name</label>
                    <select
                      value={refundBankName}
                      onChange={(e) => setRefundBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    >
                      <option value="Stanbic Bank Uganda">Stanbic Bank Uganda</option>
                      <option value="Equity Bank Uganda">Equity Bank Uganda</option>
                      <option value="Centenary Bank Uganda">Centenary Bank Uganda</option>
                      <option value="Absa Bank Uganda">Absa Bank Uganda</option>
                      <option value="Standard Chartered Uganda">Standard Chartered Uganda</option>
                      <option value="DFCU Bank Uganda">DFCU Bank Uganda</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Refund Bank Account Number</label>
                    <input
                      type="text"
                      value={refundAccountNumber}
                      onChange={(e) => setRefundAccountNumber(e.target.value)}
                      placeholder="e.g. 9030005839201"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={refundAccountName}
                      onChange={(e) => setRefundAccountName(e.target.value)}
                      placeholder="e.g. Mukwano Agro-Industries Escrow"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Mobile Money Number (Backup)</label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={refundMobileNetwork}
                        onChange={(e) => setRefundMobileNetwork(e.target.value as 'MTN' | 'AIRTEL')}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="MTN">MTN</option>
                        <option value="AIRTEL">Airtel</option>
                      </select>
                      <input
                        type="text"
                        value={refundMobileMoney}
                        onChange={(e) => setRefundMobileMoney(e.target.value)}
                        placeholder="+256 772 100 200"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Global Price Engine Calculation Breakdown */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Global Price Engine Calculation:
              </span>
              <span className="text-xs text-slate-400 font-mono">Distance: ~{priceQuote.distanceKm} km</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs border-t border-amber-500/20 pt-2">
              <div>
                <div className="text-[10px] text-slate-400">Base Haulage Fare:</div>
                <div className="font-semibold text-slate-200">{formatMoney(priceQuote.baseHaulageUGX, currency)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">
                  Commission ({shipmentType === 'bulk' ? '10% Bulk' : '15% Single'}):
                </div>
                <div className="font-semibold text-emerald-400">
                  {formatMoney(Math.round(priceQuote.baseHaulageUGX * (shipmentType === 'bulk' ? 0.10 : 0.15)), currency)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-amber-400 font-bold">Recommended Starting Price:</div>
                <div className="font-extrabold text-amber-400 text-sm">
                  {formatMoney(priceQuote.negotiationStartingPriceUGX, currency)}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              Escrow funded through Till 031801 with 15% single / 10% bulk tiered platform facilitation.
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Publish Load &amp; Broadcast to Transporters</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>
    </div>
  );
};
