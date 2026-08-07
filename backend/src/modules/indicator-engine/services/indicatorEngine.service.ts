import {
  CandleDto,
  DemandZone,
  IndicatorEngineOutput,
  SupplyZone,
  TradingTimeframe,
} from '@algoapp/shared';
// New Pine Script-exact engines
import { SmcLegEngine } from '../engines/smcLegEngine.js';
import { PatLegEngine } from '../engines/patLegEngine.js';
import { TrendLineEngine as _TrendLineEngine } from '../engines/trendLineEngine.js'; // reserved for future use
import { OrderBlockMergeEngine } from '../engines/orderBlockMergeEngine.js';
// Zone post-processing pipeline (unchanged)
import { ZoneMergeEngine } from '../engines/zoneMergeEngine.js';
import { ZoneLifecycleEngine } from '../engines/zoneLifecycleEngine.js';
import { FreshnessEngine } from '../engines/freshnessEngine.js';
import { TouchEngine } from '../engines/touchEngine.js';
import { ZoneScoreEngine } from '../engines/zoneScoreEngine.js';
import { PremiumDiscountEngine } from '../engines/premiumDiscountEngine.js';
import { FvgEngine } from '../engines/fvgEngine.js';
import { CandleStoreService } from '../../market-data/services/candleStore.service.js';
import { StrategyProfileService } from '../../strategy-profile/services/strategyProfile.service.js';

/** Internal config resolved from strategy profile or defaults */
interface EngineConfig {
  /** Pine Script leg(swingLen) — from smcConfig.swingLen or default 50 */
  swingLen:    number;
  /** Pine Script leg(internalLen) — from smcConfig.internalLen or default 5 */
  internalLen: number;
}

const profileService = new StrategyProfileService();


export class IndicatorEngineService {

