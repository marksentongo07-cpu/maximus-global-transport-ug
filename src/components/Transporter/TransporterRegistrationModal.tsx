import React, { useState } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Camera, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Phone,
  Building2,
  Lock,
  Container,
  AlertTriangle,
  Car
} from 'lucide-react';
import { Transporter, VehicleType, Vehicle } from '../../types';
import { VEHICLE_BASE_RATES } from '../../services/pricingEngine';

interface TransporterRegistrationModalProps {
  onClose: () => void;
  onRegisterTransporter: (newTransporter: Transporter) => void;
}

const VEHICLE_OPTIONS: Array<{ type: VehicleType; label: string; group: string }> = [
  // Group 1
  { type: 'saloon_car', label: 'Saloon Car / Sedan (500kg, urgent documents, parcels)', group: 'GROUP 1 - Small & Express' },
  { type: 'hatchback', label: 'Hatchback / Small Car (700kg)', group: 'GROUP 1 - Small & Express' },
  { type: 'station_wagon', label: 'Station Wagon (1T, traders Kikuubo)', group: 'GROUP 1 - Small & Express' },
  { type: 'pickup_single', label: 'Pickup Single Cab (1.5T)', group: 'GROUP 1 - Small & Express' },
  { type: 'pickup_double', label: 'Pickup Double Cab (1.2T)', group: 'GROUP 1 - Small & Express' },
  // Group 2
  { type: 'canter_3t', label: 'Canter 3T (3-4 tonnes, 14ft body)', group: 'GROUP 2 - Medium Trucks' },
  { type: 'fuso', label: 'Fuso 5T / 7T (5-7 tonnes, 20ft body, most popular in UG)', group: 'GROUP 2 - Medium Trucks' },
  { type: 'fuso_fighter_10t', label: 'Fuso Fighter 10T (10 tonnes)', group: 'GROUP 2 - Medium Trucks' },
  { type: 'box_truck', label: 'Box Body Truck 15T (for fragile goods)', group: 'GROUP 2 - Medium Trucks' },
  { type: 'refrigerated', label: 'Refrigerated Truck / Cold Chain (dairy, meat, fish)', group: 'GROUP 2 - Medium Trucks' },
  // Group 3
  { type: 'semi_trailer_20ft', label: 'Semi-Trailer 20ft Container (28T, Mombasa-Kampala)', group: 'GROUP 3 - Heavy & Long Distance' },
  { type: 'semi_trailer_40ft', label: 'Semi-Trailer 40ft Container (30-35T, Mombasa-Kampala)', group: 'GROUP 3 - Heavy & Long Distance' },
  { type: 'semi_trailer_40ft_hc', label: 'Semi-Trailer 40ft High Cube', group: 'GROUP 3 - Heavy & Long Distance' },
  { type: 'flatbed', label: 'Flatbed Trailer 20ft / 40ft (containers & steel)', group: 'GROUP 3 - Heavy & Long Distance' },
  { type: 'lowbed_loader', label: 'Lowbed Trailer / Low Loader (excavators, heavy machinery)', group: 'GROUP 3 - Heavy & Long Distance' },
  { type: 'wide_load_truck', label: 'Wide Load / Abnormal Load Truck (with escort)', group: 'GROUP 3 - Heavy & Long Distance' },
  // Group 4
  { type: 'fuel_tanker', label: 'Fuel Tanker (diesel, petrol)', group: 'GROUP 4 - Specialized' },
  { type: 'dump_tipper', label: 'Dump Truck / Tipper (murram, sand)', group: 'GROUP 4 - Specialized' },
  { type: 'car_carrier', label: 'Car Carrier / Car Transporter (Mombasa import)', group: 'GROUP 4 - Specialized' },
  { type: 'boda_boda', label: 'Motorcycle / Boda Boda (last mile 50kg)', group: 'GROUP 4 - Specialized' },
  { type: 'van', label: 'Van / Mini Van', group: 'GROUP 4 - Specialized' },
];

