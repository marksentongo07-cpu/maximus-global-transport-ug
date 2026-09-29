export type UserRole = 'client' | 'transporter' | 'admin';

export type Currency = 'UGX' | 'USD' | 'EUR' | 'KES' | 'TZS';

export type Language = 'en' | 'lg' | 'sw' | 'fr';

export type VehicleGroup = 'small_express' | 'medium_truck' | 'heavy_long' | 'specialized' | 'custom';

export type VehicleType = 
  // GROUP 1 - SMALL & EXPRESS (for parcels, documents, small cargo)
  | 'saloon_car'          // Saloon Car / Sedan (500kg, urgent documents, small parcels Kampala)
  | 'hatchback'           // Hatchback / Small Car (700kg)
  | 'station_wagon'       // Station Wagon (1T, traders Kikuubo)
  | 'pickup_single'       // Pickup Single Cab (1.5T)
  | 'pickup_double'       // Pickup Double Cab (1.2T)
  | 'pickup'              // General Pickup
  // GROUP 2 - MEDIUM TRUCKS (Uganda local)
  | 'canter_3t'           // Canter 3T (3-4 tonnes, 14ft body)
  | 'fuso'                // Fuso 5T / 7T (5-7 tonnes, 20ft body, most popular in UG)
  | 'fuso_fighter_10t'    // Fuso Fighter 10T (10 tonnes)
  | 'box_truck'           // Box Body Truck 15T (for fragile goods)
  | 'refrigerated'        // Refrigerated Truck / Cold Chain (10-25T)
  // GROUP 3 - HEAVY & LONG DISTANCE
  | 'semi_trailer_20ft'   // Semi-Trailer 20ft Container (28T, Mombasa-Kampala corridor)
  | 'semi_trailer_40ft'   // Semi-Trailer 40ft Container (30-35T, Mombasa-Kampala)
  | 'semi_trailer_40ft_hc'// Semi-Trailer 40ft High Cube
  | 'semi_trailer'        // Standard Semi-Trailer (25-40T)
  | 'flatbed'             // Flatbed Trailer 20ft / 40ft (20-35T)
  | 'lowbed_loader'       // Lowbed Trailer / Low Loader (excavators, heavy machinery)
  | 'wide_load_truck'     // Wide Load / Abnormal Load Truck (with escort)
  // GROUP 4 - SPECIALIZED
  | 'fuel_tanker'         // Fuel Tanker (diesel, petrol)
  | 'dump_tipper'         // Dump Truck / Tipper (murram, sand)
  | 'car_carrier'         // Car Carrier / Car Transporter (Mombasa import)
  | 'boda_boda'           // Motorcycle / Boda Boda (last mile 50kg)
  | 'van'                 // Van / Mini Van
  | 'other';              // Custom / Other

export type CargoType = 
  | 'General Goods'
  | 'Containers (20ft/40ft)'
  | 'Wide/Abnormal Load (requires permit)'
  | 'Perishable/Cold Chain'
  | 'Fragile'
  | 'Vehicle/Car'
  | 'Small Parcel/Document';

export interface ContainerDetails {
  containerNumber?: string;
  sealNumber?: string;
  shippingLine?: 'Maersk' | 'CMA CGM' | 'MSC' | 'PIL' | 'COSCO' | 'Hapag-Lloyd' | 'Other';
  port?: 'Mombasa Port' | 'Dar es Salaam Port' | 'Entebbe' | 'Other';
  containerSize?: '20ft' | '40ft' | '40ft HC';
}

export interface WideLoadDetails {
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  weightTons: number;
  uraPermitNeeded: boolean;
  policeEscortNeeded: boolean;
  estimatedEscortFeeUGX?: number;
  uraPermitFeeUGX?: number;
}

export type JobStatus = 
  | 'open'            // Receiving bids
  | 'negotiating'     // Price offers being exchanged
  | 'escrow_pending'  // Price agreed, awaiting client escrow deposit
  | 'booked'          // Escrow funded, transporter dispatched
  | 'loaded'          // Cargo loaded & secured at pickup
  | 'in_transit'      // On the road with live GPS
  | 'arrived'         // At destination
  | 'delivered'       // Client signature & POD confirmed, escrow released
  | 'disputed';       // In arbitration

export interface Vehicle {
  id: string;
  transporterId: string;
  type: VehicleType;
  name: string; // e.g. "Isuzu Fuso Fighter 10T"
  plateNumber: string;
  capacityTons: number;
  availableUnits: number;
  currentLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  ratePerKmUGX: number;
  photoUrl?: string;
}

