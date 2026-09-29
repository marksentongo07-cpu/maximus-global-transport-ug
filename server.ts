import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Initialize Gemini SDK with telemetry header per skill guidelines
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * POST /api/smart-bid
 * Automated Smart Bidding AI Assistant
 * Analyzes historical cargo rates for similar routes and suggests competitive counter-offers
 */
app.post('/api/smart-bid', async (req: Request, res: Response) => {
  try {
    const { job, historicalComps, language } = req.body;

    if (!job) {
      return res.status(400).json({ error: 'Job payload is required' });
    }

    const distanceKm = Number(job.estimatedDistanceKm) || 100;
    const benchmarkUGX = Number(job.marketPriceEstimateUGX) || 1200000;
    const clientBudgetUGX = job.clientBudgetUGX ? Number(job.clientBudgetUGX) : undefined;
    const weightTons = Number(job.weightTons) || 5;
    const vehicleType = job.desiredVehicleType || 'fuso';

    // Baseline algorithmic computations
    const compRates = (historicalComps || []).map((c: any) => Number(c.ratePerKmUGX) || 0).filter((r: number) => r > 0);
    const avgHistoricalRatePerKm = compRates.length > 0 
      ? Math.round(compRates.reduce((a: number, b: number) => a + b, 0) / compRates.length)
      : Math.round(benchmarkUGX / distanceKm);

    // If Gemini client is available, leverage gemini-3.8-flash for intelligent reasoning
    if (aiClient) {
      try {
        const prompt = `
You are the automated 'Smart Bidding' AI assistant for Maximus Transport Link, an East African freight logistics platform (operating in Uganda, Kenya, Rwanda).
Analyze this cargo haulage job and historical market data to suggest 3 strategic counter-offer values for the transporter:

JOB DETAILS:
- Cargo Title: ${job.title}
- Description: ${job.cargoDescription || 'General cargo'}
- Weight: ${weightTons} Tonnes
- Desired Vehicle: ${vehicleType}
- Origin: ${job.pickupLocation?.name || 'Pickup Point'}
- Destination: ${job.deliveryLocation?.name || 'Destination Point'}
- Estimated Distance: ${distanceKm} km
- Platform Benchmark Price: ${benchmarkUGX} UGX
- Shipper Budget: ${clientBudgetUGX ? `${clientBudgetUGX} UGX` : 'Open to offers'}

HISTORICAL CLOSED CONTRACTS ON SIMILAR CORRIDORS:
${JSON.stringify(historicalComps || [], null, 2)}
Average Historical Rate along corridor: ${avgHistoricalRatePerKm} UGX/km.
Language for suggested messages: ${language || 'en'} (en: English, lg: Luganda, sw: Swahili).

Generate 3 bidding strategies:
1. "aggressive": Fast close / competitive bid (88-94% win probability). Close to client budget or benchmark.
2. "balanced": Sweet spot (78-85% win probability). Optimal profit balance based on historical comps.
3. "premium": Maximum yield (60-70% win probability). For specialized service, expedited speed, delicate cargo.

All prices must be in integer UGX rounded to nearest 5,000 UGX.
Remember Maximus platform charges a 10% facilitation/escrow security fee, so net profit = price * 0.90.
Provide clear rationale referencing corridor conditions (fuel, weighbridges, return loads) and draft a polite, professional negotiation message for each.
`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                routeCorridor: { type: Type.STRING },
                corridorAverageRatePerKmUGX: { type: Type.NUMBER },
                demandLevel: { type: Type.STRING, enum: ['High', 'Moderate', 'Balanced'] },
                backhaulRisk: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
                corridorAdvice: { type: Type.STRING },
                fuelSensitivity: { type: Type.STRING },
                aiInsightNote: { type: Type.STRING },
                strategies: {
                  type: Type.OBJECT,
                  properties: {
                    aggressive: {
                      type: Type.OBJECT,
                      properties: {
                        key: { type: Type.STRING },
                        label: { type: Type.STRING },
                        badge: { type: Type.STRING },
                        recommendedPriceUGX: { type: Type.INTEGER },
                        winProbabilityPercent: { type: Type.INTEGER },
                        rationale: { type: Type.STRING },
                        suggestedMessage: { type: Type.STRING },
                      },
                      required: ['key', 'label', 'badge', 'recommendedPriceUGX', 'winProbabilityPercent', 'rationale', 'suggestedMessage'],
                    },
                    balanced: {
                      type: Type.OBJECT,
                      properties: {
                        key: { type: Type.STRING },
                        label: { type: Type.STRING },
                        badge: { type: Type.STRING },
                        recommendedPriceUGX: { type: Type.INTEGER },
                        winProbabilityPercent: { type: Type.INTEGER },
                        rationale: { type: Type.STRING },
                        suggestedMessage: { type: Type.STRING },
                      },
                      required: ['key', 'label', 'badge', 'recommendedPriceUGX', 'winProbabilityPercent', 'rationale', 'suggestedMessage'],
                    },
                    premium: {
                      type: Type.OBJECT,
                      properties: {
                        key: { type: Type.STRING },
                        label: { type: Type.STRING },
                        badge: { type: Type.STRING },
                        recommendedPriceUGX: { type: Type.INTEGER },
                        winProbabilityPercent: { type: Type.INTEGER },
                        rationale: { type: Type.STRING },
                        suggestedMessage: { type: Type.STRING },
                      },
                      required: ['key', 'label', 'badge', 'recommendedPriceUGX', 'winProbabilityPercent', 'rationale', 'suggestedMessage'],
                    },
                  },
                  required: ['aggressive', 'balanced', 'premium'],
                },
              },
              required: ['routeCorridor', 'demandLevel', 'corridorAdvice', 'strategies', 'aiInsightNote'],
            },
          },
        });

        const rawText = response.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());

          // Attach calculated fee & profit
          ['aggressive', 'balanced', 'premium'].forEach((k) => {
            const strat = parsed.strategies[k];
            if (strat) {
              const price = strat.recommendedPriceUGX;
              strat.platformFeeUGX = Math.round(price * 0.10);
              strat.estimatedNetProfitUGX = Math.round(price * 0.90);
            }
          });

          return res.json({
            jobId: job.id,
            analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            routeCorridor: parsed.routeCorridor || 'Uganda Freight Transit Corridor',
            benchmarkPriceUGX: benchmarkUGX,
            clientBudgetUGX,
            corridorAverageRatePerKmUGX: parsed.corridorAverageRatePerKmUGX || avgHistoricalRatePerKm,
            historicalSampleCount: (historicalComps || []).length,
            strategies: parsed.strategies,
            marketDynamics: {
              demandLevel: parsed.demandLevel || 'High',
              backhaulRisk: parsed.backhaulRisk || 'Low',
              fuelSensitivity: parsed.fuelSensitivity || `Diesel index for ${distanceKm}km ~${Math.round(distanceKm * 0.35 * 4500).toLocaleString()} UGX`,
              corridorAdvice: parsed.corridorAdvice || 'Standard transit protocols verified.',
            },
            aiInsightNote: parsed.aiInsightNote,
            poweredByAi: true,
          });
        }
      } catch (geminiError) {
        console.error('[Gemini Smart Bidding] Error generating AI content:', geminiError);
        // Continue to fallback below
      }
    }

    // High quality deterministic historical algorithmic fallback
    const aggPrice = Math.max(
      Math.round(benchmarkUGX * 0.92 / 5000) * 5000,
      clientBudgetUGX ? Math.round(clientBudgetUGX * 0.98 / 5000) * 5000 : Math.round(benchmarkUGX * 0.90 / 5000) * 5000
    );
    const balPrice = Math.round((benchmarkUGX * 1.02) / 5000) * 5000;
    const premPrice = Math.round((benchmarkUGX * 1.14) / 5000) * 5000;

    const fallbackResponse = {
      jobId: job.id,
      analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      routeCorridor: 'Uganda Regional Freight Corridor',
      benchmarkPriceUGX: benchmarkUGX,
      clientBudgetUGX,
      corridorAverageRatePerKmUGX: avgHistoricalRatePerKm,
      historicalSampleCount: (historicalComps || []).length,
      strategies: {
        aggressive: {
          key: 'aggressive',
          label: 'Fast-Close Competitive',
          badge: '92% Win Rate',
          recommendedPriceUGX: aggPrice,
          winProbabilityPercent: 92,
          estimatedNetProfitUGX: Math.round(aggPrice * 0.90),
          platformFeeUGX: Math.round(aggPrice * 0.10),
          rationale: `Priced at ${aggPrice.toLocaleString()} UGX (~${Math.round(aggPrice / distanceKm)} UGX/km). High likelihood of instant acceptance by shipper.`,
          suggestedMessage: `Hello, I have an inspected ${vehicleType} ready for dispatch. I can confirm this trip at ${aggPrice.toLocaleString()} UGX with GPS tracking included.`,
        },
        balanced: {
          key: 'balanced',
          label: 'Balanced Sweet Spot',
          badge: 'Recommended · 84% Win Rate',
          recommendedPriceUGX: balPrice,
          winProbabilityPercent: 84,
          estimatedNetProfitUGX: Math.round(balPrice * 0.90),
          platformFeeUGX: Math.round(balPrice * 0.10),
          rationale: `Optimal balance aligned with median comps of ${avgHistoricalRatePerKm} UGX/km. Maximizes earnings while protecting win odds.`,
          suggestedMessage: `Greetings. Based on current haulage rates and our verified rating, I can execute this trip safely at ${balPrice.toLocaleString()} UGX with full escrow protection.`,
        },
        premium: {
          key: 'premium',
          label: 'Premium Margin Yield',
          badge: '68% Win Rate · Max Margin',
          recommendedPriceUGX: premPrice,
          winProbabilityPercent: 68,
          estimatedNetProfitUGX: Math.round(premPrice * 0.90),
          platformFeeUGX: Math.round(premPrice * 0.10),
          rationale: `Targeted at ${premPrice.toLocaleString()} UGX. Recommended if cargo requires dedicated tie-downs or guaranteed morning offloading.`,
          suggestedMessage: `For expedited priority transport with cargo straps and dedicated GPS relay, our rate is ${premPrice.toLocaleString()} UGX.`,
        },
      },
      marketDynamics: {
        demandLevel: 'High',
        backhaulRisk: 'Low',
        fuelSensitivity: `Estimated fuel baseline ~${Math.round(distanceKm * 0.35 * 4500).toLocaleString()} UGX`,
        corridorAdvice: 'Corridor traffic and weighbridges normal. Solid return haulage availability in major terminals.',
      },
      aiInsightNote: `Calculated from ${historicalComps?.length || 4} historical contract benchmarks on this route.`,
      poweredByAi: false,
    };

    res.json(fallbackResponse);
  } catch (error: any) {
    console.error('Server error in /api/smart-bid:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// -------------------------------------------------------------
// Live GPS Fleet Tracking In-Memory Registry for East African Corridors
// -------------------------------------------------------------
interface BreadcrumbPoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: number;
}

interface LiveTruckLocation {
  jobId: string;
  transporterId: string;
  driverName: string;
  phone: string;
  numberPlate: string;
  cargo: string;
  destination: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  heading?: number;
  status: 'delivering' | 'empty_returning' | 'stopped';
  lastSeenLocationName: string;
  lastUpdate: number; // ms timestamp
  trail: BreadcrumbPoint[];
  vehicleType?: string;
  cargoType?: string;
}

// Initial Uganda fleet: 12 moving, 3 idle, 950k UGX in escrow
const initialFleetLocations: LiveTruckLocation[] = [
  {
    jobId: 'job-ug-101',
    transporterId: 'trans-1',
    driverName: 'Ronald Kato',
    phone: '+256 772 842 110',
    numberPlate: 'UBL 892M',
    cargo: '20T Wheat Flour',
    destination: 'Namanve ICD',
    lat: 0.3950,
    lng: 32.8800,
    speed: 54,
    heading: 260,
    status: 'delivering',
    lastSeenLocationName: 'Lugazi - Jinja Highway',
    lastUpdate: Date.now() - 45000,
    trail: [
      { lat: 0.4479, lng: 33.2026, speed: 60, timestamp: Date.now() - 1800000 },
      { lat: 0.4120, lng: 33.0500, speed: 58, timestamp: Date.now() - 1200000 },
      { lat: 0.4000, lng: 32.9500, speed: 55, timestamp: Date.now() - 600000 },
      { lat: 0.3950, lng: 32.8800, speed: 54, timestamp: Date.now() - 45000 },
    ],
  },
  {
    jobId: 'job-ug-102',
    transporterId: 'trans-2',
    driverName: 'Moses Ochen',
    phone: '+256 782 994 321',
    numberPlate: 'UBD 441L',
    cargo: '28T Steel Rebar',
    destination: 'Namanve Industrial Yard',
    lat: 0.3600,
    lng: 32.6650,
    speed: 38,
    heading: 95,
    status: 'delivering',
    lastSeenLocationName: 'Namanve Industrial Park',
    lastUpdate: Date.now() - 90000,
    trail: [
      { lat: 0.3476, lng: 32.5825, speed: 30, timestamp: Date.now() - 1500000 },
      { lat: 0.3540, lng: 32.6200, speed: 42, timestamp: Date.now() - 900000 },
      { lat: 0.3600, lng: 32.6650, speed: 38, timestamp: Date.now() - 90000 },
    ],
  },
  {
    jobId: 'job-ug-103',
    transporterId: 'trans-3',
    driverName: 'Sarah Nakitende',
    phone: '+256 701 445 889',
    numberPlate: 'UAW 320Z',
    cargo: 'Empty (Cold Reefer Return)',
    destination: 'Nakawa ICD Terminal',
    lat: 0.3340,
    lng: 32.6100,
    speed: 25,
    heading: 45,
    status: 'empty_returning',
    lastSeenLocationName: 'Nakawa Logistics Corridor',
    lastUpdate: Date.now() - 120000,
    trail: [
      { lat: 0.2800, lng: 32.5500, speed: 45, timestamp: Date.now() - 2000000 },
      { lat: 0.3100, lng: 32.5750, speed: 35, timestamp: Date.now() - 1000000 },
      { lat: 0.3340, lng: 32.6100, speed: 25, timestamp: Date.now() - 120000 },
    ],
  },
  {
    jobId: 'job-ug-104',
    transporterId: 'trans-4',
    driverName: 'Denis Mukasa',
    phone: '+256 754 112 900',
    numberPlate: 'UBG 512P',
    cargo: '14T Cement Bags',
    destination: 'Gulu Core Logistics Depot',
    lat: 2.2420,
    lng: 32.2470,
    speed: 0,
    heading: 0,
    status: 'stopped',
    lastSeenLocationName: 'Karuma bridge (Gulu Highway)',
    lastUpdate: Date.now() - 34 * 60 * 1000, // Stopped > 30 mins -> Red status & offline alert
    trail: [
      { lat: 1.6370, lng: 32.2850, speed: 52, timestamp: Date.now() - 3600000 },
      { lat: 2.0100, lng: 32.2600, speed: 45, timestamp: Date.now() - 2700000 },
      { lat: 2.2420, lng: 32.2470, speed: 0, timestamp: Date.now() - 34 * 60 * 1000 },
    ],
  },
  {
    jobId: 'job-ug-105',
    transporterId: 'trans-5',
    driverName: 'Brian Kigozi',
    phone: '+256 774 219 004',
    numberPlate: 'UBA 802C',
    cargo: '32T Containerised Goods',
    destination: 'Tororo Customs Depot',
    lat: 0.6339,
    lng: 34.2753,
    speed: 46,
    heading: 275,
    status: 'delivering',
    lastSeenLocationName: 'Malaba Border Post',
    lastUpdate: Date.now() - 30000,
    trail: [
      { lat: 0.6300, lng: 34.3100, speed: 40, timestamp: Date.now() - 900000 },
      { lat: 0.6339, lng: 34.2753, speed: 46, timestamp: Date.now() - 30000 },
    ],
  },
  {
    jobId: 'job-ug-106',
    transporterId: 'trans-6',
    driverName: 'Joseph Okello',
    phone: '+256 702 334 118',
    numberPlate: 'UBH 993K',
    cargo: '18T Fuel Drums',
    destination: 'Kampala Industrial Area',
    lat: 0.4479,
    lng: 33.2026,
    speed: 62,
    heading: 260,
    status: 'delivering',
    lastSeenLocationName: 'Source of the Nile Bridge (Jinja)',
    lastUpdate: Date.now() - 60000,
    trail: [
      { lat: 0.5000, lng: 33.3200, speed: 65, timestamp: Date.now() - 1200000 },
      { lat: 0.4479, lng: 33.2026, speed: 62, timestamp: Date.now() - 60000 },
    ],
  },
  {
    jobId: 'job-ug-107',
    transporterId: 'trans-7',
    driverName: 'Timothy Ssebaggala',
    phone: '+256 781 556 772',
    numberPlate: 'UBJ 204E',
    cargo: '15T Animal Feeds',
    destination: 'Mukono Bonded Warehouse',
    lat: 0.6120,
    lng: 33.4686,
    speed: 52,
    heading: 260,
    status: 'delivering',
    lastSeenLocationName: 'Iganga Highway',
    lastUpdate: Date.now() - 80000,
    trail: [
      { lat: 0.6500, lng: 33.6000, speed: 55, timestamp: Date.now() - 1500000 },
      { lat: 0.6120, lng: 33.4686, speed: 52, timestamp: Date.now() - 80000 },
    ],
  },
  {
    jobId: 'job-ug-108',
    transporterId: 'trans-8',
    driverName: 'Grace Atuhaire',
    phone: '+256 752 901 223',
    numberPlate: 'UBC 145T',
    cargo: '10T Sunflower Seed Oil',
    destination: 'Gulu Core Hub',
    lat: 0.8490,
    lng: 32.4980,
    speed: 58,
    heading: 350,
    status: 'delivering',
    lastSeenLocationName: 'Luweero Triangle Highway',
    lastUpdate: Date.now() - 50000,
    trail: [
      { lat: 0.6000, lng: 32.5300, speed: 50, timestamp: Date.now() - 1600000 },
      { lat: 0.8490, lng: 32.4980, speed: 58, timestamp: Date.now() - 50000 },
    ],
  },
  {
    jobId: 'job-ug-109',
    transporterId: 'trans-9',
    driverName: 'Patrick Lubega',
    phone: '+256 773 118 440',
    numberPlate: 'UBF 670R',
    cargo: '22T Structural Iron Bars',
    destination: 'Gulu Northern Hub',
    lat: 1.3090,
    lng: 32.4560,
    speed: 64,
    heading: 355,
    status: 'delivering',
    lastSeenLocationName: 'Nakasongola Weighbridge',
    lastUpdate: Date.now() - 70000,
    trail: [
      { lat: 1.1000, lng: 32.4700, speed: 60, timestamp: Date.now() - 1400000 },
      { lat: 1.3090, lng: 32.4560, speed: 64, timestamp: Date.now() - 70000 },
    ],
  },
  {
    jobId: 'job-ug-110',
    transporterId: 'trans-10',
    driverName: 'Emmanuel Byamukama',
    phone: '+256 703 661 992',
    numberPlate: 'UBE 332S',
    cargo: '8T Fresh Agricultural Produce',
    destination: 'Bweyogerere Bolloré ICD',
    lat: 0.3544,
    lng: 32.7523,
    speed: 34,
    heading: 250,
    status: 'delivering',
    lastSeenLocationName: 'Mukono Bypass',
    lastUpdate: Date.now() - 40000,
    trail: [
      { lat: 0.3700, lng: 32.8500, speed: 48, timestamp: Date.now() - 1200000 },
      { lat: 0.3544, lng: 32.7523, speed: 34, timestamp: Date.now() - 40000 },
    ],
  },
  {
    jobId: 'job-ug-111',
    transporterId: 'trans-11',
    driverName: 'Hassan Mugisha',
    phone: '+256 785 440 120',
    numberPlate: 'UBL 118V',
    cargo: 'Empty Platform Trailer',
    destination: 'Busega Staging Yard',
    lat: 0.3200,
    lng: 32.5850,
    speed: 0,
    heading: 0,
    status: 'stopped', // idle 2
    lastSeenLocationName: 'Namuwongo Rail Freight Terminal',
    lastUpdate: Date.now() - 15 * 60 * 1000,
    trail: [
      { lat: 0.3200, lng: 32.5850, speed: 0, timestamp: Date.now() - 15 * 60 * 1000 },
    ],
  },
  {
    jobId: 'job-ug-112',
    transporterId: 'trans-12',
    driverName: 'Godfrey Waiswa',
    phone: '+256 756 890 334',
    numberPlate: 'UBM 445W',
    cargo: '16T Arabica Coffee Beans',
    destination: 'Mbale Central Silos',
    lat: 0.6928,
    lng: 34.1810,
    speed: 48,
    heading: 20,
    status: 'delivering',
    lastSeenLocationName: 'Tororo Junction',
    lastUpdate: Date.now() - 95000,
    trail: [
      { lat: 0.6400, lng: 34.2200, speed: 50, timestamp: Date.now() - 1300000 },
      { lat: 0.6928, lng: 34.1810, speed: 48, timestamp: Date.now() - 95000 },
    ],
  },
  {
    jobId: 'job-ug-113',
    transporterId: 'trans-13',
    driverName: 'David Kibet',
    phone: '+256 771 902 341',
    numberPlate: 'UBK 782D',
    cargo: '12T Processed Tea',
    destination: 'Multiple ICD Nakawa',
    lat: 0.2800,
    lng: 32.5500,
    speed: 31,
    heading: 30,
    status: 'delivering',
    lastSeenLocationName: 'Busega Roundabout',
    lastUpdate: Date.now() - 35000,
    trail: [
      { lat: 0.2500, lng: 32.5200, speed: 45, timestamp: Date.now() - 1100000 },
      { lat: 0.2800, lng: 32.5500, speed: 31, timestamp: Date.now() - 35000 },
    ],
  },
  {
    jobId: 'job-ug-114',
    transporterId: 'trans-14',
    driverName: 'Samuel Lumu',
    phone: '+256 704 223 881',
    numberPlate: 'UBP 901A',
    cargo: 'Empty Tipper Truck',
    destination: 'Jinja Loading Depot',
    lat: 0.3620,
    lng: 32.6400,
    speed: 42,
    heading: 85,
    status: 'empty_returning',
    lastSeenLocationName: 'Banda Kyambogo Hill',
    lastUpdate: Date.now() - 65000,
    trail: [
      { lat: 0.3476, lng: 32.5825, speed: 35, timestamp: Date.now() - 1000000 },
      { lat: 0.3620, lng: 32.6400, speed: 42, timestamp: Date.now() - 65000 },
    ],
  },
  {
    jobId: 'job-ug-115',
    transporterId: 'trans-15',
    driverName: 'Isaac Mwangi',
    phone: '+256 759 104 556',
    numberPlate: 'UBR 621N',
    cargo: 'Parked Fuso (Standby)',
    destination: 'Clock Tower Depot',
    lat: 0.3120,
    lng: 32.5740,
    speed: 0,
    heading: 0,
    status: 'stopped', // idle 3 (>30m -> Red)
    lastSeenLocationName: 'Kampala Clock Tower Depot',
    lastUpdate: Date.now() - 42 * 60 * 1000,
    trail: [
      { lat: 0.3120, lng: 32.5740, speed: 0, timestamp: Date.now() - 42 * 60 * 1000 },
    ],
  },
];

// Persistent state in process memory
const fleetRegistry = new Map<string, LiveTruckLocation>();
initialFleetLocations.forEach(truck => {
  fleetRegistry.set(truck.jobId, truck);
});

// GET /api/fleet-locations: Super Admin & live fleet monitoring
app.get('/api/fleet-locations', (_req: Request, res: Response) => {
  const allTrucks = Array.from(fleetRegistry.values());
  const now = Date.now();

  // Dynamic moving vs idle computation: speed > 2 km/h is moving; stopped > 30m is breakdown alert
  let movingCount = 0;
  let idleCount = 0;

  const enrichedTrucks = allTrucks.map(t => {
    const minutesSinceUpdate = Math.round((now - t.lastUpdate) / 60000);
    const isStoppedLong = minutesSinceUpdate >= 30 || (t.speed <= 2 && minutesSinceUpdate >= 10);
    const isOfflineLostNetwork = minutesSinceUpdate >= 10;

    let computedStatus = t.status;
    if (isStoppedLong) {
      computedStatus = 'stopped';
    } else if (t.speed > 2) {
      computedStatus = t.cargo.toLowerCase().includes('empty') ? 'empty_returning' : 'delivering';
    }

    if (t.speed > 2) {
      movingCount++;
    } else {
      idleCount++;
    }

    return {
      ...t,
      status: computedStatus,
      minutesSinceUpdate,
      isOfflineLostNetwork,
      lastUpdateRelative: minutesSinceUpdate === 0 ? 'Just now' : `${minutesSinceUpdate} mins ago`,
      escrowAmountUGX: 950000,
    };
  });

  res.json({
    summary: {
      totalFleet: enrichedTrucks.length,
      moving: movingCount,
      idle: idleCount,
      escrowDisplay: '950k UGX',
      escrowAmountUGX: 950000,
      topBarText: `Live Fleet: ${movingCount} moving | ${idleCount} idle | Escrow 950k UGX`,
      serverTime: now,
    },
    trucks: enrichedTrucks,
  });
});

// GET /api/location/:jobId: Client view (only sees his truck)
app.get('/api/location/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const truck = fleetRegistry.get(jobId);

  if (!truck) {
    // If not found by jobId, check by transporterId or default to first
    const found = Array.from(fleetRegistry.values()).find(t => t.jobId.toLowerCase() === jobId.toLowerCase());
    if (!found) {
      return res.status(404).json({ error: `No active vehicle tracking found for job ${jobId}` });
    }
    return res.json(enrichSingleTruck(found));
  }

  res.json(enrichSingleTruck(truck));
});

