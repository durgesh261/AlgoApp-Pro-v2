import { MarketEventDto, MarketEventType } from '@algoapp/shared';

let eventLog: MarketEventDto[] = [
  {
    id: 'MKT-EVT-101',
    symbol: 'BTCUSD.P',
    eventType: MarketEventType.NEW_CANDLE,
    payloadJson: JSON.stringify({ open: 63800, high: 64500, low: 63600, close: 64250, volume: 1420, text: '1H Candle Close' }),
    timestamp: '2026-08-02T20:00:00Z',
  },
  {
    id: 'MKT-EVT-102',
    symbol: 'ETHUSD.P',
    eventType: MarketEventType.PRICE_UPDATED,
    payloadJson: JSON.stringify({ currentPrice: 3480.25, spread: 0.25 }),
    timestamp: '2026-08-02T20:44:00Z',
  },
];

export class MarketEventGenerator {
  public static async getEvents(): Promise<MarketEventDto[]> {
    return eventLog;
  }

  public static async emitEvent(
    symbol: string,
    eventType: MarketEventType,
    payload: Record<string, any>
  ): Promise<MarketEventDto> {
    const event: MarketEventDto = {
      id: `MKT-EVT-${Date.now()}`,
      symbol,
      eventType,
      payloadJson: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
    };
    eventLog.unshift(event);
    return event;
  }
}
