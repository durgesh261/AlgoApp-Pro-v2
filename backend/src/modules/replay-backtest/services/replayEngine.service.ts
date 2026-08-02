import {
  ReplaySessionDto,
  ReplayStatus,
  ReplayControlAction,
  ReplayEventDto,
} from '@algoapp/shared';
import { CandleStoreService } from '../../market-data/services/candleStore.service.js';

let activeReplaySession: ReplaySessionDto = {
  id: 'RPL-SES-101',
  symbol: 'BTCUSD.P',
  timeframe: '1H',
  currentCandleIndex: 0,
  totalCandles: 20,
  replayProgressPercent: 0,
  status: ReplayStatus.IDLE,
  speedMultiplier: 1.0,
  timestamp: new Date().toISOString(),
};

let replayEventStream: ReplayEventDto[] = [
  {
    id: 'RPL-EVT-1',
    sessionId: 'RPL-SES-101',
    eventType: 'REPLAY_STARTED',
    payloadJson: JSON.stringify({ action: 'START', timestamp: new Date().toISOString() }),
    timestamp: new Date().toISOString(),
  },
];

export class ReplayEngineService {
  public static async getActiveSession(symbol: string = 'BTCUSD.P'): Promise<ReplaySessionDto> {
    const candles = await CandleStoreService.getCandles(symbol, 50);
    const totalCandles = Math.max(1, candles.length);
    const safeIndex = Math.min(activeReplaySession.currentCandleIndex, totalCandles - 1);
    const currentCandle = candles[safeIndex];

    activeReplaySession = {
      ...activeReplaySession,
      symbol,
      totalCandles,
      currentCandleIndex: safeIndex,
      replayProgressPercent: Math.round(((safeIndex + 1) / totalCandles) * 100),
      currentCandle,
    };
    return activeReplaySession;
  }

  public static async controlReplay(
    action: ReplayControlAction,
    payload?: { speedMultiplier?: number; targetIndex?: number }
  ): Promise<ReplaySessionDto> {
    let session = await this.getActiveSession(activeReplaySession.symbol);

    switch (action) {
      case ReplayControlAction.PLAY:
        session.status = ReplayStatus.PLAYING;
        this.emitReplayEvent(session.id, 'REPLAY_STARTED', { status: 'PLAYING' });
        break;
      case ReplayControlAction.PAUSE:
        session.status = ReplayStatus.PAUSED;
        this.emitReplayEvent(session.id, 'REPLAY_PAUSED', { status: 'PAUSED' });
        break;
      case ReplayControlAction.RESUME:
        session.status = ReplayStatus.PLAYING;
        this.emitReplayEvent(session.id, 'REPLAY_RESUMED', { status: 'PLAYING' });
        break;
      case ReplayControlAction.STEP_FORWARD:
        if (session.currentCandleIndex < session.totalCandles - 1) {
          session.currentCandleIndex += 1;
          this.emitReplayEvent(session.id, 'CANDLE_ADVANCED', { newIndex: session.currentCandleIndex });
        } else {
          session.status = ReplayStatus.COMPLETED;
          this.emitReplayEvent(session.id, 'REPLAY_FINISHED', { status: 'COMPLETED' });
        }
        break;
      case ReplayControlAction.STEP_BACKWARD:
        if (session.currentCandleIndex > 0) {
          session.currentCandleIndex -= 1;
        }
        break;
      case ReplayControlAction.SET_SPEED:
        if (payload?.speedMultiplier) {
          session.speedMultiplier = payload.speedMultiplier;
        }
        break;
      case ReplayControlAction.JUMP_TO_INDEX:
        if (payload?.targetIndex !== undefined && payload.targetIndex >= 0 && payload.targetIndex < session.totalCandles) {
          session.currentCandleIndex = payload.targetIndex;
          this.emitReplayEvent(session.id, 'CANDLE_ADVANCED', { newIndex: session.currentCandleIndex });
        }
        break;
    }

    session.replayProgressPercent = Math.round(((session.currentCandleIndex + 1) / session.totalCandles) * 100);
    activeReplaySession = session;
    return session;
  }

  public static getReplayEvents(): ReplayEventDto[] {
    return replayEventStream;
  }

  private static emitReplayEvent(sessionId: string, eventType: ReplayEventDto['eventType'], payload: any) {
    replayEventStream.unshift({
      id: `RPL-EVT-${Date.now()}`,
      sessionId,
      eventType,
      payloadJson: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
    });
  }
}