  // ============================================================
  // Core shared computation
  // ============================================================
  private static runPipeline(
    symbol:    string,
    candles:   CandleDto[],
    timeframe: TradingTimeframe,
    config:    EngineConfig = { swingLen: 50, internalLen: 5 }
  ): IndicatorEngineOutput {
    if (!candles || candles.length === 0) {
      return {
        symbol, timeframe,
        supplyZones: [], demandZones: [], zoneScores: {},
        marketStructure: { symbol, timeframe, trend: 'BULLISH', internalTrend: 'BULLISH', swingTrend: 'BULLISH', liquiditySwept: false },
        pivotsInternal: [], pivotsSwing: [], zigzagLegs: [], structureEvents: [],
        orderBlocks: [], liquiditySweeps: [], fairValueGaps: [], equalHighLows: [],
        atr14: 0, atr200: 0, evaluatedAt: new Date().toISOString(),
      };
    }

    const latestCandle = candles[candles.length - 1]!;

    // ── 1. SMC Leg Engine (LuxAlgo Pine Script exact) ──────────────────────────
    // Q1: swingLen + internalLen from strategy profile (SQLite), fallback to defaults
    const smc = SmcLegEngine.run(symbol, candles, timeframe, {
      swingLen:    config.swingLen,
      internalLen: config.internalLen,
    });

    // ── 2. PAT Leg Engine (UAlgo Pine Script exact) ────────────────────────────
    const pat = PatLegEngine.run(symbol, candles, timeframe);

    // ── 3. OB Merge Engine (Q2) ────────────────────────────────────────────────
    // Merge overlapping LuxAlgo (SMC) + UAlgo (PAT) OBs into a unified list.
    // Stores source (SMC/PAT/MERGED) for analytics and debugging.
    // The merged list is the sole input to zone scoring and AI decisions (Q2).
    const { merged: mergedOrderBlocks } = OrderBlockMergeEngine.merge(
      smc.orderBlocks,
      pat.orderBlocks
    );

    // ── 4. Combine structure events from both engines ──────────────────────────
    const allStructureEvents = [
      ...smc.structureEvents,
      ...pat.structureEvents.map(e => ({ ...e, isInternal: false })),
    ].sort((a, b) => a.index - b.index);

    // ── 5. Combine liquidity sweeps ────────────────────────────────────────────
    const allSweeps = [...pat.liquiditySweeps];

    // ── 7. FVG — DISABLED (FVG_ENABLED=false in fvgEngine.ts) ─────────────────
    const fairValueGaps = FvgEngine.detectFvgs(symbol, candles, timeframe);

    // ── 8. EQH / EQL ─────────────────────────────────────────────────────────
    const equalHighLows = smc.equalHighLows;


    // ── 9. Build Supply/Demand zones from MERGED OBs (for zone scoring pipeline) ─
    // Q2: Use merged list only — each OB is already overlap-resolved
    const supplyZonesRaw: SupplyZone[] = mergedOrderBlocks
      .filter(ob => ob.type === 'BEARISH' && !ob.isInvalidated)
      .map(ob => ({
        id:            `ZONE-SUP-${ob.id}`,
        symbol,
        timeframe,
        type:          'SUPPLY' as const,
        upperPrice:    ob.upperPrice,
        lowerPrice:    ob.lowerPrice,
        patStrength:   ob.source === 'PAT' ? 80.0 : 0.0,
        smcStrength:   ob.source === 'SMC' ? 90.0 : 0.0,
        mergedStrength: 85.0,
        width:         Number((ob.upperPrice - ob.lowerPrice).toFixed(4)),
        freshness:     ob.isMitigated ? 40.0 : 100.0,
        touchCount:    ob.touchCount,
        age:           candles.length - 1 - ob.breakCandleIndex,
        confidence:    85.0,
        status:        ob.isMitigated ? 'TRADED' as const : 'NEW' as const,
        source:        ob.source,
        createdAt:     ob.createdAt,
        updatedAt:     ob.createdAt,
      }));

    const demandZonesRaw: DemandZone[] = mergedOrderBlocks
      .filter((ob: { type: string; isInvalidated: boolean }) => ob.type === 'BULLISH' && !ob.isInvalidated)
      .map((ob: any) => ({
        id:            `ZONE-DEM-${ob.id}`,
        symbol,
        timeframe,
        type:          'DEMAND' as const,
        upperPrice:    ob.upperPrice,
        lowerPrice:    ob.lowerPrice,
        patStrength:   ob.source === 'PAT' ? 80.0 : 0.0,
        smcStrength:   ob.source === 'SMC' ? 90.0 : 0.0,
        mergedStrength: 85.0,
        width:         Number((ob.upperPrice - ob.lowerPrice).toFixed(4)),
        freshness:     ob.isMitigated ? 40.0 : 100.0,
        touchCount:    ob.touchCount,
        age:           candles.length - 1 - ob.breakCandleIndex,
        confidence:    85.0,
        status:        ob.isMitigated ? 'TRADED' as const : 'NEW' as const,
        source:        ob.source,
        createdAt:     ob.createdAt,
        updatedAt:     ob.createdAt,
      }));

    // ── 10. Zone pipeline ──────────────────────────────────────────────────────
    const mergedSupply = ZoneMergeEngine.mergeZones<SupplyZone>(supplyZonesRaw);
    const mergedDemand = ZoneMergeEngine.mergeZones<DemandZone>(demandZonesRaw);

    const lifecycleSupply = ZoneLifecycleEngine.updateLifecycle(mergedSupply, latestCandle);
    const lifecycleDemand = ZoneLifecycleEngine.updateLifecycle(mergedDemand, latestCandle);

    const freshSupply = FreshnessEngine.updateFreshness(lifecycleSupply);
    const freshDemand = FreshnessEngine.updateFreshness(lifecycleDemand);

    const finalSupply = TouchEngine.evaluateTouches(freshSupply, latestCandle);
    const finalDemand = TouchEngine.evaluateTouches(freshDemand, latestCandle);

    // ── 11. Market Structure ───────────────────────────────────────────────────
    const liquiditySwept = allSweeps.length > 0;
    const marketStructure = {
      symbol,
      timeframe,
      trend:         smc.swingTrend,
      internalTrend: smc.internalTrend,
      swingTrend:    smc.swingTrend,
      liquiditySwept,
      lastBosTime:   allStructureEvents.filter(e => e.type === 'BOS').at(-1)?.time,
      lastChochTime: allStructureEvents.filter(e => e.type === 'CHOCH').at(-1)?.time,
    };

    // ── 12. Zone Scoring ───────────────────────────────────────────────────────
    const supplyScores = ZoneScoreEngine.scoreZones(finalSupply, marketStructure);
    const demandScores = ZoneScoreEngine.scoreZones(finalDemand, marketStructure);
    const zoneScores = { ...supplyScores, ...demandScores };

    const premiumDiscountZones = PremiumDiscountEngine.calculateZones(candles);

    return {
      symbol,
      timeframe,
      supplyZones:         finalSupply,
      demandZones:         finalDemand,
      zoneScores,
      marketStructure,
      premiumDiscountZones,
      pivotsInternal:      smc.pivotsInternal,
      pivotsSwing:         smc.pivotsSwing,
      zigzagLegs:          pat.zigzagLegs,
      structureEvents:     allStructureEvents,
      orderBlocks:         mergedOrderBlocks,
      liquiditySweeps:     allSweeps,
      fairValueGaps,
      equalHighLows,
      atr14:               Number(pat.atr14.toFixed(4)),
      atr200:              Number(smc.atr200.toFixed(4)),
      evaluatedAt:         new Date().toISOString(),
    };
  }

  /**
   * Synchronous compute — used by MarketScannerService on every tick.
   * Uses Pine Script default lengths (swingLen=50, internalLen=5).
   */
  public static computeIndicators(
    candles:   CandleDto[],
    timeframe: TradingTimeframe = '1H',
    symbol:    string           = 'BTCUSD.P'
  ): IndicatorEngineOutput {
    return IndicatorEngineService.runPipeline(symbol, candles, timeframe);
  }

  /**
   * Async variant — used by the indicator controller.
   * Q1: Reads swingLen + internalLen from the active strategy profile stored in SQLite.
   */
  public async evaluateSymbol(
    symbol:        string           = 'BTCUSD.P',
    timeframe:     TradingTimeframe = '1H',
    profileId?:    string,
    inputCandles?: CandleDto[]
  ): Promise<IndicatorEngineOutput> {
    const candles = inputCandles ?? (await CandleStoreService.getCandles(symbol, timeframe, 500));

    // Q1: Load strategy profile to get configurable SMC lengths
    const profile = await profileService
      .getProfileById(profileId ?? 'DEF-1H-PROF')
      .catch(() => null);

    const engineConfig: EngineConfig = {
      swingLen:    profile?.smcConfig?.swingLen    ?? 50,
      internalLen: profile?.smcConfig?.internalLen ?? 5,
    };

    return IndicatorEngineService.runPipeline(symbol, candles, timeframe, engineConfig);
  }
}
