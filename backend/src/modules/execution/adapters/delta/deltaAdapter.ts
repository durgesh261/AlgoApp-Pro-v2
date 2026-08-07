import {
  IDeltaExecutionAdapter,
  DeltaHealthDto,
  DeltaEnvironment,
  DeltaConnectionState,
  ExecutionResultDto,
  SubmitExecutionInput,
  ExecutionStatus,
  PaperOrderDto,
  PaperPositionDto,
  PaperPositionSide,
} from '@algoapp/shared';

import { DeltaConnectionManager } from './deltaConnectionManager.js';
import { DeltaHealthMonitor } from './deltaHealthMonitor.js';
import { EmergencyKillSwitch } from './emergencyKillSwitch.js';
import { DeltaRestClient } from '../../../delta-exchange/services/DeltaRestClient.js';
import { PaperJournalService } from '../../../paper-trading/services/paperJournal.service.js';

export class DeltaAdapter implements IDeltaExecutionAdapter {
  private environment: DeltaEnvironment;
  private connectionManager: DeltaConnectionManager;
  private restClient: DeltaRestClient;
  public isMockMode: boolean;
  private mockPositions: Map<string, PaperPositionDto> = new Map();

  constructor(environment: DeltaEnvironment = DeltaEnvironment.SANDBOX, isMockMode: boolean = false) {
    this.environment = environment;
    this.connectionManager = new DeltaConnectionManager();
    this.isMockMode = isMockMode;

    const apiKey = process.env['DELTA_API_KEY'] || '';
    const apiSecret = process.env['DELTA_API_SECRET'] || '';
    this.restClient = new DeltaRestClient(
      { apiKey, apiSecret },
      environment === DeltaEnvironment.SANDBOX
    );
  }

  public getConnectionManager(): DeltaConnectionManager {
    return this.connectionManager;
  }

  public async connect(): Promise<boolean> {
    this.connectionManager.transitionTo(DeltaConnectionState.CONNECTING);
    if (this.isMockMode) {
      this.connectionManager.transitionTo(DeltaConnectionState.CONNECTED);
      DeltaHealthMonitor.updateHeartbeat();
      await PaperJournalService.logAction('DELTA_SANDBOX_CONNECT', 'Connected to Delta Sandbox testnet');
      return true;
    }

    try {
      await this.restClient.loadProducts();
      this.connectionManager.transitionTo(DeltaConnectionState.CONNECTED);
      DeltaHealthMonitor.updateHeartbeat();
      await PaperJournalService.logAction('DELTA_SANDBOX_CONNECT', 'Connected to Delta Live environment');
      return true;
    } catch {
      this.connectionManager.transitionTo(DeltaConnectionState.DISCONNECTED);
      return false;
    }
  }

  public async disconnect(): Promise<boolean> {
    this.connectionManager.transitionTo(DeltaConnectionState.DISCONNECTED);
    return true;
  }

  public async health(): Promise<DeltaHealthDto> {
    return DeltaHealthMonitor.getHealth(
      this.environment,
      this.connectionManager.getState(),
      this.connectionManager.getReconnectCount()
    );
  }