function enrichSingleTruck(truck: LiveTruckLocation) {
  const now = Date.now();
  const minutesSinceUpdate = Math.round((now - truck.lastUpdate) / 60000);
  const isOfflineLostNetwork = minutesSinceUpdate >= 10;
  
  // Estimate ETA based on distance to Namanve or delivery point
  // Average distance ~45km, speed ~50km/h -> ETA 1h 20m
  const remainingKm = truck.speed > 0 ? Math.max(12, Math.round(45 - (truck.speed * 0.2))) : 45;
  const etaMinutes = truck.speed > 10 ? Math.round((remainingKm / truck.speed) * 60) : 80;
  const etaHours = Math.floor(etaMinutes / 60);
  const etaMinsRem = etaMinutes % 60;
  const etaString = etaHours > 0 ? `${etaHours}h ${etaMinsRem}m` : `${etaMinsRem}m`;

  return {
    ...truck,
    minutesSinceUpdate,
    isOfflineLostNetwork,
    lastUpdateRelative: minutesSinceUpdate === 0 ? 'Just now' : `${minutesSinceUpdate} mins ago`,
    etaText: `${truck.driverName} ${remainingKm}km away, ETA ${etaString} to ${truck.destination || 'Namanve'}`,
    serverTime: now,
  };
}

