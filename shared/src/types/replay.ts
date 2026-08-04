import { CandleDto } from './marketData.js';

export enum ReplayStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export enum ReplayControlAction {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  STEP_FORWARD = 'STEP_FORWARD',
  STEP_BACKWARD = 'STEP_BACKWARD',
  SET_SPEED = 'SET_SPEED',
  JUMP_TO_INDEX = 'JUMP_TO_INDEX',
}

export interface ReplaySessionDto {
  id: string;
  symbol: string;
  timeframe: '1H';
  currentCandleIndex: number;
  totalCandles: number;
  replayProgressPercent: number;
  status: ReplayStatus;
  speedMultiplier: number;
  currentCandle?: CandleDto | undefined;
  timestamp: string;
}

export interface ReplayEventDto {
  id: string;
  sessionId: string;
  eventType: 'REPLAY_STARTED' | 'REPLAY_PAUSED' | 'REPLAY_RESUMED' | 'CANDLE_ADVANCED' | 'REPLAY_FINISHED';
  payloadJson: string;
  timestamp: string;
}
