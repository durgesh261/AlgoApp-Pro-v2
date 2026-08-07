import { ZoneDto, ZoneType, ZoneStatus, ZoneSource } from '@algoapp/shared';
import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';
import { ZoneMergerService } from './zoneMerger.service.js';
import { candleEngine } from '../../../engine/CandleEngine.js';

// In-memory store for active zones detected from live data
let activeZonesStore = new Map<string, ZoneDto[]>(); // symbol -> zones

export class ZoneDetectorService {
  /**
   * Detect zones from live 1H candles using the native indicator engine.
   * This replaces the previous hardcoded fake zones.
   */
  public static async detectZones(symbol: string): Promise<ZoneDto[]> {
    const candles = candleEngine.get1HCandles(symbol);
    if (!candles || candles.length < 10) {
      return activeZonesStore.get(symbol) || [];
    }

    const indicators = IndicatorEngineService.computeIndicators(candles, '1H');
    const detectedZones: ZoneDto[] = [];

    // Convert Order Blocks to Zones
    for (const ob of indicators.orderBlocks || []) {
      const isBullish = ob.type === 'BULLISH';
      const zone: ZoneDto = {
        id: `ZON-${symbol}-${ob.createdAt}-${ob.baseCandleIndex}`,
        symbol,
        type: isBullish ? ZoneType.DEMAND : ZoneType.SUPPLY,
        timeframe: '1H',
        upperPrice: ob.upperPrice,
        lowerPrice: ob.lowerPrice,
        source: ZoneSource.MERGED,
        strength: 70,
        width: Math.abs(ob.upperPrice - ob.lowerPrice),
        freshness: 100,
        touchCount: 0,
        status: ZoneStatus.FRESH,
        createdAt: ob.createdAt,
        updatedAt: new Date().toISOString(),
      };
      detectedZones.push(zone);
    }

    // Convert Supply/Demand zones from indicator engine
    for (const sz of indicators.supplyZones || []) {
      detectedZones.push({
        id: `ZON-SUP-${symbol}-${sz.createdAt}`,
        symbol,
        type: ZoneType.SUPPLY,
        timeframe: '1H',
        upperPrice: sz.upperPrice,
        lowerPrice: sz.lowerPrice,
        source: ZoneSource.MERGED,
        strength: sz.mergedStrength || 75,
        width: Math.abs(sz.upperPrice - sz.lowerPrice),
        freshness: 100,
        touchCount: 0,
        status: ZoneStatus.FRESH,
        createdAt: sz.createdAt,
        updatedAt: new Date().toISOString(),
      });
    }

    for (const dz of indicators.demandZones || []) {
      detectedZones.push({
        id: `ZON-DEM-${symbol}-${dz.createdAt}`,
        symbol,
        type: ZoneType.DEMAND,
        timeframe: '1H',
        upperPrice: dz.upperPrice,
        lowerPrice: dz.lowerPrice,
        source: ZoneSource.MERGED,
        strength: dz.mergedStrength || 75,
        width: Math.abs(dz.upperPrice - dz.lowerPrice),
        freshness: 100,
        touchCount: 0,
        status: ZoneStatus.FRESH,
        createdAt: dz.createdAt,
        updatedAt: new Date().toISOString(),
      });
    }

    const merged = ZoneMergerService.detectAndMergeZones(detectedZones);
    
    // ── Strategy §12: Filter out permanently used/consumed blocks ──
    const activeZones = merged.filter(z => 
      z.status !== ZoneStatus.CONSUMED && 
      z.status !== ZoneStatus.BROKEN
    );
    
    activeZonesStore.set(symbol, activeZones);
    return activeZones;
  }

  public static async getZones(symbol?: string): Promise<ZoneDto[]> {
    if (symbol) {
      return this.detectZones(symbol);
    }
    
    // Return all zones for all tracked symbols
    const allZones: ZoneDto[] = [];
    for (const zones of activeZonesStore.values()) {
      allZones.push(...zones);
    }
    return ZoneMergerService.detectAndMergeZones(allZones);
  }

  public static markZoneUsed(zoneId: string): void {
    for (const [_sym, zones] of activeZonesStore.entries()) {
      const z = zones.find(zn => zn.id === zoneId);
      if (z) {
        z.status = ZoneStatus.CONSUMED;
        z.freshness = 0;
        z.updatedAt = new Date().toISOString();
        break;
      }
    }
  }

  public static clearZones(symbol?: string): void {
    if (symbol) {
      activeZonesStore.delete(symbol);
    } else {
      activeZonesStore.clear();
    }
  }
}
