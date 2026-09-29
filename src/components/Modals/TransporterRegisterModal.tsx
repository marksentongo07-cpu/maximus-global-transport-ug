import React, { useState } from 'react';
import { 
  VehicleType, 
  Transporter, 
  Vehicle 
} from '../../types';
import { 
  Truck, 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Camera, 
  CreditCard,
  AlertTriangle,
  Sparkles,
  Lock
} from 'lucide-react';

interface TransporterRegisterModalProps {
  onClose: () => void;
  onRegisterTransporter: (transporterData: {
    name: string;
    phone: string;
    companyName: string;
    nin: string;
    truckType: VehicleType;
    plateNumber: string;
    drivingPermitFile?: string;
    nationalIdFile?: string;
    logbookFile?: string;
    truckPhotoFile?: string;
  }) => void;
}

export const TransporterRegisterModal: React.FC<TransporterRegisterModalProps> = ({
  onClose,
  onRegisterTransporter,
}) => {
  // Required fields from prompt: truck type, number plate, NIN, driving permit upload
  // Plus KYC trust requirements: National ID + Truck Logbook + Photo of truck
  const [truckType, setTruckType] = useState<VehicleType>('fuso');
  const [plateNumber, setPlateNumber] = useState<string>('UBA 782X');
  const [nin, setNin] = useState<string>('CM890241088JKA');
  const [driverName, setDriverName] = useState<string>('Ronald Mukasa');
  const [phone, setPhone] = useState<string>('+256 772 491 802');
  const [companyName, setCompanyName] = useState<string>('Mukasa Heavy Haulage Logistics');

  // Statutory Upload States (with default sample files for frictionless demo)
  const [drivingPermitUploaded, setDrivingPermitUploaded] = useState(true);
  const [nationalIdUploaded, setNationalIdUploaded] = useState(true);
  const [logbookUploaded, setLogbookUploaded] = useState(true);
  const [truckPhotoUploaded, setTruckPhotoUploaded] = useState(true);

  const [truckPhotoPreview, setTruckPhotoPreview] = useState<string>('/src/assets/images/maximus_hero_truck_1790435606454.jpg');

  const handleFileUpload = (field: 'permit' | 'id' | 'logbook' | 'truckPhoto', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (field === 'permit') setDrivingPermitUploaded(true);
      if (field === 'id') setNationalIdUploaded(true);
      if (field === 'logbook') setLogbookUploaded(true);
      if (field === 'truckPhoto') {
        setTruckPhotoUploaded(true);
        setTruckPhotoPreview(url);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onRegisterTransporter({
      name: driverName.trim() || 'Ronald Mukasa',
      phone: phone.trim() || '+256 772 491 802',
      companyName: companyName.trim() || 'Mukasa Heavy Haulage Logistics',
      nin: nin.trim().toUpperCase() || 'CM890241088JKA',
      truckType,
      plateNumber: plateNumber.trim().toUpperCase() || 'UBA 782X',
      drivingPermitFile: drivingPermitUploaded ? 'Verified Heavy Class CH/CM Permit' : undefined,
      nationalIdFile: nationalIdUploaded ? 'Verified NIRA National ID' : undefined,
      logbookFile: logbookUploaded ? 'Verified URA Vehicle Logbook' : undefined,
      truckPhotoFile: truckPhotoPreview,
    });
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#1a2a3f] border border-orange-500/40 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#241a0d] to-[#1a2a3f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/30 text-orange-400 border border-orange-500/40">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Card 2 · Transporter Onboarding
                </span>
                <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  SafeBoda Trust Protocol
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">I Have a Truck - Find Loads &amp; Bid</h3>
              <p className="text-xs text-white/60">Register your vehicle &amp; upload SafeBoda-style KYC to access direct loads.</p>
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
          
          {/* SafeBoda Trust Notification Banner */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-amber-300 font-bold block">SafeBoda-Grade Trust Verification Required</strong>
              <span>
                To stop scammers, cargo theft, and build unshakeable client trust, Super Admin Mark Sentongo verifies your <strong>National ID + Truck Logbook + Truck Photo</strong> in the Admin Tab before you can place bids.
              </span>
            </div>
          </div>

          {/* Section 1: Truck Specifications */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3.5">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-orange-400" />
              1. Truck Details &amp; Registration
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Truck Type */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  What vehicle do you own?
                </label>
                <select
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value as any)}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-orange-400"
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

              {/* Number Plate */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Vehicle Number Plate:
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. UBA 492K"
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold font-mono text-orange-400 tracking-wider focus:outline-none focus:border-orange-400 uppercase"
                  required
                />
                <span className="text-[10px] text-white/50 mt-1 block">Must match URA vehicle logbook</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Driver Full Name */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Driver / Owner Full Name:
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Ronald Mukasa"
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Mobile Money Phone Number:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 772 ..."
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: SafeBoda KYC Uploads (National ID + Truck Logbook + Photo of truck + Driving Permit) */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                2. Mandatory SafeBoda KYC Trust Documents
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Anti-Scammer Defense
              </span>
            </div>

            {/* National Identification Number (NIN) */}
            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">
                National Identification Number (NIN):
              </label>
              <input
                type="text"
                value={nin}
                onChange={(e) => setNin(e.target.value.toUpperCase())}
                placeholder="e.g. CM890241088JKA (14 Characters)"
                className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold font-mono text-amber-300 tracking-wider focus:outline-none focus:border-orange-400 uppercase"
                required
              />
              <span className="text-[10px] text-white/50 mt-1 block">Uganda National Identification &amp; Registration Authority (NIRA) ID</span>
            </div>

            {/* 4 Statutory Document Upload Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              
              {/* Doc 1: Driving Permit Upload */}
              <div className="bg-[#1a2a3f] p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-[11px] truncate">1. Driving Permit (UDLS)</div>
                    <div className="text-[10px] text-white/50">Class CH / CM Heavy Heavy Heavy</div>
                  </div>
                </div>

                <label className="cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('permit', e)}
                    className="hidden"
                  />
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    drivingPermitUploaded 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-orange-500 text-slate-950 hover:bg-orange-400'
                  }`}>
                    {drivingPermitUploaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{drivingPermitUploaded ? 'Attached' : 'Upload'}</span>
                  </span>
                </label>
              </div>

              {/* Doc 2: National ID Upload */}
              <div className="bg-[#1a2a3f] p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-[11px] truncate">2. National ID (NIRA)</div>
                    <div className="text-[10px] text-white/50">Front &amp; Back Photo</div>
                  </div>
                </div>

                <label className="cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('id', e)}
                    className="hidden"
                  />
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    nationalIdUploaded 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-orange-500 text-slate-950 hover:bg-orange-400'
                  }`}>
                    {nationalIdUploaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{nationalIdUploaded ? 'Attached' : 'Upload'}</span>
                  </span>
                </label>
              </div>

              {/* Doc 3: Truck Logbook Upload */}
              <div className="bg-[#1a2a3f] p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-[11px] truncate">3. Truck Logbook (URA)</div>
                    <div className="text-[10px] text-white/50">Chassis &amp; Engine Match</div>
                  </div>
                </div>

                <label className="cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('logbook', e)}
                    className="hidden"
                  />
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    logbookUploaded 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-orange-500 text-slate-950 hover:bg-orange-400'
                  }`}>
                    {logbookUploaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{logbookUploaded ? 'Attached' : 'Upload'}</span>
                  </span>
                </label>
              </div>

              {/* Doc 4: Photo of Truck */}
              <div className="bg-[#1a2a3f] p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Camera className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-[11px] truncate">4. Photo of Truck</div>
                    <div className="text-[10px] text-white/50">Front/Side with Plate Visible</div>
                  </div>
                </div>

                <label className="cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('truckPhoto', e)}
                    className="hidden"
                  />
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    truckPhotoUploaded 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-orange-500 text-slate-950 hover:bg-orange-400'
                  }`}>
                    {truckPhotoUploaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{truckPhotoUploaded ? 'Attached' : 'Upload'}</span>
                  </span>
                </label>
              </div>

            </div>

            {/* Truck Preview Thumbnail */}
            {truckPhotoPreview && (
              <div className="flex items-center gap-3 p-2 bg-[#1a2a3f] rounded-xl border border-white/10 text-xs">
                <img
                  src={truckPhotoPreview}
                  alt="Truck Inspection"
                  className="w-16 h-12 object-cover rounded-lg border border-white/20"
                />
                <div className="text-white/70 text-[11px]">
                  <span>Photo loaded: <strong>{plateNumber}</strong> verified physical unit. Ready for Super Admin review.</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <div className="text-[11px] text-white/50 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SafeBoda-level encryption</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all"
              >
                <Truck className="w-4 h-4 text-black" />
                <span>Find Loads &amp; Bid</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