export interface Transporter {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  maskedPhone: string;
  email: string;
  avatarUrl: string;
  rating: number;
  totalTrips: number;
  loyaltyPoints: number;
  badges: string[];
  kycStatus: 'verified' | 'pending' | 'rejected';
  nin?: string;
  kycDocs: {
    drivingLicense: boolean;
    vehicleLogbook: boolean;
    commercialInsurance: boolean;
    nationalId?: boolean;
    truckPhoto?: boolean;
    nationalIdUrl?: string;
    drivingPermitUrl?: string;
    logbookUrl?: string;
    truckPhotoUrl?: string;
    verifiedAt?: string;
  };
  payoutDetails: {
    mobileMoneyNumber: string;
    mobileMoneyNetwork: 'MTN' | 'AIRTEL';
    bankName: string;
    bankAccountNumber: string;
    accountName: string;
  };
  vehicles: Vehicle[];
  isAvailable: boolean;
  status: 'active' | 'suspended';
  handles20ftContainer?: boolean;
  handles40ftContainer?: boolean;
  hasWideLoadPermit?: boolean;
  ownedVehicleTypes?: VehicleType[];
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface CargoDimensions {
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
}

export interface JobOffer {
  id: string;
  jobId: string;
  transporterId: string;
  transporterName: string;
  transporterRating: number;
  transporterPhone?: string;
  transporterDistanceKm?: number; // e.g. "3km away"
  vehicleOffered: string; // e.g. "Fuso 7T", "Custom: Toyota Wish 1.8 with carrier"
  customVehicleDetails?: string;
  offeredPriceUGX: number;
  counterPriceUGX?: number;
  isNegotiable?: boolean;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  messages: {
    id: string;
    senderRole: 'client' | 'transporter';
    senderName: string;
    message: string;
    timestamp: string;
    proposedPriceUGX?: number;
  }[];
  createdAt: string;
}

export interface ICD {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  contact: string;
  operatingHours: string;
  storageFeePerDay: number; // in UGX (default 50,000)
  capacityTEU?: number;
  description?: string;
  customsCleared?: boolean;
}

export interface Job {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  cargoDescription: string;
  weightTons: number;
  dimensions?: CargoDimensions;
  category: 'Agriculture' | 'Building Materials' | 'Manufactured Goods' | 'Cold Chain / Perishables' | 'Machinery' | 'General Freight';
  pickupLocation: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  estimatedDistanceKm: number;
  marketPriceEstimateUGX: number;
  adminFeeUGX: number; // 8% platform escrow fee
  commissionRatePercent?: number; // 8%
  shipmentType?: 'single' | 'bulk';
  clientBudgetUGX: number;
  isNegotiable?: boolean;
  agreedPriceUGX?: number;
  desiredVehicleType: VehicleType | string;
  customVehicleType?: string;
  cargoType?: CargoType;
  containerDetails?: ContainerDetails;
  wideLoadDetails?: WideLoadDetails;
  pickupDate: string;
  photoUrl?: string;
  status: JobStatus;
  assignedTransporterId?: string;
  assignedTransporter?: Transporter;
  offers: JobOffer[];
  escrowStatus: 'none' | 'held' | 'released' | 'refunded';
  escrowTransactionId?: string;
  paymentMethod?: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'FLUTTERWAVE' | 'PESAPAL' | 'STRIPE' | 'BANK_TRANSFER';
  isICDJob?: boolean;
  pickupICDId?: string;
  pickupICDName?: string;
  extraStorageDays?: number;
  extraStorageFeeUGX?: number;
  clientRefundDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    mobileMoneyNumber?: string;
    mobileMoneyNetwork?: 'MTN' | 'AIRTEL';
  };
  currentGps?: {
    lat: number;
    lng: number;
    lastUpdated: string;
    progressPercent: number;
  };
  proofOfDelivery?: {
    signatureDataUrl?: string;
    recipientName: string;
    photoUrl?: string;
    timestamp: string;
    confirmationNote?: string;
    confirmedByAdmin?: boolean;
    confirmedByAdminEmail?: string;
    confirmedAt?: string;
  };
  payoutStatus?: 'pending_pod' | 'pending_admin_approval' | 'ready_for_payout' | 'paid';
  payoutTransaction?: {
    method: 'MOBILE_MONEY' | 'BANK_TRANSFER';
    amountUGX: number;
    recipientName: string;
    recipientPhoneOrAccount: string;
    networkOrBank: string;
    proofUrl?: string;
    proofReference?: string;
    approvedBy: string; // marksentongo07@gmail.com
    paidAt: string;
    notes?: string;
  };
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface EscrowTransaction {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  transporterId: string;
  transporterName: string;
  totalAmountUGX: number;
  platformFeeUGX: number; // 10%
  transporterPayoutUGX: number; // 90%
  status: 'held' | 'released' | 'refunded' | 'disputed';
  paymentMethod: string;
  referenceNumber: string;
  createdAt: string;
  releasedAt?: string;
}

export interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  openedBy: 'client' | 'transporter';
  openerName: string;
  reason: 'Cargo Damage' | 'Severe Delay' | 'Cargo Discrepancy' | 'Vehicle Breakdown' | 'Payment Issue';
  description: string;
  evidenceUrls: string[];
  status: 'open' | 'under_review' | 'resolved_refund_client' | 'resolved_pay_transporter';
  resolutionNotes?: string;
  amountAtStakeUGX: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  popularServices: string[];
  providerCount: number;
  isHaulageCore?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  profession: string;
  rating: number;
  reviewCount: number;
  location: string;
  hourlyRateUGX: number;
  verified: boolean;
  avatarUrl: string;
  phone: string;
  bio: string;
  specialties: string[];
}
