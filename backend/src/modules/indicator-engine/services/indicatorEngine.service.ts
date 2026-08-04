import { CandleDto, IndicatorEngineOutput, SupplyZone, DemandZone, TradingTimeframe } from '@algoapp/shared';
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
import { StrategyProfileService } from '../../strategy-profile/services/strategyProfile.service.js';

const profileService = new StrategyProfileService();

export class IndicatorEngineService {
  public async evaluateSymbol(
    symbol: string = 'BTCUSD.P',
    timeframe: TradingTimeframe = '1H',
    profileId?: string,
    inputCandles?: CandleDto[]
  ): Promise<IndicatorEngineOutput> {
    const profile = await profileService.getProfileById(profileId || 'DEF-1H-PROF');
    const candles = inputCandles ?? (await CandleStoreService.getCandles(symbol, timeframe, 100));

    if (candles.length === 0) {
      return {
        symbol,
        timeframe,
        supplyZones: [],
        demandZones: [],
        zoneScores: {},
        marketStructure: {
          symbol,
          timeframe,
          trend: 'BULLISH',
          internalTrend: 'BULLISH',
          swingTrend: 'BULLISH',
          liquiditySwept: false,
        },
        evaluatedAt: new Date().toISOString(),
      };
    }

    const latestCandle = candles[candles.length - 1]!;

    // 1. Pivot Engine (Using Profile zigzagLen & swingLen)
    const pivotLen = profile?.patConfig?.zigzagLen || (timeframe === '15M' ? 5 : 9);
    const swingLen = profile?.smcConfig?.swingLen || (timeframe === '15M' ? 30 : 50);

    const pivotsInternal = PivotEngine.findPivots(candles, pivotLen);
    const pivotsSwing = PivotEngine.findPivots(candles, swingLen);

    // 2. Swing Engine
    SwingEngine.calculateSwings(pivotsInternal);

    // 3. Market Structure Engine
    const { marketStructure, events } = MarketStructureEngine.evaluateStructure(symbol, candles, pivotsInternal, pivotsSwing);
    marketStructure.timeframe = timeframe;

    // 4. PAT Zone Engine
    const patResult = PatZoneEngine.extractPatZones(symbol, candles, events);
    marketStructure.liquiditySwept = patResult.liquiditySwept;

    // 5. SMC Zone Engine
    const smcResult = SmcZoneEngine.extractSmcZones(symbol, candles, pivotsInternal);

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
      timeframe,
      supplyZones: finalSupply,
      demandZones: finalDemand,
      zoneScores,
      marketStructure,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
