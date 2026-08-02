import {
  StrategySignalDto,
  StrategySignalOutcome,
  ZoneType,
  ZoneStatus,
} from '@algoapp/shared';
import { ZoneDetectorService } from './zoneDetector.service.js';
import { ZoneLifecycleService } from './zoneLifecycle.service.js';

let signalLogs: StrategySignalDto[] = [
  {
    id: 'SIG-LOG-101',
    symbol: 'BTCUSD.P',
    timeframe: '1H',
    outcome: StrategySignalOutcome.BUY,
    price: 63650.0,
    activeZoneId: 'ZON-BTC-DEM-1',
    rationale: 'Price action entered 1H Merged Demand Zone (1st Touch). High confluence score.',
    confidenceScore: 94.0,
    timestamp: '2026-08-02T20:44:00Z',
  },
  {
    id: 'SIG-LOG-102',
    symbol: 'ETHUSD.P',
    timeframe: '1H',
    outcome: StrategySignalOutcome.BUY,
    price: 3420.0,
    activeZoneId: 'ZON-ETH-DEM-1',
    rationale: 'Price retested 1H Demand Zone boundary. Bullish structure intact.',
    confidenceScore: 88.0,
    timestamp: '2026-08-02T20:30:00Z',
  },
];

export class StrategySignalService {
  public static async getLatestSignals(): Promise<StrategySignalDto[]> {
    return signalLogs;
  }

  public static async evaluateSignal(
    symbol: string,
    currentPrice: number
  ): Promise<StrategySignalDto> {
    const zones = await ZoneDetectorService.getZones(symbol);
    let outcome = StrategySignalOutcome.WAIT;
    let rationale = `Price ($${currentPrice.toLocaleString()}) is in open range between 1H zones. No trade setup.`;
    let activeZoneId: string | undefined = undefined;
    let confidenceScore = 50.0;

    for (const zone of zones) {
      const evaluation = ZoneLifecycleService.evaluatePriceTouch(zone, currentPrice);

      if (evaluation.isBroken) {
        outcome = StrategySignalOutcome.INVALID;
        activeZoneId = zone.id;
        rationale = `1H ${zone.type} Zone broken by price action ($${currentPrice.toLocaleString()}). Market structure invalidated.`;
        confidenceScore = 0.0;
        break;
      }

      if (
        (evaluation.status === ZoneStatus.FRESH || evaluation.status === ZoneStatus.TOUCHED) &&
        currentPrice >= zone.lowerPrice &&
        currentPrice <= zone.upperPrice
      ) {
        activeZoneId = zone.id;
        confidenceScore = zone.strength;

        if (zone.type === ZoneType.DEMAND) {
          outcome = StrategySignalOutcome.BUY;
          rationale = `Price action touched 1H Demand Zone [${zone.lowerPrice} - ${zone.upperPrice}] (${zone.source}). High demand accumulation.`;
        } else if (zone.type === ZoneType.SUPPLY) {
          outcome = StrategySignalOutcome.SELL;
          rationale = `Price action touched 1H Supply Zone [${zone.lowerPrice} - ${zone.upperPrice}] (${zone.source}). Supply rejection expected.`;
        }
        break;
      }
    }

    const signalDto: StrategySignalDto = {
      id: `SIG-LOG-${Date.now()}`,
      symbol,
      timeframe: '1H',
      outcome,
      price: currentPrice,
      activeZoneId,
      rationale,
      confidenceScore,
      timestamp: new Date().toISOString(),
    };

    signalLogs.unshift(signalDto);
    return signalDto;
  }
}
