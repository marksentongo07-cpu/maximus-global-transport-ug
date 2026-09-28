import React, { useState, useMemo } from 'react';
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
  Building2
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
  // 4 Core Required Fields: pickup, drop, weight, price
  const [pickupHubKey, setPickupHubKey] = useState<string>('kampala');
  const [customPickup, setCustomPickup] = useState<string>('');
  const [useCustomPickup, setUseCustomPickup] = useState(false);

  const [deliveryHubKey, setDeliveryHubKey] = useState<string>('jinja');
  const [customDelivery, setCustomDelivery] = useState<string>('');
  const [useCustomDelivery, setUseCustomDelivery] = useState(false);

  const [weightTons, setWeightTons] = useState<number>(10);
  const [targetPriceUGX, setTargetPriceUGX] = useState<number>(1400000);

  // Additional cargo metadata for realism
  const [cargoTitle, setCargoTitle] = useState<string>('');
  const [category, setCategory] = useState<Job['category']>('Building Materials');
  const [vehicleType, setVehicleType] = useState<VehicleType>('fuso');
  const [clientPhone, setClientPhone] = useState<string>('+256 772 100 200');

  // Compute live price estimate via Pricing Engine
  const priceQuote = useMemo(() => {
    const pickupCoords = KNOWN_HUBS[pickupHubKey] || KNOWN_HUBS.kampala;
    const deliveryCoords = KNOWN_HUBS[deliveryHubKey] || KNOWN_HUBS.jinja;

    return estimateTransportPrice(
      { lat: pickupCoords.lat, lng: pickupCoords.lng },
      { lat: deliveryCoords.lat, lng: deliveryCoords.lng },
      vehicleType,
      weightTons
    );
  }, [pickupHubKey, deliveryHubKey, vehicleType, weightTons]);

  // Sync default price estimate when route/weight changes
  const applyRecommendedPrice = () => {
    setTargetPriceUGX(priceQuote.negotiationStartingPriceUGX);
  };

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

    const finalTitle = cargoTitle.trim() 
      ? cargoTitle.trim() 
      : `${weightTons}T ${category} Haulage (${pickupName.split(' ')[0]} ➔ ${deliveryName.split(' ')[0]})`;

    const newJob: Job = {
      id: 'job-ug-' + Date.now().toString().slice(-4),
      title: finalTitle,
      clientId: 'client-001',
      clientName: 'Mukwano Commercial Exports',
      clientPhone: clientPhone || '+256 772 100 200',
      cargoDescription: `Standard freight shipment of ${weightTons} Tons of ${category}. Dispatched from ${pickupName} to ${deliveryName}. SafeBoda-grade verified driver requested.`,
      weightTons,
      dimensions: {
        lengthMeters: 6.0,
        widthMeters: 2.4,
        heightMeters: 2.0,
      },
      category,
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
      adminFeeUGX: Math.round(targetPriceUGX * 0.15),
      commissionRatePercent: 15,
      shipmentType: 'single',
      clientBudgetUGX: targetPriceUGX,
      desiredVehicleType: vehicleType,
      pickupDate: '2026-09-28 08:30 AM',
      photoUrl: '/src/assets/images/cargo_loading_depot_1790435648670.jpg',
      status: 'open',
      offers: [],
      escrowStatus: 'none',
      createdAt: 'Just now',
    };

    onSubmitJob(newJob);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#1a2a3f] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0f2438] to-[#1a2a3f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Card 1 · Free Cargo Post
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">Zero Listing Fee</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">Post Cargo - Free</h3>
              <p className="text-xs text-white/60">Fill in pickup, drop, weight, and your budget to broadcast to truckers.</p>
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Section 1: Pickup & Delivery Locations */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                1. Pickup &amp; Drop Locations
              </span>
              <span className="text-[11px] text-white/50">
                Route Distance: <strong className="text-white font-mono">{priceQuote.distanceKm} km</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <optgroup label="Primary Logistics Hubs">
                      <option value="kampala">Kampala CBD</option>
                      <option value="namanve">Namanve Industrial Park</option>
                      <option value="entebbe">Entebbe Cargo Hub</option>
                      <option value="jinja">Jinja Industrial Corridor</option>
                      <option value="tororo">Tororo Cement &amp; Mining</option>
                      <option value="malaba">Malaba Border Port</option>
                      <option value="gulu">Gulu Northern Center</option>
                      <option value="mbarara">Mbarara Western Depot</option>
                    </optgroup>
                    {icds.length > 0 && (
                      <optgroup label="Bonded Warehouses / ICDs">
                        {icds.map(icd => (
                          <option key={icd.id} value="kampala">{icd.name}</option>
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
                  Drop / Destination:
                </label>
                {!useCustomDelivery ? (
                  <select
                    value={deliveryHubKey}
                    onChange={(e) => setDeliveryHubKey(e.target.value)}
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="jinja">Jinja Heavy Industrial Corridor</option>
                    <option value="kampala">Kampala CBD</option>
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
                    placeholder="Enter custom drop address..."
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                )}
                <button
                  type="button"
                  onClick={() => setUseCustomDelivery(!useCustomDelivery)}
                  className="text-[10px] text-blue-400 hover:underline mt-1 block"
                >
                  {useCustomDelivery ? 'Select from Hubs list' : 'Or type custom address'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Weight & Price */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3.5">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-400" />
              2. Weight &amp; Target Price (UGX)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weight in Tons */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Cargo Weight (Tonnes):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.5"
                    max="60"
                    step="0.5"
                    value={weightTons}
                    onChange={(e) => setWeightTons(Number(e.target.value))}
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-sm font-bold font-mono text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                  <span className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/80">
                    Tons
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[2, 5, 10, 15, 28].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setWeightTons(t)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        weightTons === t 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {t}T
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipper Target Price Budget */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-white/70">
                    Target Budget / Price (UGX):
                  </label>
                  <button
                    type="button"
                    onClick={applyRecommendedPrice}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                    title="Apply algorithmic fair market recommendation"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Estimate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="50000"
                    min="100000"
                    value={targetPriceUGX}
                    onChange={(e) => setTargetPriceUGX(Number(e.target.value))}
                    className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-sm font-bold font-mono text-amber-400 focus:outline-none focus:border-blue-400"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-white/50">
                    UGX
                  </span>
                </div>
                <div className="text-[10px] text-white/50 mt-1 flex justify-between">
                  <span>Market Benchmark: <strong className="text-white font-mono">{formatMoney(priceQuote.totalMarketEstimateUGX, currency)}</strong></span>
                  <span className="text-emerald-400 font-semibold">100% Escrow Protected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Cargo Category & Truck Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">
                Cargo Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0f1c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="Agriculture">Agriculture / Produce</option>
                <option value="Building Materials">Building Materials / Cement / Steel</option>
                <option value="Manufactured Goods">Manufactured &amp; Fast-Moving Goods</option>
                <option value="Cold Chain / Perishables">Cold Chain / Perishables (Reefer)</option>
                <option value="Machinery">Industrial Machinery &amp; Equipment</option>
                <option value="General Freight">General Freight Haulage</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">
                Desired Truck Type:
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full bg-[#0f1c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="fuso">Isuzu Fuso (5 - 10 Tonnes)</option>
                <option value="semi_trailer">Semi-Trailer Articulated (25 - 40 Tonnes)</option>
                <option value="flatbed">Heavy Flatbed (20 - 35 Tonnes)</option>
                <option value="box_truck">Enclosed Box Truck (7 - 12 Tonnes)</option>
                <option value="pickup">Hilux / Pickup (1 - 2 Tonnes)</option>
                <option value="refrigerated">Refrigerated Truck (10 - 25 Tonnes)</option>
              </select>
            </div>
          </div>

          {/* Cargo Title (Optional) */}
          <div>
            <label className="text-[11px] font-bold text-white/70 block mb-1">
              Cargo Title / Notes (Optional):
            </label>
            <input
              type="text"
              value={cargoTitle}
              onChange={(e) => setCargoTitle(e.target.value)}
              placeholder="e.g. 20T Tororo Cement to Jinja Construction Site"
              className="w-full bg-[#0f1c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Trust Guarantees */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>SafeBoda-grade driver vetting: only verified logbooks &amp; National IDs bid.</span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
              Verified
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Post Cargo - Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