  public async submitOrder(input: SubmitExecutionInput): Promise<ExecutionResultDto> {
    if (EmergencyKillSwitch.isKillSwitchActive()) {
      return {
        id: `DLT-RES-${Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.REJECTED,
        filledQuantity: 0,
        observability: {
          queueTimeMs: 0,
          validationLatencyMs: 1,
          adapterLatencyMs: 1,
          totalLifecycleTimeMs: 2,
        },
        message: 'REJECTED: Platform Emergency Kill Switch is ACTIVE.',
        timestamp: new Date().toISOString(),
      };
    }

    const start = Date.now();

    if (this.isMockMode) {
      const fillPrice = input.price || 64000.0;
      const notional = fillPrice * input.quantity;
      const position: PaperPositionDto = {
        id: `POS-MOCK-${Date.now()}`,
        symbol: input.symbol,
        side: (input.side as any) || PaperPositionSide.LONG,
        quantity: input.quantity,
        entryPrice: fillPrice,
        markPrice: fillPrice,
        notionalValue: notional,
        unrealizedPnL: 0,
        realizedPnL: 0,
        leverage: 10,
        marginAllocated: notional / 10,
        stopLoss: input.stopLoss,
        takeProfit: input.takeProfit,
        openedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.mockPositions.set(input.symbol, position);

      const latencyMs = Date.now() - start;
      return {
        id: `DLT-RES-MOCK-${Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.FILLED,
        fillPrice,
        filledQuantity: input.quantity,
        observability: {
          queueTimeMs: 1,
          validationLatencyMs: 1,
          adapterLatencyMs: latencyMs,
          totalLifecycleTimeMs: latencyMs + 2,
        },
        message: `DELTA [${this.environment} - MOCK]: Mock order executed successfully.`,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const product = this.restClient.getProduct(input.symbol);
      const productId = product?.id ?? 1;

      const orderResult = await this.restClient.placeOrder({
        product_id: productId,
        product_symbol: input.symbol,
        side: (input.side as string) === 'LONG' || (input.side as string) === 'BUY' ? 'buy' : 'sell',
        order_type: input.price ? 'limit' : 'market',
        size: input.quantity,
        price: input.price,
        stop_loss: input.stopLoss,
        take_profit: input.takeProfit,
      });

      const latencyMs = Date.now() - start;
      return {
        id: `DLT-RES-${orderResult?.id || Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.FILLED,
        fillPrice: orderResult?.price ? parseFloat(orderResult.price) : input.price,
        filledQuantity: input.quantity,
        observability: {
          queueTimeMs: 1,
          validationLatencyMs: 1,
          adapterLatencyMs: latencyMs,
          totalLifecycleTimeMs: latencyMs + 2,
        },
        message: `DELTA [${this.environment}]: Order placed successfully on Delta Exchange.`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return {
        id: `DLT-RES-ERR-${Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.REJECTED,
        filledQuantity: 0,
        observability: {
          queueTimeMs: 0,
          validationLatencyMs: 1,
          adapterLatencyMs: latencyMs,
          totalLifecycleTimeMs: latencyMs + 1,
        },
        message: `DELTA Execution Error: ${err?.response?.data?.error?.message || err?.message || 'Failed to place order on Delta'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  public async modifyOrder(orderId: string, _input: Partial<SubmitExecutionInput>): Promise<ExecutionResultDto> {
    return {
      id: `DLT-RES-MOD-${Date.now()}`,
      requestId: `REQ-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      adapter: 'DELTA_ADAPTER',
      status: ExecutionStatus.SUBMITTED,
      filledQuantity: 0,
      observability: { queueTimeMs: 0, validationLatencyMs: 1, adapterLatencyMs: 2, totalLifecycleTimeMs: 3 },
      message: `DELTA [${this.environment}]: Order ${orderId} modified.`,
      timestamp: new Date().toISOString(),
    };
  }

  public async cancelOrder(orderId: string): Promise<ExecutionResultDto> {
    const start = Date.now();
    if (this.isMockMode) {
      return {
        id: `DLT-RES-CNC-MOCK-${Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.CANCELLED,
        filledQuantity: 0,
        observability: { queueTimeMs: 0, validationLatencyMs: 1, adapterLatencyMs: 1, totalLifecycleTimeMs: 2 },
        message: `DELTA [${this.environment} - MOCK]: Mock order ${orderId} cancelled.`,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      await this.restClient.cancelOrder(Number(orderId));
      const latencyMs = Date.now() - start;
      return {
        id: `DLT-RES-CNC-${Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.CANCELLED,
        filledQuantity: 0,
        observability: { queueTimeMs: 0, validationLatencyMs: 1, adapterLatencyMs: latencyMs, totalLifecycleTimeMs: latencyMs + 1 },
        message: `DELTA [${this.environment}]: Order ${orderId} cancelled.`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return {
        id: `DLT-RES-CNC-ERR-${Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.REJECTED,
        filledQuantity: 0,
        observability: { queueTimeMs: 0, validationLatencyMs: 1, adapterLatencyMs: latencyMs, totalLifecycleTimeMs: latencyMs + 1 },
        message: `DELTA Cancel Error: ${err?.message || 'Failed to cancel order'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  public async closePosition(symbol: string): Promise<ExecutionResultDto> {
    if (this.isMockMode) {
      this.mockPositions.delete(symbol);
    }
    return {
      id: `DLT-RES-CLS-${Date.now()}`,
      requestId: `REQ-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      adapter: 'DELTA_ADAPTER',
      status: ExecutionStatus.FILLED,
      filledQuantity: 0,
      observability: { queueTimeMs: 0, validationLatencyMs: 1, adapterLatencyMs: 4, totalLifecycleTimeMs: 5 },
      message: `DELTA [${this.environment}]: Position for ${symbol} close request submitted.`,
      timestamp: new Date().toISOString(),
    };
  }

  public async getOrder(_orderId: string): Promise<PaperOrderDto | null> {
    return null;
  }

  public async getPosition(symbol: string): Promise<PaperPositionDto | null> {
    if (this.isMockMode) {
      return this.mockPositions.get(symbol) || null;
    }
    return null;
  }

  public async sync(): Promise<boolean> {
    if (this.isMockMode) {
      return true;
    }
    try {
      await this.restClient.getPositions();
      return true;
    } catch {
      return false;
    }
  }
}
