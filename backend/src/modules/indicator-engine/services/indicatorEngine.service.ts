import {
  CandleDto,
  DemandZone,
  IndicatorEngineOutput,
  SupplyZone,
  TradingTimeframe,
} from '@algoapp/shared';
// New Pine Script Engine
import { PineScriptEngine } from './pineScriptEngine.js';

// Zone post-processing pipeline (unchanged parts)
import { ZoneMergerService } from '../../strategy/services/zoneMerger.service.js';
import { ZoneLifecycleEngine } from '../engines/zoneLifecycleEngine.js';
import { FreshnessEngine } from '../engines/freshnessEngine.js';
import { TouchEngine } from '../engines/touchEngine.js';
import { ZoneScoreEngine } from '../engines/zoneScoreEngine.js';
import { PremiumDiscountEngine } from '../engines/premiumDiscountEngine.js';
import { FvgEngine } from '../engines/fvgEngine.js';
import { CandleStoreService } from '../../market-data/services/candleStore.service.js';

export class IndicatorEngineService {

  // ============================================================
  // Core shared computation
  // ============================================================
  private static runPipeline(
    symbol:    string,
    candles:   CandleDto[],
    timeframe: TradingTimeframe,
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

    // ── 1. Pine Script Engine (Combined LuxAlgo + UAlgo) ──────────────────────────
    const pineResult = PineScriptEngine.computeFullIndicator(candles, symbol);

    // ── 2. FVG — DISABLED (FVG_ENABLED=false in fvgEngine.ts) ─────────────────
    const fairValueGaps = FvgEngine.detectFvgs(symbol, candles, timeframe);
    const equalHighLows: any[] = []; // Not provided directly by the new pine engine

    // ── 3. Build Supply/Demand zones from PineScript OBs ──────────────────────────
    const supplyZonesRaw: SupplyZone[] = pineResult.orderBlocks
      .filter(ob => ob.type === 'BEARISH' && !ob.isBroken)
      .map(ob => ({
        id:            `ZONE-SUP-${ob.id}`,
        symbol,
        timeframe,
        type:          'SUPPLY' as const,
        upperPrice:    ob.upperPrice,
        lowerPrice:    ob.lowerPrice,
        patStrength:   ob.source === 'UALGO' ? 80.0 : 0.0,
        smcStrength:   ob.source === 'LUXALGO' ? 90.0 : 0.0,
        mergedStrength: ob.strength,
        width:         Number((ob.upperPrice - ob.lowerPrice).toFixed(4)),
        freshness:     ob.isMitigated ? 40.0 : 100.0,
        touchCount:    0,
        age:           candles.length - 1 - ob.barIndex,
        confidence:    ob.strength,
        status:        ob.isMitigated ? ('TRADED' as any) : ('NEW' as any),
        source:        ob.source as any,
        createdAt:     new Date(ob.barTime).toISOString(),
        updatedAt:     new Date(ob.barTime).toISOString(),
      }));

    const demandZonesRaw: DemandZone[] = pineResult.orderBlocks
      .filter(ob => ob.type === 'BULLISH' && !ob.isBroken)
      .map(ob => ({
        id:            `ZONE-DEM-${ob.id}`,
        symbol,
        timeframe,
        type:          'DEMAND' as const,
        upperPrice:    ob.upperPrice,
        lowerPrice:    ob.lowerPrice,
        patStrength:   ob.source === 'UALGO' ? 80.0 : 0.0,
        smcStrength:   ob.source === 'LUXALGO' ? 90.0 : 0.0,
        mergedStrength: ob.strength,
        width:         Number((ob.upperPrice - ob.lowerPrice).toFixed(4)),
        freshness:     ob.isMitigated ? 40.0 : 100.0,
        touchCount:    0,
        age:           candles.length - 1 - ob.barIndex,
        confidence:    ob.strength,
        status:        ob.isMitigated ? ('TRADED' as any) : ('NEW' as any),
        source:        ob.source as any,
        createdAt:     new Date(ob.barTime).toISOString(),
        updatedAt:     new Date(ob.barTime).toISOString(),
      }));

    // ── 4. Zone pipeline ──────────────────────────────────────────────────────
    // Use new deduplication ZoneMergerService provided by user
    const mergedSupply = ZoneMergerService.detectAndMergeZones(supplyZonesRaw) as SupplyZone[];
    const mergedDemand = ZoneMergerService.detectAndMergeZones(demandZonesRaw) as DemandZone[];

    const lifecycleSupply = ZoneLifecycleEngine.updateLifecycle(mergedSupply, latestCandle);
    const lifecycleDemand = ZoneLifecycleEngine.updateLifecycle(mergedDemand, latestCandle);

    const freshSupply = FreshnessEngine.updateFreshness(lifecycleSupply);
    const freshDemand = FreshnessEngine.updateFreshness(lifecycleDemand);

    const finalSupply = TouchEngine.evaluateTouches(freshSupply, latestCandle);
    const finalDemand = TouchEngine.evaluateTouches(freshDemand, latestCandle);

    // ── 5. Market Structure ───────────────────────────────────────────────────
    const liquiditySwept = pineResult.liquiditySweeps.length > 0;
    const marketStructure = {
      symbol,
      timeframe,
      trend:         pineResult.marketStructure.trend as any,
      internalTrend: pineResult.marketStructure.trend as any,
      swingTrend:    pineResult.marketStructure.trend as any,
      liquiditySwept,
      lastBosTime:   pineResult.marketStructure.lastBOS ? new Date(pineResult.marketStructure.lastBOS.barTime).toISOString() : undefined,
      lastChochTime: pineResult.marketStructure.lastCHoCH ? new Date(pineResult.marketStructure.lastCHoCH.barTime).toISOString() : undefined,
    };

    // ── 6. Zone Scoring ───────────────────────────────────────────────────────
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
      pivotsInternal:      [], // Handled inside pine engine now
      pivotsSwing:         [], // Handled inside pine engine now
      zigzagLegs:          [],
      structureEvents:     pineResult.structures.map(s => ({
        index: s.barIndex,
        time: new Date(s.barTime).toISOString(),
        type: s.type,
        direction: s.direction,
        brokenLevel: s.level,
        isInternal: s.internal,
        confirmationCandleIndex: s.barIndex
      })),
      orderBlocks:         pineResult.orderBlocks.map(ob => ({
        id: ob.id,
        symbol: ob.symbol,
        timeframe,
        type: ob.type,
        upperPrice: ob.upperPrice,
        lowerPrice: ob.lowerPrice,
        widthPercent: ((ob.upperPrice - ob.lowerPrice) / ob.upperPrice) * 100,
        entryPrice: ob.type === 'BULLISH' ? ob.upperPrice : ob.lowerPrice,
        stopLossPrice: ob.type === 'BULLISH' ? ob.lowerPrice : ob.upperPrice,
        takeProfitPrice: ob.type === 'BULLISH' ? ob.upperPrice * 1.05 : ob.lowerPrice * 0.95,
        calculatedLeverage: 10,
        baseCandleIndex: ob.barIndex,
        breakCandleIndex: ob.barIndex,
        isMitigated: ob.isMitigated,
        isInvalidated: ob.isBroken,
        isUsed: false,
        touchCount: 0,
        source: ob.source === 'LUXALGO' ? 'SMC' : 'PAT',
        createdAt: new Date(ob.barTime).toISOString()
      })),
      liquiditySweeps:     pineResult.liquiditySweeps.map(ls => ({
        id: `SWEEP-${symbol}-${ls.barTime}`,
        symbol,
        timeframe,
        sweepType: ls.type,
        sweptLevel: ls.value,
        sweepPrice: ls.value,
        candleIndex: 0,
        candleTime: new Date(ls.barTime).toISOString(),
        isSwingSweep: false,
        wickRatio: 0
      })),
      fairValueGaps,
      equalHighLows,
      atr14:               0,
      atr200:              0,
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
   */
  public async evaluateSymbol(
    symbol:        string           = 'BTCUSD.P',
    timeframe:     TradingTimeframe = '1H',
    _profileId?:   string,
    inputCandles?: CandleDto[]
  ): Promise<IndicatorEngineOutput> {
    const candles = inputCandles ?? (await CandleStoreService.getCandles(symbol, timeframe, 500));

    return IndicatorEngineService.runPipeline(symbol, candles, timeframe);
  }
}
