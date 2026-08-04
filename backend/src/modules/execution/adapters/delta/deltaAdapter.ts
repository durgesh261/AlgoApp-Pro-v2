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
  PaperOrderSide,
  PaperOrderType,
  PaperOrderStatus,
  PaperPositionSide,
  PaperJournalEventType,
} from '@algoapp/shared';

import { DeltaConnectionManager } from './deltaConnectionManager.js';
import { DeltaHealthMonitor } from './deltaHealthMonitor.js';
import { EmergencyKillSwitch } from './emergencyKillSwitch.js';
import { DeltaRetryPolicy } from './deltaRetryPolicy.js';
import { DeltaSandboxClient } from './deltaSandboxClient.js';
import { PaperJournalService } from '../../../paper-trading/services/paperJournal.service.js';

let mockOrders: PaperOrderDto[] = [];
let mockPositions: PaperPositionDto[] = [];

export class DeltaAdapter implements IDeltaExecutionAdapter {
  private environment: DeltaEnvironment;
  private connectionManager: DeltaConnectionManager;
  private sandboxClient: DeltaSandboxClient;
  public isMockMode: boolean;

  constructor(environment: DeltaEnvironment = DeltaEnvironment.SANDBOX, isMockMode: boolean = true) {
    this.environment = environment;
    this.connectionManager = new DeltaConnectionManager();
    this.sandboxClient = new DeltaSandboxClient();
    this.isMockMode = isMockMode;
  }

  public getConnectionManager(): DeltaConnectionManager {
    return this.connectionManager;
  }

  public async connect(): Promise<boolean> {
    this.connectionManager.transitionTo(DeltaConnectionState.CONNECTING);
    await new Promise((r) => setTimeout(r, 10));
    this.connectionManager.transitionTo(DeltaConnectionState.CONNECTED);
    DeltaHealthMonitor.updateHeartbeat();
    await PaperJournalService.logEntry(
      PaperJournalEventType.SYSTEM_EVENT,
      'DELTA_SANDBOX_CONNECT',
      `Connected to Delta Exchange ${this.environment} Testnet`,
      'BTCUSD.P'
    );
    return true;
  }

