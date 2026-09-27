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

// Base rate per kilometer in UGX
const VEHICLE_BASE_RATES: Record<VehicleType, { ratePerKmUGX: number; minBaseFeeUGX: number }> = {
  pickup: { ratePerKmUGX: 2800, minBaseFeeUGX: 85000 },
  fuso: { ratePerKmUGX: 4600, minBaseFeeUGX: 200000 },
  box_truck: { ratePerKmUGX: 5200, minBaseFeeUGX: 260000 },
  flatbed: { ratePerKmUGX: 7900, minBaseFeeUGX: 450000 },
  semi_trailer: { ratePerKmUGX: 8800, minBaseFeeUGX: 550000 },
  refrigerated: { ratePerKmUGX: 9500, minBaseFeeUGX: 600000 },
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

// Global Price Engine with historical pricing model
export function estimateTransportPrice(
  pickupCoords: { lat: number; lng: number },
  deliveryCoords: { lat: number; lng: number },
  vehicleType: VehicleType,
  weightTons: number
): RouteQuote {
  const distanceKm = Math.max(12, calculateHaversineDistanceKm(
    pickupCoords.lat,
    pickupCoords.lng,
    deliveryCoords.lat,
    deliveryCoords.lng
  ));

  const vehicleRates = VEHICLE_BASE_RATES[vehicleType] || VEHICLE_BASE_RATES.fuso;
  const rawMileageCost = distanceKm * vehicleRates.ratePerKmUGX;
  const baseHaulageUGX = Math.max(vehicleRates.minBaseFeeUGX, rawMileageCost);

  // Weight surcharge for heavy tonnage
  const weightSurchargeUGX = Math.round(weightTons * 12500 * (distanceKm / 100));

  // Fuel baseline & terminal handling buffer
  const fuelAdjustmentUGX = Math.round(distanceKm * 350);

  const subtotalBeforeFee = baseHaulageUGX + weightSurchargeUGX + fuelAdjustmentUGX;
  
  // App administration fee (10% as specified)
  const adminFeeUGX = Math.round(subtotalBeforeFee * 0.10);
  
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
      minUGX: Math.round(negotiationStartingPriceUGX * 0.88),
      maxUGX: Math.round(negotiationStartingPriceUGX * 1.15),
    }
  };
}
