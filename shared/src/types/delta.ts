import { ExecutionResultDto, SubmitExecutionInput } from './execution.js';
import { PaperOrderDto, PaperPositionDto } from './paper.js';

export enum DeltaEnvironment {
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION',
}

export enum DeltaConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DEGRADED = 'DEGRADED',
  RECONNECTING = 'RECONNECTING',
}

export enum DeltaErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  NETWORK = 'NETWORK',
  EXCHANGE = 'EXCHANGE',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

export interface DeltaHealthDto {
  environment: DeltaEnvironment;
  connectionState: DeltaConnectionState;
  apiLatencyMs: number;
  wsLatencyMs: number;
  reconnectCount: number;
  rateLimitEvents: number;
  heartbeatAgeMs: number;
  isKillSwitchActive: boolean;
  timestamp: string;
}

export interface DeltaConfigDto {
  environment: DeltaEnvironment;
  apiKey?: string | undefined;
  apiSecret?: string | undefined;
  restUrl: string;
  wsUrl: string;
  maxRetries: number;
  isMockMode: boolean;
}

export interface IDeltaExecutionAdapter {
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  health(): Promise<DeltaHealthDto>;
  submitOrder(input: SubmitExecutionInput): Promise<ExecutionResultDto>;
  modifyOrder(orderId: string, input: Partial<SubmitExecutionInput>): Promise<ExecutionResultDto>;
  cancelOrder(orderId: string): Promise<ExecutionResultDto>;
  closePosition(symbol: string): Promise<ExecutionResultDto>;
  getOrder(orderId: string): Promise<PaperOrderDto | null>;
  getPosition(symbol: string): Promise<PaperPositionDto | null>;
  sync(): Promise<boolean>;
}
