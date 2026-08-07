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
      return undefined;
    }
    return timelinesStore[tradeId];
  }
}
