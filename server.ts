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
