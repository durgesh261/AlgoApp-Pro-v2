import {
  TradingViewWebhookPayload,
  NormalizedMarketData,
  CandleDto,
  MarketSnapshotDto,
  MarketEventDto,
  MarketEventType,
} from '@algoapp/shared';

export class TradingViewNormalizer {
  public static normalizePayload(payload: TradingViewWebhookPayload): NormalizedMarketData {
    const timestampIso = new Date(payload.timestamp).toISOString();

    const candle: CandleDto = {
      id: `CANDLE-TV-${payload.symbol}-${Date.now()}`,
      symbol: payload.symbol,
      timeframe: '1H',
      open: payload.open,
      high: payload.high,
      low: payload.low,
      close: payload.close,
      volume: payload.volume,
      timestamp: timestampIso,
    };

    const snapshot: MarketSnapshotDto = {
      id: `SNAP-TV-${payload.symbol}`,
      symbol: payload.symbol,
      currentPrice: payload.close,
      spread: Math.abs(payload.high - payload.low) * 0.001,
      session: 'NEW_YORK',
      trend: payload.close >= payload.open ? 'BULLISH' : 'BEARISH',
      volatility: (payload.high - payload.low) / payload.close > 0.02 ? 'HIGH' : 'MEDIUM',
      timestamp: timestampIso,
    };

    const event: MarketEventDto = {
      id: `EVT-TV-${payload.symbol}-${Date.now()}`,
      symbol: payload.symbol,
      eventType: MarketEventType.TRADINGVIEW_CANDLE_RECEIVED,
      payloadJson: JSON.stringify({
        source: 'TRADINGVIEW_WEBHOOK',
        close: payload.close,
        volume: payload.volume,
      }),
      timestamp: timestampIso,
    };

    return { candle, snapshot, event };
  }
}