  public async disconnect(): Promise<boolean> {
    this.connectionManager.transitionTo(DeltaConnectionState.DISCONNECTED);
    await PaperJournalService.logEntry(
      PaperJournalEventType.SYSTEM_EVENT,
      'DELTA_SANDBOX_DISCONNECT',
      `Disconnected from Delta Exchange ${this.environment}`,
      'BTCUSD.P'
    );
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
      const rejectedResult: ExecutionResultDto = {
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

      await PaperJournalService.logEntry(
        PaperJournalEventType.RISK_EVENT,
        'SUBMIT_ORDER_REJECTED',
        'Order rejected due to active Emergency Kill Switch',
        input.symbol
      );

      return rejectedResult;
    }

    return DeltaRetryPolicy.executeWithRetry(async () => {
      DeltaHealthMonitor.updateHeartbeat();
      const orderId = `DLT-ORD-${Date.now()}`;
      const fillPrice = input.price || 64000.0;

      const order: PaperOrderDto = {
        id: orderId,
        symbol: input.symbol,
        side: input.side as PaperOrderSide,
        orderType: PaperOrderType.MARKET,
        price: fillPrice,
        quantity: input.quantity,
        filledQuantity: input.quantity,
        status: PaperOrderStatus.FILLED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockOrders.push(order);

      const position: PaperPositionDto = {
        id: `DLT-POS-${Date.now()}`,
        symbol: input.symbol,
        side: input.side as PaperPositionSide,
        entryPrice: fillPrice,
        markPrice: fillPrice,
        quantity: input.quantity,
        notionalValue: fillPrice * input.quantity,
        unrealizedPnL: 0,
        realizedPnL: 0,
        leverage: 10,
        marginAllocated: (fillPrice * input.quantity) / 10,
        openedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPositions.push(position);

      await PaperJournalService.logEntry(
        PaperJournalEventType.ORDER_FILL,
        'SUBMIT_ORDER',
        `Submitted market order ${orderId} for ${input.quantity} ${input.symbol} @ $${fillPrice}`,
        input.symbol
      );

      return {
        id: `DLT-RES-${Date.now()}`,
        requestId: `REQ-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        adapter: 'DELTA_ADAPTER',
        status: ExecutionStatus.FILLED,
        fillPrice,
        filledQuantity: input.quantity,
        observability: {
          queueTimeMs: 1,
          validationLatencyMs: 2,
          adapterLatencyMs: 5,
          totalLifecycleTimeMs: 8,
        },
        message: `DELTA [${this.environment}]: Market order filled @ $${fillPrice}`,
        timestamp: new Date().toISOString(),
      };
    });
  }

  public async modifyOrder(orderId: string, input: Partial<SubmitExecutionInput>): Promise<ExecutionResultDto> {
    const order = mockOrders.find((o) => o.id === orderId);
    if (order && input.price) {
      order.price = input.price;
    }
    await PaperJournalService.logEntry(
      PaperJournalEventType.SYSTEM_EVENT,
      'MODIFY_ORDER',
      `Modified order ${orderId} price to $${input.price}`,
      order?.symbol || 'BTCUSD.P'
    );
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
    const order = mockOrders.find((o) => o.id === orderId);
    if (order) {
      order.status = PaperOrderStatus.CANCELLED;
    }
    await PaperJournalService.logEntry(
      PaperJournalEventType.SYSTEM_EVENT,
      'CANCEL_ORDER',
      `Cancelled order ${orderId}`,
      order?.symbol || 'BTCUSD.P'
    );
    return {
      id: `DLT-RES-CNC-${Date.now()}`,
      requestId: `REQ-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      adapter: 'DELTA_ADAPTER',
      status: ExecutionStatus.CANCELLED,
      filledQuantity: 0,
      observability: { queueTimeMs: 0, validationLatencyMs: 1, adapterLatencyMs: 2, totalLifecycleTimeMs: 3 },
      message: `DELTA [${this.environment}]: Order ${orderId} cancelled.`,
      timestamp: new Date().toISOString(),
    };
  }

  public async closePosition(symbol: string): Promise<ExecutionResultDto> {
    mockPositions = mockPositions.filter((p) => p.symbol !== symbol);
    await PaperJournalService.logEntry(
      PaperJournalEventType.SYSTEM_EVENT,
      'CLOSE_POSITION',
      `Closed position for ${symbol}`,
      symbol
    );
    return {
      id: `DLT-RES-CLS-${Date.now()}`,
      requestId: `REQ-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      adapter: 'DELTA_ADAPTER',
      status: ExecutionStatus.FILLED,
      filledQuantity: 0,
      observability: { queueTimeMs: 0, validationLatencyMs: 1, adapterLatencyMs: 4, totalLifecycleTimeMs: 5 },
      message: `DELTA [${this.environment}]: Position for ${symbol} closed.`,
      timestamp: new Date().toISOString(),
    };
  }

  public async getOrder(orderId: string): Promise<PaperOrderDto | null> {
    return mockOrders.find((o) => o.id === orderId) || null;
  }

  public async getPosition(symbol: string): Promise<PaperPositionDto | null> {
    return mockPositions.find((p) => p.symbol === symbol) || null;
  }

  public async sync(): Promise<boolean> {
    const syncStatus = await this.sandboxClient.fetchSyncStatus();
    await PaperJournalService.logEntry(
      PaperJournalEventType.SYSTEM_EVENT,
      'SYNC',
      `Synchronized Sandbox state (Orders: ${syncStatus.ordersCount}, Positions: ${syncStatus.positionsCount})`,
      'BTCUSD.P'
    );
    return syncStatus.isSynchronized;
  }
}
