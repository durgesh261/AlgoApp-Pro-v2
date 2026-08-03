import { CandleDto, IndicatorEngineOutput, SupplyZone, DemandZone } from '@algoapp/shared';
import { PivotEngine } from '../engines/pivotEngine.js';
import { SwingEngine } from '../engines/swingEngine.js';
import { MarketStructureEngine } from '../engines/marketStructureEngine.js';
import { PatZoneEngine } from '../engines/patZoneEngine.js';
import { SmcZoneEngine } from '../engines/smcZoneEngine.js';
import { ZoneMergeEngine } from '../engines/zoneMergeEngine.js';
import { ZoneLifecycleEngine } from '../engines/zoneLifecycleEngine.js';
import { FreshnessEngine } from '../engines/freshnessEngine.js';
import { TouchEngine } from '../engines/touchEngine.js';
import { ZoneScoreEngine } from '../engines/zoneScoreEngine.js';
import { CandleStoreService } from '../../market-data/services/candleStore.service.js';

export class IndicatorEngineService {
  public async evaluateSymbol(symbol: string = 'BTCUSD.P', inputCandles?: CandleDto[]): Promise<IndicatorEngineOutput> {
    const candles = inputCandles ?? (await CandleStoreService.getCandles(symbol, 100));

    if (candles.length === 0) {
      return {
        symbol,
        timeframe: '1H',
        supplyZones: [],
        demandZones: [],
        zoneScores: {},
        marketStructure: {
          symbol,
          timeframe: '1H',
          trend: 'BULLISH',
          internalTrend: 'BULLISH',
          swingTrend: 'BULLISH',
          liquiditySwept: false,
        },
        evaluatedAt: new Date().toISOString(),
      };
    }

    const latestCandle = candles[candles.length - 1]!;

    // 1. Pivot Engine
    const pivots9 = PivotEngine.findPivots(candles, 9);
    const pivots50 = PivotEngine.findPivots(candles, 50);

    // 2. Swing Engine
    SwingEngine.calculateSwings(pivots9);

    // 3. Market Structure Engine
    const { marketStructure, events } = MarketStructureEngine.evaluateStructure(symbol, candles, pivots9, pivots50);

    // 4. PAT Zone Engine
    const patResult = PatZoneEngine.extractPatZones(symbol, candles, events);
    marketStructure.liquiditySwept = patResult.liquiditySwept;

    // 5. SMC Zone Engine
    const smcResult = SmcZoneEngine.extractSmcZones(symbol, candles, pivots9);

    // 6. Zone Merge Engine
    const combinedSupply = [...patResult.supplyZones, ...smcResult.supplyZones];
    const combinedDemand = [...patResult.demandZones, ...smcResult.demandZones];

    const mergedSupply = ZoneMergeEngine.mergeZones<SupplyZone>(combinedSupply);
    const mergedDemand = ZoneMergeEngine.mergeZones<DemandZone>(combinedDemand);

    // 7. Zone Lifecycle Engine
    const lifecycleSupply = ZoneLifecycleEngine.updateLifecycle(mergedSupply, latestCandle);
    const lifecycleDemand = ZoneLifecycleEngine.updateLifecycle(mergedDemand, latestCandle);

    // 8. Freshness Engine
    const freshSupply = FreshnessEngine.updateFreshness(lifecycleSupply);
    const freshDemand = FreshnessEngine.updateFreshness(lifecycleDemand);

    // 9. Touch Engine
    const finalSupply = TouchEngine.evaluateTouches(freshSupply, latestCandle);
    const finalDemand = TouchEngine.evaluateTouches(freshDemand, latestCandle);

    // 10. Zone Score Engine
    const supplyScores = ZoneScoreEngine.scoreZones(finalSupply, marketStructure);
    const demandScores = ZoneScoreEngine.scoreZones(finalDemand, marketStructure);

    const zoneScores = { ...supplyScores, ...demandScores };

    return {
      symbol,
      timeframe: '1H',
      supplyZones: finalSupply,
      demandZones: finalDemand,
      zoneScores,
      marketStructure,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
