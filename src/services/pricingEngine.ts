import { VehicleType } from '../types';

export interface RouteQuote {
  distanceKm: number;
  baseHaulageUGX: number;
  weightSurchargeUGX: number;
  fuelAdjustmentUGX: number;
  adminFeeUGX: number; // 10%
  totalMarketEstimateUGX: number;
  negotiationStartingPriceUGX: number;
  fairPriceRange: {
    minUGX: number;
    maxUGX: number;
  };
}

// Ugandan and Regional Hub Coordinates
export const KNOWN_HUBS: Record<string, { lat: number; lng: number; name: string }> = {
  'kampala': { lat: 0.3476, lng: 32.5825, name: 'Kampala Central Business District' },
  'namanve': { lat: 0.3541, lng: 32.7056, name: 'Namanve Industrial Park' },
  'entebbe': { lat: 0.0512, lng: 32.4637, name: 'Entebbe International Airport / Port' },
  'jinja': { lat: 0.4479, lng: 33.2026, name: 'Jinja Heavy Industrial Corridor' },
  'mbale': { lat: 1.0784, lng: 34.1816, name: 'Mbale Agro-Trading Hub' },
  'gulu': { lat: 2.7747, lng: 32.2990, name: 'Gulu Northern Logistics Center' },
  'mbarara': { lat: -0.6072, lng: 30.6545, name: 'Mbarara Western Logistics & Dairy Terminal' },
  'fort_portal': { lat: 0.6545, lng: 30.2744, name: 'Fort Portal Western Route' },
  'tororo': { lat: 0.6929, lng: 34.1809, name: 'Tororo Cement & Mining Zone' },
  'busia': { lat: 0.4608, lng: 34.0909, name: 'Busia Border Crossing (Kenya)' },
  'malaba': { lat: 0.6347, lng: 34.2750, name: 'Malaba Border Port' },
  'nairobi': { lat: -1.286389, lng: 36.817223, name: 'Nairobi Commercial Hub (Kenya)' },
  'mombasa': { lat: -4.0435, lng: 39.6682, name: 'Mombasa Ocean Port (Kenya)' },
  'kigali': { lat: -1.9441, lng: 30.0619, name: 'Kigali Free Trade Zone (Rwanda)' },
};

// Base rate per kilometer in UGX and minimum base fare
export const VEHICLE_BASE_RATES: Record<VehicleType, { ratePerKmUGX: number; minBaseFeeUGX: number; label: string; group: string }> = {
  // Group 1 - Small & Express
  saloon_car: { ratePerKmUGX: 1000, minBaseFeeUGX: 15000, label: 'Saloon Car / Sedan (500kg)', group: 'Small & Express' },
  hatchback: { ratePerKmUGX: 1100, minBaseFeeUGX: 18000, label: 'Hatchback / Small Car (700kg)', group: 'Small & Express' },
  station_wagon: { ratePerKmUGX: 1300, minBaseFeeUGX: 25000, label: 'Station Wagon (1T)', group: 'Small & Express' },
  pickup_single: { ratePerKmUGX: 1500, minBaseFeeUGX: 40000, label: 'Pickup Single Cab (1.5T)', group: 'Small & Express' },
  pickup_double: { ratePerKmUGX: 1500, minBaseFeeUGX: 45000, label: 'Pickup Double Cab (1.2T)', group: 'Small & Express' },
  pickup: { ratePerKmUGX: 1500, minBaseFeeUGX: 40000, label: 'Standard Pickup (1.5T)', group: 'Small & Express' },

  // Group 2 - Medium Trucks
  canter_3t: { ratePerKmUGX: 2500, minBaseFeeUGX: 80000, label: 'Canter 3T (3-4 Tonnes)', group: 'Medium Trucks' },
  fuso: { ratePerKmUGX: 3500, minBaseFeeUGX: 150000, label: 'Fuso 5T / 7T (Standard UG Workhorse)', group: 'Medium Trucks' },
  fuso_fighter_10t: { ratePerKmUGX: 4200, minBaseFeeUGX: 220000, label: 'Fuso Fighter 10T', group: 'Medium Trucks' },
  box_truck: { ratePerKmUGX: 4800, minBaseFeeUGX: 250000, label: 'Box Body Truck 15T (Fragile)', group: 'Medium Trucks' },
  refrigerated: { ratePerKmUGX: 5800, minBaseFeeUGX: 350000, label: 'Refrigerated Truck / Cold Chain', group: 'Medium Trucks' },

  // Group 3 - Heavy & Long Distance
  semi_trailer_20ft: { ratePerKmUGX: 6500, minBaseFeeUGX: 6845000, label: 'Semi-Trailer 20ft Container (28T)', group: 'Heavy & Long Distance' },
  semi_trailer_40ft: { ratePerKmUGX: 7800, minBaseFeeUGX: 10360000, label: 'Semi-Trailer 40ft Container (30-35T)', group: 'Heavy & Long Distance' },
  semi_trailer_40ft_hc: { ratePerKmUGX: 8200, minBaseFeeUGX: 10800000, label: 'Semi-Trailer 40ft High Cube', group: 'Heavy & Long Distance' },
  semi_trailer: { ratePerKmUGX: 7500, minBaseFeeUGX: 500000, label: 'Semi-Trailer (25-40T)', group: 'Heavy & Long Distance' },
  flatbed: { ratePerKmUGX: 6800, minBaseFeeUGX: 450000, label: 'Flatbed Trailer 20ft / 40ft', group: 'Heavy & Long Distance' },
  lowbed_loader: { ratePerKmUGX: 9500, minBaseFeeUGX: 750000, label: 'Lowbed Trailer / Low Loader (Excavators/Machinery)', group: 'Heavy & Long Distance' },
  wide_load_truck: { ratePerKmUGX: 11000, minBaseFeeUGX: 950000, label: 'Wide Load / Abnormal Load (Escort + URA)', group: 'Heavy & Long Distance' },

  // Group 4 - Specialized
  fuel_tanker: { ratePerKmUGX: 7000, minBaseFeeUGX: 500000, label: 'Fuel Tanker (Diesel / Petrol)', group: 'Specialized' },
  dump_tipper: { ratePerKmUGX: 3800, minBaseFeeUGX: 120000, label: 'Dump Truck / Tipper (Murram / Sand)', group: 'Specialized' },
  car_carrier: { ratePerKmUGX: 7500, minBaseFeeUGX: 600000, label: 'Car Carrier / Transporter', group: 'Specialized' },
  boda_boda: { ratePerKmUGX: 600, minBaseFeeUGX: 5000, label: 'Motorcycle / Boda Boda (Last Mile 50kg)', group: 'Specialized' },
  van: { ratePerKmUGX: 1800, minBaseFeeUGX: 50000, label: 'Van / Mini Van (1.5-2T)', group: 'Specialized' },
  other: { ratePerKmUGX: 3500, minBaseFeeUGX: 100000, label: 'Other / Custom Vehicle', group: 'Custom' },
};