export const TransporterRegistrationModal: React.FC<TransporterRegistrationModalProps> = ({
  onClose,
  onRegisterTransporter,
}) => {
  const [name, setName] = useState('Moses Ochen');
  const [companyName, setCompanyName] = useState('Ochen Swift Freight Uganda Ltd');
  const [phone, setPhone] = useState('+256 774 912 384');
  const [nin, setNin] = useState('CM840291039KPA');
  const [plateNumber, setPlateNumber] = useState('UBN 771K');

  // Selected owned vehicles (select multiple)
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleType[]>(['fuso', 'canter_3t']);
  
  // Custom vehicle input
  const [hasCustomVehicle, setHasCustomVehicle] = useState(false);
  const [customVehicleDesc, setCustomVehicleDesc] = useState('Toyota Wish 1.8 with extra carrier');

  // Capability questions
  const [canHandle20ft, setCanHandle20ft] = useState(true);
  const [canHandle40ft, setCanHandle40ft] = useState(true);
  const [hasWideLoadPermit, setHasWideLoadPermit] = useState(false);

  // Upload states
  const [permitUploaded, setPermitUploaded] = useState(true);
  const [nationalIdUploaded, setNationalIdUploaded] = useState(true);
  const [logbookUploaded, setLogbookUploaded] = useState(true);
  const [truckPhotoUploaded, setTruckPhotoUploaded] = useState(true);

  const isOnlySaloonOrLight = selectedVehicles.every(v => ['saloon_car', 'hatchback', 'station_wagon', 'boda_boda'].includes(v));

  const toggleVehicle = (vt: VehicleType) => {
    setSelectedVehicles(prev => 
      prev.includes(vt) ? prev.filter(x => x !== vt) : [...prev, vt]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransporterId = 'trans-' + Date.now().toString().slice(-4);
    const primaryType = selectedVehicles[0] || (hasCustomVehicle ? 'other' : 'fuso');
    
    const vehicleName = hasCustomVehicle && customVehicleDesc.trim() 
      ? customVehicleDesc.trim() 
      : VEHICLE_BASE_RATES[primaryType]?.label || 'Standard Vehicle';

    const newVehicle: Vehicle = {
      id: 'veh-' + Date.now().toString().slice(-4),
      transporterId: newTransporterId,
      type: primaryType,
      name: `${vehicleName} (${plateNumber})`,
      plateNumber: plateNumber.toUpperCase(),
      capacityTons: primaryType === 'saloon_car' ? 0.5 : primaryType === 'semi_trailer_40ft' ? 32 : 7,
      availableUnits: 1,
      ratePerKmUGX: VEHICLE_BASE_RATES[primaryType]?.ratePerKmUGX || 3500,
      currentLocation: {
        name: 'Kampala Depot Central',
        lat: 0.3476,
        lng: 32.5825,
      },
      photoUrl: '/src/assets/images/maximus_fleet_truck_1790435620635.jpg',
    };

    const newTransporter: Transporter = {
      id: newTransporterId,
      name,
      companyName,
      phone,
      maskedPhone: `${phone.slice(0, 8)} *** ${phone.slice(-3)} [Encrypted Relay]`,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@transporters.maximus.ug`,
      avatarUrl: '/src/assets/images/transporter_profile_1790435633148.jpg',
      rating: 5.0,
      totalTrips: 0,
      loyaltyPoints: 100,
      badges: ['New Carrier', 'SafeBoda Verified Candidate'],
      kycStatus: 'pending',
      nin: nin.toUpperCase(),
      handles20ftContainer: canHandle20ft,
      handles40ftContainer: canHandle40ft,
      hasWideLoadPermit,
      ownedVehicleTypes: selectedVehicles,
      kycDocs: {
        drivingLicense: permitUploaded,
        vehicleLogbook: isOnlySaloonOrLight ? true : logbookUploaded,
        commercialInsurance: true,
        nationalId: nationalIdUploaded,
        truckPhoto: truckPhotoUploaded,
        nationalIdUrl: '/src/assets/images/national_id_sample.jpg',
        drivingPermitUrl: '/src/assets/images/driving_permit_sample.jpg',
        logbookUrl: '/src/assets/images/logbook_sample.jpg',
        truckPhotoUrl: '/src/assets/images/maximus_fleet_truck_1790435620635.jpg',
        verifiedAt: undefined,
      },
      payoutDetails: {
        mobileMoneyNumber: phone,
        mobileMoneyNetwork: 'MTN',
        bankName: 'Equity Bank Uganda',
        bankAccountNumber: '1004829' + Math.floor(100000 + Math.random() * 900000),
        accountName: name,
      },
      vehicles: [newVehicle],
      isAvailable: true,
      status: 'active',
      currentLocation: {
        lat: 0.3476,
        lng: 32.5825,
        address: 'Kampala Core Hub, Uganda',
      },
    };

    onRegisterTransporter(newTransporter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#1a2a3f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white my-6 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0f1c2e] to-[#1a2a3f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Transporter Registration &amp; Vehicle Capabilities</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500 text-black font-extrabold uppercase">
                  SafeBoda Trust
                </span>
              </h3>
              <p className="text-xs text-white/60">
                Register your vehicle (saloon car, Fuso, container trailer, or custom). Super Admin Mark Sentongo verifies to unlock bidding.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          
          {/* Driver Contact & Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0f1c2e] p-3.5 rounded-xl border border-white/10">
            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">Driver / Owner Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">Company / Fleet Name:</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">Mobile Money Phone Number:</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">Vehicle Plate Number:</label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="e.g. UBA 771K"
                className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs text-orange-400 font-bold font-mono focus:outline-none focus:border-orange-400 uppercase"
              />
            </div>
          </div>

          {/* Section: WHAT VEHICLES DO YOU OWN? (SELECT MULTIPLE) */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-orange-400" />
                What vehicles do you own? (Select multiple)
              </span>
              <span className="text-[11px] text-white/50">{selectedVehicles.length} selected</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto p-1 border border-white/5 rounded-lg">
              {VEHICLE_OPTIONS.map(v => (
                <label 
                  key={v.type}
                  className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                    selectedVehicles.includes(v.type) 
                      ? 'bg-orange-500/15 border-orange-500/40 text-white' 
                      : 'bg-[#1a2a3f]/60 border-white/5 text-white/70 hover:bg-[#1a2a3f]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(v.type)}
                    onChange={() => toggleVehicle(v.type)}
                    className="mt-0.5 rounded accent-orange-500"
                  />
                  <div>
                    <span className="font-semibold block leading-tight">{v.label}</span>
                    <span className="text-[9px] text-white/40 block mt-0.5">{v.group}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Custom Vehicle Option */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-300">
                <input
                  type="checkbox"
                  checked={hasCustomVehicle}
                  onChange={(e) => setHasCustomVehicle(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>I have a custom vehicle (Type your own e.g. "Toyota Wish 1.8 with extra carrier")</span>
              </label>

              {hasCustomVehicle && (
                <input
                  type="text"
                  value={customVehicleDesc}
                  onChange={(e) => setCustomVehicleDesc(e.target.value)}
                  placeholder="Describe your custom vehicle e.g. Toyota Wish 1.8 with extra carrier"
                  className="w-full bg-[#1a2a3f] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                />
              )}
            </div>
          </div>

          {/* Section: CAPABILITY QUESTIONS (Containers & Wide Load) */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Container className="w-4 h-4 text-blue-400" />
              Specialized Haulage Capabilities
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#1a2a3f] p-3 rounded-xl border border-white/10 space-y-2">
                <span className="font-semibold block text-white">Can you handle 20ft container?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCanHandle20ft(true)}
                    className={`flex-1 py-1 rounded text-xs font-bold ${canHandle20ft ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanHandle20ft(false)}
                    className={`flex-1 py-1 rounded text-xs font-bold ${!canHandle20ft ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="bg-[#1a2a3f] p-3 rounded-xl border border-white/10 space-y-2">
                <span className="font-semibold block text-white">Can you handle 40ft container?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCanHandle40ft(true)}
                    className={`flex-1 py-1 rounded text-xs font-bold ${canHandle40ft ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanHandle40ft(false)}
                    className={`flex-1 py-1 rounded text-xs font-bold ${!canHandle40ft ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="bg-[#1a2a3f] p-3 rounded-xl border border-white/10 space-y-2">
                <span className="font-semibold block text-white">Wide load permit active?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasWideLoadPermit(true)}
                    className={`flex-1 py-1 rounded text-xs font-bold ${hasWideLoadPermit ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasWideLoadPermit(false)}
                    className={`flex-1 py-1 rounded text-xs font-bold ${!hasWideLoadPermit ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: SafeBoda Trust Documents */}
          <div className="bg-[#0f1c2e] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                Trust Verification Documents
              </span>
              {isOnlySaloonOrLight && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Saloon / Small Car: Driving Permit + Photo Only!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">National ID Number (NIN):</label>
                <input
                  type="text"
                  required
                  value={nin}
                  onChange={(e) => setNin(e.target.value.toUpperCase())}
                  className="w-full bg-[#1a2a3f] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-orange-400 uppercase"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">Commercial Driving Permit:</label>
                <div className="flex items-center gap-2 p-2 bg-[#1a2a3f] rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] text-white/80 truncate">Uganda Driving License Verified</span>
                </div>
              </div>

              {!isOnlySaloonOrLight && (
                <div>
                  <label className="text-[11px] font-bold text-white/70 block mb-1">URA Truck Logbook:</label>
                  <div className="flex items-center gap-2 p-2 bg-[#1a2a3f] rounded-xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] text-white/80 truncate">URA_Logbook_Verified.pdf</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">Vehicle Exterior Photo:</label>
                <div className="flex items-center gap-2 p-2 bg-[#1a2a3f] rounded-xl border border-white/10">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] text-white/80 truncate">Vehicle_Front_Inspection.jpg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
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
              <Truck className="w-4 h-4" />
              <span>Submit Transporter Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
