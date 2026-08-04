export type AppEventType =
  | 'MARKET_CANDLE_RECEIVED'
  | 'INDICATOR_UPDATED'
  | 'ZONE_CREATED'
  | 'ZONE_BROKEN'
  | 'STRATEGY_SIGNAL_GENERATED'
  | 'DECISION_CREATED'
  | 'EXECUTION_REQUESTED'
  | 'EXECUTION_FILLED'
  | 'EXECUTION_REJECTED'
  | 'POSITION_OPENED'
  | 'POSITION_CLOSED'
  | 'WALLET_UPDATED'
  | 'CHALLENGE_UPDATED'
  | 'ANALYTICS_UPDATED'
  | 'NOTIFICATION_GENERATED';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  timestamp: string;
}

export interface AuditTimelineStep {
  stepName: string;
  timestamp: string;
  durationMs: number;
  details: string;
}

export interface TradeAuditTimelineDto {
  id: string;
  tradeId: string;
  symbol: string;
  steps: AuditTimelineStep[];
  totalDurationMs: number;
  createdAt: string;
}

export interface ReconciliationMismatch {
  component: 'POSITION' | 'ORDER' | 'WALLET' | 'MARGIN';
  algoAppState: string;
  exchangeState: string;
  difference: string;
}

export interface ReconciliationReportDto {
  id: string;
  reconciledAt: string;
  status: 'MATCHED' | 'MISMATCH_RESOLVED' | 'FAILED';
  mismatchesCount: number;
  mismatches: ReconciliationMismatch[];
}

export interface SubsystemHealthDto {
  subsystem: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastUpdate: string;
  warningsCount: number;
  errorsCount: number;
}
