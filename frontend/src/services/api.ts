import axios from 'axios';
import {
  ApiResponse,
  SystemHealthStatus,
  SystemSettingsDto,
  PaperWalletDto,
  PaperOrderDto,
  PaperPositionDto,
  PaperRiskConfigDto,
  PaperTradeJournalDto,
  PaperAnalyticsDto,
  CreatePaperOrderInput,
  ZoneDto,
  StrategySignalDto,
  EvaluateStrategySignalInput,
  DecisionDto,
  EvaluateDecisionInput,
  DecisionExplanationDto,
  ExplainDecisionInput,
  TradingRuleConfigDto,
  RuleMetadataDto,
  CalculateLeverageInput,
  LeverageOutputDto,
  UpdateTradingRuleConfigInput,
  CandleDto,
  MarketSnapshotDto,
  MarketEventDto,
  IngestCandleInput,
  ReplaySessionDto,
  ReplayControlAction,
  ReplayEventDto,
  BacktestSessionDto,
  RunBacktestInput,
  ExecutionSessionDto,
  ExecutionRequestDto,
  ExecutionResultDto,
  ExecutionJournalDto,
  SubmitExecutionInput,
  TradingViewHealthDto,
  TradingViewWebhookResult,
  WebhookEventDto,
  WebhookErrorDto,
  TradingViewWebhookPayload,
  PipelineTraceDto,
  SystemMonitorOverviewDto,
  RunPipelineInput,
  DeltaHealthDto,
  DeltaEnvironment,
  DeltaSyncStatusDto,
  DeltaStateReconciliationDto,
  DeltaRecoveryTestDto,
  ProductionOverviewDto,
  ExecutionMode,
  BackupStatusDto,
} from '@algoapp/shared';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-Request-Id'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return config;
});

export const systemApi = {
  getLiveness: async (): Promise<ApiResponse<{ status: string }>> => {
    const res = await apiClient.get('/system/liveness');
    return res.data;
  },
  getReadiness: async (): Promise<ApiResponse<SystemHealthStatus>> => {
    const res = await apiClient.get('/system/readiness');
    return res.data;
  },
  getSettings: async (): Promise<ApiResponse<SystemSettingsDto>> => {
    const res = await apiClient.get('/system/settings');
    return res.data;
  },
};

export const paperTradingApi = {
  getWallet: async (): Promise<ApiResponse<PaperWalletDto>> => {
    const res = await apiClient.get('/paper-trading/wallet');
    return res.data;
  },
  getOrders: async (): Promise<ApiResponse<PaperOrderDto[]>> => {
    const res = await apiClient.get('/paper-trading/orders');
    return res.data;
  },
  createOrder: async (order: CreatePaperOrderInput): Promise<ApiResponse<PaperOrderDto>> => {
    const res = await apiClient.post('/paper-trading/orders', order);
    return res.data;
  },
  cancelOrder: async (id: string): Promise<ApiResponse<PaperOrderDto>> => {
    const res = await apiClient.delete(`/paper-trading/orders/${id}`);
    return res.data;
  },
  getPositions: async (): Promise<ApiResponse<PaperPositionDto[]>> => {
    const res = await apiClient.get('/paper-trading/positions');
    return res.data;
  },
  closePosition: async (id: string, exitPrice: number): Promise<ApiResponse<PaperPositionDto>> => {
    const res = await apiClient.post(`/paper-trading/positions/${id}/close`, { exitPrice });
    return res.data;
  },
  getRiskConfig: async (): Promise<ApiResponse<PaperRiskConfigDto>> => {
    const res = await apiClient.get('/paper-trading/risk');
    return res.data;
  },
  getJournal: async (): Promise<ApiResponse<PaperTradeJournalDto[]>> => {
    const res = await apiClient.get('/paper-trading/journal');
    return res.data;
  },
  getAnalytics: async (): Promise<ApiResponse<PaperAnalyticsDto>> => {
    const res = await apiClient.get('/paper-trading/analytics');
    return res.data;
  },
};

