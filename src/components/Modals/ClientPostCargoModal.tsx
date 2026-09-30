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
import { WorldwidePlaceInput, PlaceResult } from '../Common/WorldwidePlaceInput';
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
  Compass,
  Globe,
  Ship,
  Plane,
  FileSpreadsheet
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
  // Worldwide Pickup and Delivery
  const [pickupLocationName, setPickupLocationName] = useState<string>('Guangzhou Port & Logistics Hub, China');
  const [countryFrom, setCountryFrom] = useState<string>('China');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({ lat: 23.1291, lng: 113.2644 });

  const [deliveryLocationName, setDeliveryLocationName] = useState<string>('Gulu Core Northern Logistics Depot, Uganda');
  const [countryTo, setCountryTo] = useState<string>('Uganda');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number }>({ lat: 2.7747, lng: 32.2990 });

  // Worldwide Logistics Options
  const [customsNeeded, setCustomsNeeded] = useState<boolean>(true);
  const [shippingMode, setShippingMode] = useState<'Road' | 'Sea+Road' | 'Air+Road'>('Sea+Road');

  // Detect international route
  const isInternational = useMemo(() => {
    return countryFrom.trim().toLowerCase() !== 'uganda' || countryTo.trim().toLowerCase() !== 'uganda';
  }, [countryFrom, countryTo]);

  // Cargo Type
  const [cargoType, setCargoType] = useState<CargoType>('Containers (20ft/40ft)');
  const [category, setCategory] = useState<Job['category']>('General Freight');

  // Free Price Input (no limits, free text)
  const [priceInputText, setPriceInputText] = useState<string>('2800');
  const [isUsdQuote, setIsUsdQuote] = useState<boolean>(true);
  const [isNegotiable, setIsNegotiable] = useState<boolean>(true);

  // Weight & Dimensions
  const [weightTons, setWeightTons] = useState<number>(28);

  // Vehicle Selection with Groups and Custom Option
  const [vehicleType, setVehicleType] = useState<VehicleType | 'other'>('semi_trailer_40ft');
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
  const [cargoTitle, setCargoTitle] = useState<string>('40ft Container: Guangzhou to Gulu via Mombasa Corridor');
  const [clientPhone, setClientPhone] = useState<string>('+256 772 100 200');

  // Exchange rate assumption for dual display: 1 USD = 3,750 UGX
  const USD_TO_UGX_RATE = 3750;

  // Numeric parse of user price
  const numericPrice = useMemo(() => {
    const cleaned = priceInputText.replace(/[^0-9.]/g, '');
    return cleaned ? parseFloat(cleaned) : 0;
  }, [priceInputText]);

  // Derived UGX and USD amounts
  const priceUGX = useMemo(() => {
    if (isInternational && isUsdQuote) {
      return Math.round(numericPrice * USD_TO_UGX_RATE);
    }
    return Math.round(numericPrice);
  }, [numericPrice, isInternational, isUsdQuote]);

  const priceUSD = useMemo(() => {
    if (isInternational && isUsdQuote) {
      return Math.round(numericPrice);
    }
    return Math.round(numericPrice / USD_TO_UGX_RATE);
  }, [numericPrice, isInternational, isUsdQuote]);

  // Compute live price benchmark via Pricing Engine
  const priceQuote = useMemo(() => {
    return estimateTransportPrice(
      pickupCoords,
      deliveryCoords,
      vehicleType,
      weightTons,
      {
        isWideLoad: cargoType === 'Wide/Abnormal Load (requires permit)',
        escortNeeded: policeEscortNeeded,
        uraPermitNeeded: uraPermitNeeded,
        wideDimensions: { lengthMeters: wideLength, widthMeters: wideWidth, heightMeters: wideHeight }
      }
    );
  }, [pickupCoords, deliveryCoords, vehicleType, weightTons, cargoType, policeEscortNeeded, uraPermitNeeded, wideLength, wideWidth, wideHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vehicleDisplay = vehicleType === 'other' && customVehicleDesc.trim() 
      ? customVehicleDesc.trim() 
      : VEHICLE_BASE_RATES[vehicleType as VehicleType]?.label || vehicleType;

    const finalTitle = cargoTitle.trim() 
      ? cargoTitle.trim() 
      : `${weightTons}T ${cargoType} (${pickupLocationName.split(',')[0]} ➔ ${deliveryLocationName.split(',')[0]})`;

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
        estimatedEscortFeeUGX: policeEscortNeeded ? Math.round(priceUGX * 0.30) : 0,
        uraPermitFeeUGX: uraPermitNeeded ? 250000 : 0,
      };
    }

    const finalClientPriceUGX = priceUGX || priceQuote.negotiationStartingPriceUGX;
    // 8% commission on final agreed amount - MAXIMUS Free Market standard
    const adminFeeUGX = Math.round(finalClientPriceUGX * 0.08);

    const newJob: Job = {
      id: 'job-intl-' + Date.now().toString().slice(-4),
      title: finalTitle,
      clientId: 'client-001',
      clientName: 'Mukwano Commercial Exports',
      clientPhone: clientPhone || '+256 772 100 200',
      cargoDescription: `Worldwide shipment: ${cargoType} (${weightTons}T) from ${pickupLocationName} (${countryFrom}) to ${deliveryLocationName} (${countryTo}). Shipping mode: ${shippingMode}. Customs clearance required: ${customsNeeded ? 'YES' : 'NO'}. Vehicle requested: ${vehicleDisplay}. ${isNegotiable ? 'Client offer is negotiable.' : 'Fixed budget.'}`,
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
        name: pickupLocationName,
        address: `${pickupLocationName}, ${countryFrom}`,
        lat: pickupCoords.lat,
        lng: pickupCoords.lng,
      },
      deliveryLocation: {
        name: deliveryLocationName,
        address: `${deliveryLocationName}, ${countryTo}`,
        lat: deliveryCoords.lat,
        lng: deliveryCoords.lng,
      },
      estimatedDistanceKm: priceQuote.distanceKm,
      marketPriceEstimateUGX: priceQuote.totalMarketEstimateUGX,
      adminFeeUGX,
      commissionRatePercent: 8,
      shipmentType: 'single',
      clientBudgetUGX: finalClientPriceUGX,
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
      <div className="relative w-full max-w-3xl bg-[#0A1931] border border-[#C9A86A]/40 rounded-3xl shadow-2xl shadow-[#6A0DAD]/15 overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#071324] via-[#0A1931] to-[#122442] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#6A0DAD]/20 text-[#d2beff] border border-[#6A0DAD]/30">
              <Globe className="w-6 h-6 text-[#C9A86A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#C9A86A] text-[#0A1931]">
                  Worldwide Cargo Booking
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">8% TrustVault Settlement</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-0.5">Post Cargo - Worldwide Freight</h3>
              {/* Tagline requirement */}
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                Ship cargo anywhere across the world - client picks location, driver bids if agrees on price - From Guangzhou to Gulu
              </p>
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
          
          {/* Section 1: Worldwide Pickup & Destination Route */}
          <div className="bg-[#0f243d] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C9A86A] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C9A86A]" />
                1. Worldwide Origin &amp; Destination
              </span>
              <span className="text-[11px] text-white/60 font-mono">
                {isInternational ? (
                  <span className="text-purple-300 font-bold">🌍 Cross-Border International Corridor</span>
                ) : (
                  <span className="text-emerald-400">Domestic Uganda Route</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup Place Input */}
              <WorldwidePlaceInput
                label="Pickup Anywhere (Origin):"
                value={pickupLocationName}
                placeholder="Pickup anywhere: e.g. Guangzhou, China or Mombasa, Kenya or Kikuubo, Kampala"
                onChange={(val, place) => {
                  setPickupLocationName(val);
                  if (place) {
                    setCountryFrom(place.country);
                    setPickupCoords({ lat: place.lat, lng: place.lng });
                    if (place.mode) setShippingMode(place.mode as any);
                  }
                }}
                onCountryChange={(cntry) => setCountryFrom(cntry)}
              />

              {/* Delivery Place Input */}
              <WorldwidePlaceInput
                label="Drop Point Anywhere (Destination):"
                value={deliveryLocationName}
                placeholder="Drop point: e.g. Gulu Northern Hub or Namanve ICD or Mombasa"
                onChange={(val, place) => {
                  setDeliveryLocationName(val);
                  if (place) {
                    setCountryTo(place.country);
                    setDeliveryCoords({ lat: place.lat, lng: place.lng });
                  }
                }}
                onCountryChange={(cntry) => setCountryTo(cntry)}
              />
            </div>

            {/* Extra Worldwide Fields: Country From, Country To, Customs, Shipping Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Country From (Auto):</label>
                <input
                  type="text"
                  value={countryFrom}
                  onChange={(e) => setCountryFrom(e.target.value)}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Country To (Auto):</label>
                <input
                  type="text"
                  value={countryTo}
                  onChange={(e) => setCountryTo(e.target.value)}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Customs Needed?</label>
                <div className="flex items-center gap-1.5 bg-[#1a2a3f] p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setCustomsNeeded(true)}
                    className={`flex-1 py-1 text-center rounded-lg font-bold text-xs transition-colors ${
                      customsNeeded ? 'bg-[#C9A86A] text-[#0A1931]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomsNeeded(false)}
                    className={`flex-1 py-1 text-center rounded-lg font-bold text-xs transition-colors ${
                      !customsNeeded ? 'bg-[#C9A86A] text-[#0A1931]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Shipping Mode:</label>
                <select
                  value={shippingMode}
                  onChange={(e) => setShippingMode(e.target.value as any)}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white font-semibold"
                >
                  <option value="Road">🚛 Road Freight</option>
                  <option value="Sea+Road">🚢 Sea + Road</option>
                  <option value="Air+Road">✈️ Air + Road</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Cargo Classification */}
          <div className="bg-[#0f243d] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C9A86A] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#C9A86A]" />
                2. Cargo Type &amp; Vehicle
              </span>
              <span className="text-[11px] text-slate-300">From saloon car to 40ft container</span>
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
                      setPriceInputText('2800');
                      setIsUsdQuote(true);
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
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Containers (20ft/40ft)">🚢 Containers (20ft / 40ft Port Haulage)</option>
                  <option value="General Goods">📦 General Goods / Machinery</option>
                  <option value="Wide/Abnormal Load (requires permit)">⚠️ Wide / Abnormal Load (Heavy Equipment &amp; Escort)</option>
                  <option value="Perishable/Cold Chain">❄️ Perishable / Cold Chain (Reefer)</option>
                  <option value="Fragile">🍷 Fragile / High Value</option>
                  <option value="Vehicle/Car">🚗 Vehicle / Heavy Plant</option>
                  <option value="Small Parcel/Document">✉️ Small Parcel / Urgent Documents (Saloon Express)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Requested Vehicle:
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="semi_trailer_40ft">Semi-Trailer 40ft Container (32T)</option>
                  <option value="flatbed_20ft">Flatbed 20ft Container (20T)</option>
                  <option value="fuso">Fuso 5-10 Tonnes (General Haulage)</option>
                  <option value="semi_trailer">Semi-Trailer 28T</option>
                  <option value="refrigerated">Refrigerated / Cold Truck (10T)</option>
                  <option value="wide_load_truck">Lowbed / Wide Load Trailer</option>
                  <option value="pickup">Pickup Truck 1-2 Tonnes</option>
                  <option value="saloon_car">Saloon Car Express (Documents/Samples)</option>
                  <option value="other">Other / Custom Carrier Specs</option>
                </select>
              </div>
            </div>

            {/* Container Details */}
            {cargoType === 'Containers (20ft/40ft)' && (
              <div className="p-3 bg-[#0A1931] border border-[#6A0DAD]/30 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-[#C9A86A] flex items-center gap-1.5">
                  <Container className="w-4 h-4" />
                  <span>Bonded Container Specifications:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-300 block mb-0.5">Container #:</label>
                    <input
                      type="text"
                      value={containerNumber}
                      onChange={(e) => setContainerNumber(e.target.value)}
                      className="w-full bg-[#081220] border border-white/10 rounded-lg p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 block mb-0.5">Seal #:</label>
                    <input
                      type="text"
                      value={sealNumber}
                      onChange={(e) => setSealNumber(e.target.value)}
                      className="w-full bg-[#081220] border border-white/10 rounded-lg p-1.5 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 block mb-0.5">Port of Transit:</label>
                    <select
                      value={containerPort}
                      onChange={(e) => setContainerPort(e.target.value as any)}
                      className="w-full bg-[#081220] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                    >
                      <option value="Mombasa Port">Mombasa Port (Kenya)</option>
                      <option value="Dar es Salaam Port">Dar es Salaam Port</option>
                      <option value="Entebbe">Entebbe Cargo Hub</option>
                      <option value="Other">Other Global Terminal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: PRICING - WORLDWIDE FREEDOM (USD + UGX) */}
          <div className="bg-[#0f243d] p-4 rounded-2xl border border-[#C9A86A]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C9A86A] uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#C9A86A]" />
                3. Offer Price (Worldwide Free Market Freedom)
              </span>
              <div className="flex items-center gap-2">
                {isInternational && (
                  <button
                    type="button"
                    onClick={() => setIsUsdQuote(!isUsdQuote)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6A0DAD]/30 text-[#d2beff] border border-[#6A0DAD]/40"
                  >
                    Switch to {isUsdQuote ? 'UGX' : 'USD ($)'}
                  </button>
                )}
                <span className="text-[11px] text-emerald-400 font-bold">8% TrustVault Fee</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">
                  Your Offer Amount ({isInternational && isUsdQuote ? 'USD ($)' : 'UGX'}):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={priceInputText}
                    onChange={(e) => setPriceInputText(e.target.value)}
                    placeholder={isInternational && isUsdQuote ? 'e.g. 2800' : 'e.g. 10,500,000'}
                    className="w-full bg-[#1a2a3f] border border-[#C9A86A]/40 rounded-xl px-4 py-3 text-lg font-mono font-extrabold text-[#C9A86A] focus:outline-none focus:border-[#C9A86A]"
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-white/60">
                    {isInternational && isUsdQuote ? 'USD ($)' : 'UGX'}
                  </span>
                </div>
              </div>

              {/* Dual Currency Display for International Shipments */}
              {isInternational && (
                <div className="p-3 rounded-xl bg-[#0A1931] border border-[#C9A86A]/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Dual Currency Settlement:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#C9A86A]">${priceUSD.toLocaleString()} USD</span>
                    <span className="text-slate-400 mx-1.5">≈</span>
                    <span className="text-white font-bold">{priceUGX.toLocaleString()} UGX</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="rounded accent-[#C9A86A]"
                  />
                  <span className="font-semibold text-white">Price is Negotiable (Carriers can submit counter-offers)</span>
                </label>

                <div className="text-[11px] text-white/60 font-mono">
                  Platform Escrow (8%): <strong className="text-emerald-400">{formatMoney(Math.round(priceUGX * 0.08), currency)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-3 bg-[#0A1931] border border-[#6A0DAD]/30 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9A86A] shrink-0" />
              <span>TrustVault Protection: Funds locked in Equity Bank Till 031801 until verified delivery.</span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-[#6A0DAD]/20 text-[#d8c4ff] border border-[#6A0DAD]/40 px-2.5 py-0.5 rounded-full">
              Bank-Grade Vetted
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#C9A86A] to-[#a88748] hover:from-[#d6b77c] hover:to-[#b79653] text-[#0A1931] text-xs font-extrabold rounded-xl shadow-lg shadow-[#C9A86A]/20 transition-all flex items-center gap-2"
            >
              <span>Publish Worldwide Shipment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};