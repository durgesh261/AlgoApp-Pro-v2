import {
  StrategySignalDto,
  StrategySignalOutcome,
  ZoneType,
  ZoneStatus,
} from '@algoapp/shared';
import { ZoneDetectorService } from './zoneDetector.service.js';
import { ZoneLifecycleService } from './zoneLifecycle.service.js';

// Persistent signal log - starts empty, no fake data
let signalLogs: StrategySignalDto[] = [];

export class StrategySignalService {
  public static async getLatestSignals(limit = 50): Promise<StrategySignalDto[]> {
    return signalLogs.slice(0, limit);
  }

  public static async evaluateSignal(
    symbol: string,
    currentPrice: number
  ): Promise<StrategySignalDto | null> {
    // Ensure we have fresh zones from live indicator engine
    const zones = await ZoneDetectorService.detectZones(symbol);
    
    let outcome = StrategySignalOutcome.WAIT;
    let rationale = `Price ($${currentPrice.toLocaleString()}) is in open range between 1H zones. No trade setup.`;
    let activeZoneId: string | undefined = undefined;
    let confidenceScore = 0.0;

    for (const zone of zones) {
      const evaluation = ZoneLifecycleService.evaluatePriceTouch(zone, currentPrice);

      // Skip broken or consumed zones
      if (evaluation.isBroken || zone.status === ZoneStatus.CONSUMED) {
        continue;
      }

      // Only trade FRESH or first TOUCH
      if (
        (evaluation.status === ZoneStatus.FRESH || evaluation.status === ZoneStatus.TOUCHED) &&
        currentPrice >= zone.lowerPrice &&
        currentPrice <= zone.upperPrice
      ) {
        activeZoneId = zone.id;
        confidenceScore = zone.strength;

        if (zone.type === ZoneType.DEMAND) {
          outcome = StrategySignalOutcome.BUY;
          rationale = `Price action touched 1H Demand Zone [${zone.lowerPrice} - ${zone.upperPrice}]. High demand accumulation.`;
        } else if (zone.type === ZoneType.SUPPLY) {
          outcome = StrategySignalOutcome.SELL;
          rationale = `Price action touched 1H Supply Zone [${zone.lowerPrice} - ${zone.upperPrice}]. Supply rejection expected.`;
        }
        break;
      }
    }

    // Only log and return if there's an actual signal
    if (outcome === StrategySignalOutcome.WAIT) {
      return null;
    }

    const signalDto: StrategySignalDto = {
      id: `SIG-${symbol}-${Date.now()}`,
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
    // Keep max 500 signals
    if (signalLogs.length > 500) signalLogs.pop();
    
    return signalDto;
  }

  public static clearLogs(): void {
    signalLogs = [];
  }
}
