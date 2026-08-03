import { TradeAuditTimelineDto, AuditTimelineStep } from '@algoapp/shared';

let timelinesStore: Record<string, TradeAuditTimelineDto> = {};

export class AuditTimelineService {
  public static async recordTimeline(
    tradeId: string,
    symbol: string,
    steps: AuditTimelineStep[]
  ): Promise<TradeAuditTimelineDto> {
    const totalDurationMs = steps.reduce((sum, s) => sum + s.durationMs, 0);

    const timeline: TradeAuditTimelineDto = {
      id: `TL-${tradeId}`,
      tradeId,
      symbol,
      steps,
      totalDurationMs,
      createdAt: new Date().toISOString(),
    };

    timelinesStore[tradeId] = timeline;
    return timeline;
  }

  public async getTimeline(tradeId: string): Promise<TradeAuditTimelineDto | undefined> {
    if (!timelinesStore[tradeId]) {
      // Seed default sample audit timeline for display
      return {
        id: `TL-${tradeId}`,
        tradeId,
        symbol: 'BTCUSD.P',
        steps: [
          { stepName: 'TradingView Webhook Received', timestamp: new Date(Date.now() - 3600000).toISOString(), durationMs: 4.2, details: 'Normalized 1H candle' },
          { stepName: 'Indicator Engine Evaluation', timestamp: new Date(Date.now() - 3595000).toISOString(), durationMs: 12.8, details: 'PAT Ob & SMC Demand Zone [63,200 - 63,800]' },
          { stepName: 'Strategy Signal Generation', timestamp: new Date(Date.now() - 3590000).toISOString(), durationMs: 2.1, details: 'LONG Signal generated with confidence 94.5%' },
          { stepName: 'Decision Engine Evaluation', timestamp: new Date(Date.now() - 3585000).toISOString(), durationMs: 5.4, details: 'Decision state: EXECUTE' },
          { stepName: 'Execution Requested', timestamp: new Date(Date.now() - 3580000).toISOString(), durationMs: 14.1, details: 'Submitted to Delta Exchange API' },
          { stepName: 'Exchange Fill Confirmation', timestamp: new Date(Date.now() - 3560000).toISOString(), durationMs: 18.5, details: 'Order filled @ 63,850' },
          { stepName: 'Trade Accounting', timestamp: new Date(Date.now() - 3550000).toISOString(), durationMs: 1.8, details: 'Taker fee $30.00, Net PnL calculated' },
          { stepName: 'Wallet & Challenge Updated', timestamp: new Date(Date.now() - 3540000).toISOString(), durationMs: 2.3, details: 'Equity updated to $51,000' },
          { stepName: 'Notification Broadcast', timestamp: new Date(Date.now() - 3530000).toISOString(), durationMs: 0.9, details: 'Broadcasted to event bus' },
        ],
        totalDurationMs: 62.1,
        createdAt: new Date().toISOString(),
      };
    }
    return timelinesStore[tradeId];
  }
}