export const strategyApi = {
  getZones: async (symbol?: string): Promise<ApiResponse<ZoneDto[]>> => {
    const res = await apiClient.get('/strategy/zones', { params: { symbol } });
    return res.data;
  },
  getSignals: async (): Promise<ApiResponse<StrategySignalDto[]>> => {
    const res = await apiClient.get('/strategy/signals');
    return res.data;
  },
  evaluateSignal: async (input: EvaluateStrategySignalInput): Promise<ApiResponse<StrategySignalDto>> => {
    const res = await apiClient.post('/strategy/evaluate', input);
    return res.data;
  },
};

export const decisionApi = {
  getLogs: async (): Promise<ApiResponse<DecisionDto[]>> => {
    const res = await apiClient.get('/decision/logs');
    return res.data;
  },
  evaluateDecision: async (input: EvaluateDecisionInput): Promise<ApiResponse<DecisionDto>> => {
    const res = await apiClient.post('/decision/evaluate', input);
    return res.data;
  },
};

export const aiDecisionApi = {
  explainDecision: async (input: ExplainDecisionInput): Promise<ApiResponse<DecisionExplanationDto>> => {
    const res = await apiClient.post('/ai-decision/explain', input);
    return res.data;
  },
};

export const tradingRulesApi = {
  getConfig: async (): Promise<ApiResponse<TradingRuleConfigDto>> => {
    const res = await apiClient.get('/rules/config');
    return res.data;
  },
  updateConfig: async (input: UpdateTradingRuleConfigInput): Promise<ApiResponse<TradingRuleConfigDto>> => {
    const res = await apiClient.patch('/rules/config', input);
    return res.data;
  },
  calculateLeverage: async (input: CalculateLeverageInput): Promise<ApiResponse<LeverageOutputDto>> => {
    const res = await apiClient.post('/rules/calculate-leverage', input);
    return res.data;
  },
  getRegistry: async (): Promise<ApiResponse<RuleMetadataDto[]>> => {
    const res = await apiClient.get('/rules/registry');
    return res.data;
  },
};

export const marketDataApi = {
  getSnapshot: async (symbol?: string): Promise<ApiResponse<MarketSnapshotDto>> => {
    const res = await apiClient.get('/market-data/snapshot', { params: { symbol } });
    return res.data;
  },
  getCandles: async (symbol: string, limit: number = 50): Promise<ApiResponse<CandleDto[]>> => {
    const res = await apiClient.get('/market-data/candles', { params: { symbol, limit } });
    return res.data;
  },
  ingestCandle: async (input: IngestCandleInput): Promise<ApiResponse<CandleDto>> => {
    const res = await apiClient.post('/market-data/candles', input);
    return res.data;
  },
  getEvents: async (): Promise<ApiResponse<MarketEventDto[]>> => {
    const res = await apiClient.get('/market-data/events');
    return res.data;
  },
};

export const replayApi = {
  getSession: async (symbol?: string): Promise<ApiResponse<ReplaySessionDto>> => {
    const res = await apiClient.get('/replay/session', { params: { symbol } });
    return res.data;
  },
  control: async (
    action: ReplayControlAction,
    payload?: { speedMultiplier?: number; targetIndex?: number }
  ): Promise<ApiResponse<ReplaySessionDto>> => {
    const res = await apiClient.post('/replay/control', { action, ...payload });
    return res.data;
  },
  getEvents: async (): Promise<ApiResponse<ReplayEventDto[]>> => {
    const res = await apiClient.get('/replay/events');
    return res.data;
  },
};

export const backtestApi = {
  getSessions: async (): Promise<ApiResponse<BacktestSessionDto[]>> => {
    const res = await apiClient.get('/replay/backtest/sessions');
    return res.data;
  },
  runBacktest: async (input: RunBacktestInput): Promise<ApiResponse<BacktestSessionDto>> => {
    const res = await apiClient.post('/replay/backtest/run', input);
    return res.data;
  },
};