// POST /api/location: Transporter app pings GPS (every 30s moving, 2m stopped)
app.post('/api/location', (req: Request, res: Response) => {
  try {
    const { 
      jobId, 
      transporterId, 
      driverName, 
      phone, 
      numberPlate, 
      lat, 
      lng, 
      speed, 
      heading, 
      status, 
      lastSeenLocationName 
    } = req.body;

    if (!jobId || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'jobId, lat, and lng are required' });
    }

    const now = Date.now();
    const existing = fleetRegistry.get(jobId);

    const point: BreadcrumbPoint = {
      lat,
      lng,
      speed: Number(speed) || 0,
      timestamp: now,
    };

    const trail = existing?.trail ? [...existing.trail, point].slice(-60) : [point]; // keep last 60 points (~1 hr)

    const updated: LiveTruckLocation = {
      jobId,
      transporterId: transporterId || existing?.transporterId || 'trans-1',
      driverName: driverName || existing?.driverName || 'Ronald Kato',
      phone: phone || existing?.phone || '+256 772 842 110',
      numberPlate: numberPlate || existing?.numberPlate || 'UBL 892M',
      cargo: existing?.cargo || 'Active Cargo Transit',
      destination: existing?.destination || 'Namanve ICD',
      lat,
      lng,
      speed: Number(speed) || 0,
      heading: typeof heading === 'number' ? heading : existing?.heading || 0,
      status: status || (Number(speed) > 2 ? 'delivering' : 'stopped'),
      lastSeenLocationName: lastSeenLocationName || existing?.lastSeenLocationName || 'Uganda Transport Corridor',
      lastUpdate: now,
      trail,
    };

    fleetRegistry.set(jobId, updated);

    res.json({
      success: true,
      message: 'Location updated',
      truck: enrichSingleTruck(updated),
    });
  } catch (error: any) {
    console.error('Error in POST /api/location:', error);
    res.status(500).json({ error: error.message || 'Failed to update location' });
  }
});

