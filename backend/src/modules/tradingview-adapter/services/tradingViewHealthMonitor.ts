import { TradingViewHealthDto, WebhookEventDto, WebhookErrorDto, CandleDto } from '@algoapp/shared';

let currentHealth: TradingViewHealthDto = {
  id: 'tradingview-health',
  status: 'CONNECTED',
  lastWebhookAt: new Date().toISOString(),
  lastWebhookTimestamp: new Date().toISOString(),
  totalWebhooks: 0,
  duplicateCount: 0,
  droppedCount: 0,
  malformedCount: 0,
  averageLatencyMs: 4.5,
  updatedAt: new Date().toISOString(),
};

let eventLog: WebhookEventDto[] = [];
let errorLog: WebhookErrorDto[] = [];

export class TradingViewHealthMonitor {
  public static async getHealth(): Promise<TradingViewHealthDto> {
    return currentHealth;
  }

  public static async recordWebhookSuccess(
    latencyMs: number,
    symbol: string,
    payloadJson: string,
    candle?: CandleDto
  ): Promise<void> {
    currentHealth.totalWebhooks += 1;
    currentHealth.lastWebhookAt = new Date().toISOString();
    currentHealth.lastWebhookTimestamp = new Date().toISOString();
    currentHealth.status = 'CONNECTED';

    if (candle) {
      currentHealth.lastReceivedCandle = candle;
    }

    // Update moving average latency
    currentHealth.averageLatencyMs = Number(
      ((currentHealth.averageLatencyMs * (currentHealth.totalWebhooks - 1) + latencyMs) / currentHealth.totalWebhooks).toFixed(2)
    );
    currentHealth.updatedAt = new Date().toISOString();

    const event: WebhookEventDto = {
      id: `EVT-${Date.now()}`,
      symbol,
      timeframe: '1H',
      payloadJson,
      status: 'PROCESSED',
      timestamp: new Date().toISOString(),
    };
    eventLog.unshift(event);
  }

  public static async recordDuplicate(symbol: string, rawPayload: string): Promise<void> {
    currentHealth.totalWebhooks += 1;
    currentHealth.duplicateCount += 1;
    currentHealth.lastWebhookAt = new Date().toISOString();
    currentHealth.lastWebhookTimestamp = new Date().toISOString();
    currentHealth.updatedAt = new Date().toISOString();

    const event: WebhookEventDto = {
      id: `EVT-DUP-${Date.now()}`,
      symbol,
      timeframe: '1H',
      payloadJson: rawPayload,
      status: 'DUPLICATE',
      timestamp: new Date().toISOString(),
    };
    eventLog.unshift(event);
  }

  public static async recordMalformed(reason: string, rawPayload: string): Promise<void> {
    currentHealth.totalWebhooks += 1;
    currentHealth.malformedCount += 1;
    currentHealth.lastWebhookAt = new Date().toISOString();
    currentHealth.lastWebhookTimestamp = new Date().toISOString();
    currentHealth.status = currentHealth.malformedCount > 5 ? 'DEGRADED' : 'CONNECTED';
    currentHealth.updatedAt = new Date().toISOString();

    const err: WebhookErrorDto = {
      id: `ERR-${Date.now()}`,
      errorType: 'MALFORMED_WEBHOOK',
      message: reason,
      rawPayload,
      timestamp: new Date().toISOString(),
    };
    errorLog.unshift(err);
  }

  public static async recordDropped(reason: string, rawPayload: string): Promise<void> {
    currentHealth.totalWebhooks += 1;
    currentHealth.droppedCount += 1;
    currentHealth.lastWebhookAt = new Date().toISOString();
    currentHealth.lastWebhookTimestamp = new Date().toISOString();
    currentHealth.updatedAt = new Date().toISOString();

    const err: WebhookErrorDto = {
      id: `ERR-DROP-${Date.now()}`,
      errorType: 'DROPPED_WEBHOOK',
      message: reason,
      rawPayload,
      timestamp: new Date().toISOString(),
    };
    errorLog.unshift(err);
  }

  public static async getEvents(): Promise<WebhookEventDto[]> {
    return eventLog;
  }

  public static async getErrors(): Promise<WebhookErrorDto[]> {
    return errorLog;
  }
}
