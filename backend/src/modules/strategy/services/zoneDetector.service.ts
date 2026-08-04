import { ZoneDto, ZoneType, ZoneStatus, ZoneSource } from '@algoapp/shared';
import { ZoneMergerService } from './zoneMerger.service.js';

let activeZonesStore: ZoneDto[] = [
  // BTCUSD.P
  {
    id: 'ZON-BTC-SUP-1',
    symbol: 'BTCUSD.P',
    type: ZoneType.SUPPLY,
    timeframe: '1H',
    upperPrice: 65800.0,
    lowerPrice: 65200.0,
    source: ZoneSource.PIT_LITE,
    strength: 88.0,
    width: 600.0,
    freshness: 100.0,
    touchCount: 0,
    status: ZoneStatus.FRESH,
    createdAt: '2026-08-02T12:00:00Z',
    updatedAt: '2026-08-02T12:00:00Z',
  },
  {
    id: 'ZON-BTC-DEM-1',
    symbol: 'BTCUSD.P',
    type: ZoneType.DEMAND,
    timeframe: '1H',
    upperPrice: 63800.0,
    lowerPrice: 63200.0,
    source: ZoneSource.MERGED,
    strength: 95.0,
    width: 600.0,
    freshness: 75.0,
    touchCount: 1,
    status: ZoneStatus.TOUCHED,
    createdAt: '2026-08-02T14:00:00Z',
    updatedAt: '2026-08-02T18:14:02Z',
  },

  // ETHUSD.P
  {
    id: 'ZON-ETH-SUP-1',
    symbol: 'ETHUSD.P',
    type: ZoneType.SUPPLY,
    timeframe: '1H',
    upperPrice: 3580.0,
    lowerPrice: 3520.0,
    source: ZoneSource.LUXALGO,
    strength: 84.0,
    width: 60.0,
    freshness: 100.0,
    touchCount: 0,
    status: ZoneStatus.FRESH,
    createdAt: '2026-08-02T15:00:00Z',
    updatedAt: '2026-08-02T15:00:00Z',
  },
  {
    id: 'ZON-ETH-DEM-1',
    symbol: 'ETHUSD.P',
    type: ZoneType.DEMAND,
    timeframe: '1H',
    upperPrice: 3440.0,
    lowerPrice: 3380.0,
    source: ZoneSource.MERGED,
    strength: 91.0,
    width: 60.0,
    freshness: 75.0,
    touchCount: 1,
    status: ZoneStatus.TOUCHED,
    createdAt: '2026-08-02T16:00:00Z',
    updatedAt: '2026-08-02T19:05:18Z',
  },

  // SOLUSD.P
  {
    id: 'ZON-SOL-DEM-1',
    symbol: 'SOLUSD.P',
    type: ZoneType.DEMAND,
    timeframe: '1H',
    upperPrice: 140.0,
    lowerPrice: 136.0,
    source: ZoneSource.PIT_LITE,
    strength: 80.0,
    width: 4.0,
    freshness: 100.0,
    touchCount: 0,
    status: ZoneStatus.FRESH,
    createdAt: '2026-08-02T17:00:00Z',
    updatedAt: '2026-08-02T17:00:00Z',
  },

  // XRPUSD.P
  {
    id: 'ZON-XRP-DEM-1',
    symbol: 'XRPUSD.P',
    type: ZoneType.DEMAND,
    timeframe: '1H',
    upperPrice: 0.575,
    lowerPrice: 0.555,
    source: ZoneSource.MERGED,
    strength: 92.0,
    width: 0.02,
    freshness: 75.0,
    touchCount: 1,
    status: ZoneStatus.TOUCHED,
    createdAt: '2026-08-02T18:00:00Z',
    updatedAt: '2026-08-02T20:10:11Z',
  },
];

export class ZoneDetectorService {
  public static async getZones(symbol?: string): Promise<ZoneDto[]> {
    let zones = activeZonesStore;
    if (symbol) {
      zones = zones.filter((z) => z.symbol === symbol);
    }
    return ZoneMergerService.detectAndMergeZones(zones);
  }
}