export const executionApi = {
  submitExecution: async (input: SubmitExecutionInput): Promise<ApiResponse<{
    session: ExecutionSessionDto;
    request: ExecutionRequestDto;
    result: ExecutionResultDto;
    journal: ExecutionJournalDto[];
  }>> => {
    const res = await apiClient.post('/execution/submit', input);
    return res.data;
  },
  getSessions: async (): Promise<ApiResponse<ExecutionSessionDto[]>> => {
    const res = await apiClient.get('/execution/sessions');
    return res.data;
  },
  getRequests: async (): Promise<ApiResponse<ExecutionRequestDto[]>> => {
    const res = await apiClient.get('/execution/requests');
    return res.data;
  },
  getResults: async (): Promise<ApiResponse<ExecutionResultDto[]>> => {
    const res = await apiClient.get('/execution/results');
    return res.data;
  },
  getJournal: async (): Promise<ApiResponse<ExecutionJournalDto[]>> => {
    const res = await apiClient.get('/execution/journal');
    return res.data;
  },
};

export const tradingViewApi = {
  sendWebhook: async (payload: TradingViewWebhookPayload): Promise<ApiResponse<TradingViewWebhookResult>> => {
    const res = await apiClient.post('/tradingview/webhook', payload);
    return res.data;
  },
  getHealth: async (): Promise<ApiResponse<TradingViewHealthDto>> => {
    const res = await apiClient.get('/tradingview/health');
    return res.data;
  },
  getEvents: async (): Promise<ApiResponse<WebhookEventDto[]>> => {
    const res = await apiClient.get('/tradingview/events');
    return res.data;
  },
  getErrors: async (): Promise<ApiResponse<WebhookErrorDto[]>> => {
    const res = await apiClient.get('/tradingview/errors');
    return res.data;
  },
};

export const systemIntegrationApi = {
  runPipeline: async (input: RunPipelineInput): Promise<ApiResponse<PipelineTraceDto>> => {
    const res = await apiClient.post('/system-integration/pipeline/run', input);
    return res.data;
  },
  getTraces: async (): Promise<ApiResponse<PipelineTraceDto[]>> => {
    const res = await apiClient.get('/system-integration/traces');
    return res.data;
  },
  getTraceById: async (id: string): Promise<ApiResponse<PipelineTraceDto>> => {
    const res = await apiClient.get(`/system-integration/traces/${id}`);
    return res.data;
  },
  getHealthOverview: async (): Promise<ApiResponse<SystemMonitorOverviewDto>> => {
    const res = await apiClient.get('/system-integration/health-overview');
    return res.data;
  },
};

export const deltaApi = {
  getHealth: async (): Promise<ApiResponse<DeltaHealthDto>> => {
    const res = await apiClient.get('/execution/delta/health');
    return res.data;
  },
  connect: async (environment: DeltaEnvironment): Promise<ApiResponse<DeltaHealthDto>> => {
    const res = await apiClient.post('/execution/delta/connect', { environment });
    return res.data;
  },
  disconnect: async (): Promise<ApiResponse<DeltaHealthDto>> => {
    const res = await apiClient.post('/execution/delta/disconnect');
    return res.data;
  },
  toggleKillSwitch: async (active: boolean): Promise<ApiResponse<{ isKillSwitchActive: boolean }>> => {
    const res = await apiClient.post('/execution/delta/kill-switch', { active });
    return res.data;
  },
  getSyncStatus: async (): Promise<ApiResponse<DeltaSyncStatusDto>> => {
    const res = await apiClient.get('/execution/delta/sync');
    return res.data;
  },
  reconcileState: async (): Promise<ApiResponse<DeltaStateReconciliationDto>> => {
    const res = await apiClient.post('/execution/delta/reconcile');
    return res.data;
  },
  simulateRecovery: async (scenario: string): Promise<ApiResponse<DeltaRecoveryTestDto>> => {
    const res = await apiClient.post('/execution/delta/simulate-recovery', { scenario });
    return res.data;
  },
};

export const productionApi = {
  getOverview: async (): Promise<ApiResponse<ProductionOverviewDto>> => {
    const res = await apiClient.get('/production/overview');
    return res.data;
  },
  setMode: async (mode: ExecutionMode, userConfirmed: boolean = false): Promise<ApiResponse<{ activeExecutionMode: ExecutionMode }>> => {
    const res = await apiClient.post('/production/mode', { mode, userConfirmed });
    return res.data;
  },
  triggerBackup: async (): Promise<ApiResponse<BackupStatusDto>> => {
    const res = await apiClient.post('/production/backup');
    return res.data;
  },
};