// POST /api/location/batch: Synchronizes offline queued GPS points from localStorage
app.post('/api/location/batch', (req: Request, res: Response) => {
  try {
    const { points } = req.body;
    if (!Array.isArray(points) || points.length === 0) {
      return res.status(400).json({ error: 'points array is required' });
    }

    let lastTruck: any = null;

    for (const item of points) {
      if (!item.jobId || typeof item.lat !== 'number' || typeof item.lng !== 'number') continue;
      const existing = fleetRegistry.get(item.jobId);
      const point: BreadcrumbPoint = {
        lat: item.lat,
        lng: item.lng,
        speed: Number(item.speed) || 0,
        timestamp: item.timestamp || Date.now(),
      };
      const trail = existing?.trail ? [...existing.trail, point].slice(-60) : [point];

      const updated: LiveTruckLocation = {
        jobId: item.jobId,
        transporterId: item.transporterId || existing?.transporterId || 'trans-1',
        driverName: item.driverName || existing?.driverName || 'Ronald Kato',
        phone: item.phone || existing?.phone || '+256 772 842 110',
        numberPlate: item.numberPlate || existing?.numberPlate || 'UBL 892M',
        cargo: existing?.cargo || 'Active Cargo Transit',
        destination: existing?.destination || 'Namanve ICD',
        lat: item.lat,
        lng: item.lng,
        speed: Number(item.speed) || 0,
        heading: typeof item.heading === 'number' ? item.heading : existing?.heading || 0,
        status: item.status || (Number(item.speed) > 2 ? 'delivering' : 'stopped'),
        lastSeenLocationName: item.lastSeenLocationName || existing?.lastSeenLocationName || 'Uganda Transport Corridor',
        lastUpdate: item.timestamp || Date.now(),
        trail,
      };

      fleetRegistry.set(item.jobId, updated);
      lastTruck = updated;
    }

    res.json({
      success: true,
      syncedCount: points.length,
      latest: lastTruck ? enrichSingleTruck(lastTruck) : null,
    });
  } catch (error: any) {
    console.error('Error in POST /api/location/batch:', error);
    res.status(500).json({ error: error.message || 'Failed to sync batch locations' });
  }
});

// Mount Vite middleware in development, or serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[MAXIMUS Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
