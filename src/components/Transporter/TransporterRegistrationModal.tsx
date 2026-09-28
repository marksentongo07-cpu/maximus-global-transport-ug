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
  Lock
} from 'lucide-react';
import { Transporter, VehicleType, Vehicle } from '../../types';

interface TransporterRegistrationModalProps {
  onClose: () => void;
  onRegisterTransporter: (newTransporter: Transporter) => void;
}

export const TransporterRegistrationModal: React.FC<TransporterRegistrationModalProps> = ({
  onClose,
  onRegisterTransporter,
}) => {
  const [name, setName] = useState('Moses Ochen');
  const [companyName, setCompanyName] = useState('Ochen Swift Freight Uganda Ltd');
  const [phone, setPhone] = useState('+256 774 912 384');
  const [nin, setNin] = useState('CM840291039KPA');
  const [truckType, setTruckType] = useState<VehicleType>('fuso');
  const [plateNumber, setPlateNumber] = useState('UBN 771K');
  const [truckName, setTruckName] = useState('Isuzu Fuso Forward 10-Tonne Box');
  const [capacityTons, setCapacityTons] = useState<number>(10);
  const [ratePerKmUGX, setRatePerKmUGX] = useState<number>(5500);

  // Upload states (simulated high-res uploads with immediate visual confirmation)
  const [permitUploaded, setPermitUploaded] = useState(true);
  const [permitFileName, setPermitFileName] = useState('UDLS_Commercial_Permit_CH_MosesOchen.pdf');

  const [nationalIdUploaded, setNationalIdUploaded] = useState(true);
  const [nationalIdFileName, setNationalIdFileName] = useState('NIRA_Uganda_National_ID_MosesOchen.jpg');

  const [logbookUploaded, setLogbookUploaded] = useState(true);
  const [logbookFileName, setLogbookFileName] = useState('URA_Logbook_UBN771K_Certificate.pdf');

  const [truckPhotoUploaded, setTruckPhotoUploaded] = useState(true);
  const [truckPhotoFileName, setTruckPhotoFileName] = useState('Isuzu_Fuso_UBN771K_Exterior_Front.jpg');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransporterId = 'trans-' + Date.now().toString().slice(-4);
    const newVehicle: Vehicle = {
      id: 'veh-' + Date.now().toString().slice(-4),
      transporterId: newTransporterId,
      type: truckType,
      name: truckName || `${plateNumber} (${capacityTons}T)`,
      plateNumber: plateNumber.toUpperCase(),
      capacityTons,
      availableUnits: 1,
      ratePerKmUGX,
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
      kycStatus: 'pending', // Pending Admin verification to stop scammers!
      nin: nin.toUpperCase(),
      kycDocs: {
        drivingLicense: permitUploaded,
        vehicleLogbook: logbookUploaded,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#1a2a3f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0f1c2e] to-[#1a2a3f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white flex items-center gap-2">
                <span>Transporter Registration &amp; Fleet Onboarding</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500 text-black font-extrabold uppercase">
                  SafeBoda Trust Standard
                </span>
              </h3>
              <p className="text-[14px] text-white/60 leading-6">
                Register your vehicle to bid on loads. Super Admin verifies your credentials to stop cargo theft.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SafeBoda Trust Notification Banner */}
        <div className="bg-slate-900/90 border-b border-white/10 px-6 py-3 flex items-center gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-white/80 leading-relaxed">
            <strong>Mandatory Anti-Scam Trust Policy:</strong> To protect clients and legitimate drivers like SafeBoda, transporters must upload their <strong>National ID (NIN)</strong>, <strong>URA Truck Logbook</strong>, and <strong>Photo of Truck</strong>. Super Admin Mark Sentongo verifies credentials before live bidding unlocks.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Section 1: Transporter Personal / Company Info */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>1. Driver &amp; Fleet Company Profile</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 block mb-1 font-semibold">Primary Driver / Fleet Owner Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400"
                  placeholder="e.g. Moses Ochen"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Company / Trading Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400"
                  placeholder="e.g. Ochen Swift Freight Logistics Ltd"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Phone Number / WhatsApp (MoMo Payouts) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400 font-mono"
                  placeholder="+256 772 ..."
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">National Identification Number (NIN) *</label>
                <input
                  type="text"
                  required
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400 uppercase font-mono font-bold"
                  placeholder="CM840291039KPA"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Truck Details */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-[14px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-400" />
              <span>2. Truck Specs &amp; Registration</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-white/70 block mb-1 font-semibold">Truck Category *</label>
                <select
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value as VehicleType)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-400"
                >
                  <option value="fuso">Fuso 5 - 10 Tonnes (Standard Workhorse)</option>
                  <option value="semi_trailer">Semi-Trailer 25 - 40 Tonnes (Articulated)</option>
                  <option value="box_truck">Box Truck 7 - 12 Tonnes (Enclosed)</option>
                  <option value="pickup">Pickup 1 - 2 Tonnes</option>
                  <option value="flatbed">Flatbed 20 - 35 Tonnes (Steel/Rebar)</option>
                  <option value="refrigerated">Cold Chain Reefer 10 - 25 Tonnes</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Number Plate *</label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-400 uppercase font-mono font-bold"
                  placeholder="UBN 771K"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-semibold">Payload Capacity (Tonnes) *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={capacityTons}
                  onChange={(e) => setCapacityTons(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: SafeBoda-Style Anti-Scammer KYC Documents */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3. Mandatory KYC Verification Documents (4 Required)</span>
              </h4>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Safe &amp; Confidential
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Doc 1: Driving Permit */}
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-white">Commercial Driving Permit *</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-white/60">Class CH / CM heavy vehicle license</p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-emerald-300 font-mono flex items-center justify-between">
                  <span className="truncate">{permitFileName}</span>
                  <span className="text-[9px] text-white/50">Attached</span>
                </div>
              </div>

              {/* Doc 2: National ID */}
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-white">National ID (Front &amp; Back) *</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-white/60">Government NIRA National ID match</p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-emerald-300 font-mono flex items-center justify-between">
                  <span className="truncate">{nationalIdFileName}</span>
                  <span className="text-[9px] text-white/50">Attached</span>
                </div>
              </div>

              {/* Doc 3: URA Truck Logbook */}
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-white">URA Truck Logbook *</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-white/60">Vehicle ownership certificate with plate</p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-emerald-300 font-mono flex items-center justify-between">
                  <span className="truncate">{logbookFileName}</span>
                  <span className="text-[9px] text-white/50">Attached</span>
                </div>
              </div>

              {/* Doc 4: Photo of Truck */}
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-white">Photo of Truck *</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-white/60">Exterior photo clearly showing plate {plateNumber}</p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-emerald-300 font-mono flex items-center justify-between">
                  <span className="truncate">{truckPhotoFileName}</span>
                  <span className="text-[9px] text-white/50">Attached</span>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[11px] text-white/60">
              By clicking "Register &amp; View Loads", you agree to Maximus Carrier Escrow &amp; Dispute rules.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-white/70 hover:text-white bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm rounded-full shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
              >
                <span>Register &amp; Find Loads to Bid</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