// Haversine distance in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadWiggleFactor = 1.28; // Standard road distance multiplier over straight line
  return Math.round(R * c * roadWiggleFactor);
}

// Global Price Engine with free-market guidance model
export function estimateTransportPrice(
  pickupCoords: { lat: number; lng: number },
  deliveryCoords: { lat: number; lng: number },
  vehicleType: VehicleType | string,
  weightTons: number,
  options?: {
    isWideLoad?: boolean;
    wideDimensions?: { lengthMeters: number; widthMeters: number; heightMeters: number };
    escortNeeded?: boolean;
    uraPermitNeeded?: boolean;
  }
): RouteQuote {
  const distanceKm = Math.max(8, calculateHaversineDistanceKm(
    pickupCoords.lat,
    pickupCoords.lng,
    deliveryCoords.lat,
    deliveryCoords.lng
  ));

  const validVehicleType = (vehicleType in VEHICLE_BASE_RATES) ? (vehicleType as VehicleType) : 'fuso';
  const vehicleRates = VEHICLE_BASE_RATES[validVehicleType] || VEHICLE_BASE_RATES.fuso;

  let baseHaulageUGX = 0;

  // Specific user pricing rules:
  // 1. 20ft Container Mombasa-Kampala: $1,850 flat (~6,845,000 UGX)
  // 2. 40ft Container Mombasa-Kampala: $2,800 flat (~10,360,000 UGX)
  if (validVehicleType === 'semi_trailer_20ft') {
    baseHaulageUGX = distanceKm > 700 ? 6845000 : Math.max(vehicleRates.minBaseFeeUGX, distanceKm * vehicleRates.ratePerKmUGX);
  } else if (validVehicleType === 'semi_trailer_40ft' || validVehicleType === 'semi_trailer_40ft_hc') {
    baseHaulageUGX = distanceKm > 700 ? 10360000 : Math.max(vehicleRates.minBaseFeeUGX, distanceKm * vehicleRates.ratePerKmUGX);
  } else if (validVehicleType === 'saloon_car') {
    // Saloon car: 1,000 UGX per km (Kampala local)
    baseHaulageUGX = Math.max(15000, distanceKm * 1000);
  } else if (validVehicleType === 'pickup' || validVehicleType === 'pickup_single' || validVehicleType === 'pickup_double') {
    // Pickup: 1,500 UGX per km
    baseHaulageUGX = Math.max(35000, distanceKm * 1500);
  } else if (validVehicleType === 'fuso') {
    // Fuso 5T: 3,500 UGX per km
    baseHaulageUGX = Math.max(150000, distanceKm * 3500);
  } else {
    baseHaulageUGX = Math.max(vehicleRates.minBaseFeeUGX, distanceKm * vehicleRates.ratePerKmUGX);
  }

  // Weight surcharge for extra heavy tonnage (> 5T)
  const weightSurchargeUGX = weightTons > 5 ? Math.round(weightTons * 8500 * (distanceKm / 100)) : 0;

  // Fuel baseline
  const fuelAdjustmentUGX = Math.round(distanceKm * 250);

  let subtotalBeforeFee = baseHaulageUGX + weightSurchargeUGX + fuelAdjustmentUGX;

  // Wide Load: Dimensions + 30% escort extra + URA permit 250,000 UGX
  if (validVehicleType === 'wide_load_truck' || options?.isWideLoad) {
    const escortExtra = Math.round(subtotalBeforeFee * 0.30);
    const uraPermitFee = 250000;
    subtotalBeforeFee = subtotalBeforeFee + escortExtra + uraPermitFee;
  }

  // App administration escrow commission fee (8% on final agreed amount - MAXIMUS Free Market standard)
  const adminFeeUGX = Math.round(subtotalBeforeFee * 0.08);
  
  // Total market estimated price
  const totalMarketEstimateUGX = subtotalBeforeFee + adminFeeUGX;

  // Negotiation starting anchor (market estimate rounded to nearest 5,000 UGX)
  const negotiationStartingPriceUGX = Math.ceil(totalMarketEstimateUGX / 5000) * 5000;

  return {
    distanceKm,
    baseHaulageUGX,
    weightSurchargeUGX,
    fuelAdjustmentUGX,
    adminFeeUGX,
    totalMarketEstimateUGX,
    negotiationStartingPriceUGX,
    fairPriceRange: {
      minUGX: Math.round(negotiationStartingPriceUGX * 0.85),
      maxUGX: Math.round(negotiationStartingPriceUGX * 1.15),
    }
  };
}
