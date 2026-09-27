import { ICD, Transporter } from '../types';
import { calculateHaversineDistanceKm } from './pricingEngine';

export const DEFAULT_ICDS: ICD[] = [
  {
    id: 'icd-001',
    name: 'Multiple ICD',
    location: 'Near URA HQ, Nakawa, Kampala',
    lat: 0.3576,
    lng: 32.6099,
    contact: '+256 414 286 100 / ops@multipleicd.co.ug',
    operatingHours: '24/7 Customs Clearance & Bonded Yard',
    storageFeePerDay: 50000,
    capacityTEU: 3200,
    description: 'Premier inland container terminal adjacent to Uganda Revenue Authority (URA) Headquarters. Direct rail and road interchange for transit cargo.',
    customsCleared: true,
  },
  {
    id: 'icd-002',
    name: 'Maina ICD',
    location: 'Near URA HQ, Nakawa, Kampala',
    lat: 0.3592,
    lng: 32.6120,
    contact: '+256 772 401 889 / freight@mainaicd.ug',
    operatingHours: '06:00 AM - 10:00 PM (Mon - Sat)',
    storageFeePerDay: 50000,
    capacityTEU: 1800,
    description: 'Specialized dry port for containerized breakbulk, steel rebar, and imported commercial machinery with rapid inspection bays.',
    customsCleared: true,
  },
  {
    id: 'icd-003',
    name: 'Good Brothers ICD',
    location: 'Namanve Industrial Area, Mukono Road',
    lat: 0.3541,
    lng: 32.7056,
    contact: '+256 701 552 331 / dispatch@goodbrothers.co.ug',
    operatingHours: '24/7 Heavy Cargo Terminal',
    storageFeePerDay: 55000,
    capacityTEU: 4500,
    description: 'Ultra-modern logistics park spanning 40 acres in Namanve Industrial Estate. Heavy forklift fleet, bonded warehouses, and cold-chain reefer plug-ins.',
    customsCleared: true,
  },
  {
    id: 'icd-004',
    name: 'APM Terminal ICD',
    location: 'Namuwongo Rail Siding, Kampala',
    lat: 0.3080,
    lng: 32.5980,
    contact: '+256 312 900 450 / kampala.support@apmterminals.com',
    operatingHours: '07:00 AM - 09:00 PM (Daily)',
    storageFeePerDay: 50000,
    capacityTEU: 2400,
    description: 'Global standard container depot connected to the Uganda Railways corridor. Efficient gate-in/gate-out turnaround for maritime shipping lines.',
    customsCleared: true,
  },
  {
    id: 'icd-005',
    name: 'Bolloré / Transami Logistics ICD',
    location: 'Bweyogerere Transit Corridor, Jinja Road',
    lat: 0.3562,
    lng: 32.6841,
    contact: '+256 414 340 200 / ops.uganda@bollore.com',
    operatingHours: '24/7 Bonded Container Freight Station',
    storageFeePerDay: 60000,
    capacityTEU: 3800,
    description: 'High-security customs bonded hub for cross-border transit towards DRC, Rwanda, and South Sudan with dedicated hazardous material storage.',
    customsCleared: true,
  },
  {
    id: 'icd-006',
    name: 'Malaba Inland Container Depot',
    location: 'Malaba Uganda-Kenya Border Post',
    lat: 0.6347,
    lng: 34.2750,
    contact: '+256 782 119 004 / clearance@malaba-icd.ug',
    operatingHours: '24/7 Continuous Port Customs Operations',
    storageFeePerDay: 45000,
    capacityTEU: 5000,
    description: 'Frontier dry port receiving freight directly from Mombasa Port via the Northern Corridor. One-Stop Border Post (OSBP) certified.',
    customsCleared: true,
  },
];

const STORAGE_KEY = 'maximus_icds_v1';

/**
 * Retrieve ICDs from localStorage or return default initial set
 */
export function getStoredICDs(): ICD[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored ICDs:', e);
  }
  return DEFAULT_ICDS;
}

/**
 * Save ICDs collection to local storage
 */
export function saveStoredICDs(icds: ICD[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(icds));
  } catch (e) {
    console.error('Error saving ICDs to storage:', e);
  }
}

/**
 * Check if transporter is parked within geofence radius (default 5km) of an ICD
 */
export function isTransporterNearICD(
  transporterLat: number,
  transporterLng: number,
  icdLat: number,
  icdLng: number,
  radiusKm = 5
): boolean {
  const dist = calculateHaversineDistanceKm(transporterLat, transporterLng, icdLat, icdLng);
  return dist <= radiusKm;
}

/**
 * Get distance from location to ICD in km
 */
export function getDistanceToICD(
  lat: number,
  lng: number,
  icd: ICD
): number {
  return calculateHaversineDistanceKm(lat, lng, icd.lat, icd.lng);
}

/**
 * Find all transporters currently parked within radiusKm (5km) of a given ICD
 */
export function getTransportersNearICD(
  icd: ICD,
  transporters: Transporter[],
  radiusKm = 5
): { transporter: Transporter; distanceKm: number }[] {
  return transporters
    .map(t => ({
      transporter: t,
      distanceKm: getDistanceToICD(t.currentLocation.lat, t.currentLocation.lng, icd),
    }))
    .filter(item => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * ICD Storage & Demurrage fee calculator
 * Base rate: UGX 50,000 per extra day (or custom rate per ICD)
 * Nature multiplier adjusts based on cargo type (e.g. Cold Chain, Hazardous, Oversized)
 */
export function calculateICDStorageFee(
  extraDays: number,
  baseRatePerDayUGX: number = 50000,
  natureMultiplier: number = 1.0
): {
  extraDays: number;
  effectiveDailyRateUGX: number;
  totalStorageFeeUGX: number;
  breakdown: string;
} {
  const safeDays = Math.max(0, Math.round(extraDays));
  const effectiveDailyRate = Math.round(baseRatePerDayUGX * natureMultiplier);
  const total = safeDays * effectiveDailyRate;

  return {
    extraDays: safeDays,
    effectiveDailyRateUGX: effectiveDailyRate,
    totalStorageFeeUGX: total,
    breakdown: `${safeDays} extra day(s) × ${effectiveDailyRate.toLocaleString()} UGX/day`,
  };
}
