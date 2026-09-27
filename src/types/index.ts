export type UserRole = 'client' | 'transporter' | 'admin';

export type Currency = 'UGX' | 'USD' | 'EUR' | 'KES' | 'TZS';

export type Language = 'en' | 'lg' | 'sw' | 'fr';

export type VehicleType = 
  | 'pickup'          // 1 - 2 Tonnes
  | 'fuso'            // 5 - 10 Tonnes (standard East Africa workhorse)
  | 'box_truck'       // 7 - 12 Tonnes enclosed
  | 'semi_trailer'    // 25 - 40 Tonnes
  | 'flatbed'         // 20 - 35 Tonnes construction/steel
  | 'refrigerated';   // 10 - 25 Tonnes cold-chain

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
  kycDocs: {
    drivingLicense: boolean;
    vehicleLogbook: boolean;
    commercialInsurance: boolean;
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
  vehicleOffered: string;
  offeredPriceUGX: number;
  counterPriceUGX?: number;
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
  adminFeeUGX: number; // Tiered: 15% single, 10% bulk
  commissionRatePercent?: number; // 15 or 10
  shipmentType?: 'single' | 'bulk';
  clientBudgetUGX: number;
  agreedPriceUGX?: number;
  desiredVehicleType: VehicleType;
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
