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
} from '@algoapp/shared';

import { DeltaConnectionManager } from './deltaConnectionManager.js';
import { DeltaHealthMonitor } from './deltaHealthMonitor.js';
import { EmergencyKillSwitch } from './emergencyKillSwitch.js';
import { DeltaRetryPolicy } from './deltaRetryPolicy.js';

let mockOrders: PaperOrderDto[] = [];
let mockPositions: PaperPositionDto[] = [];

export class DeltaAdapter implements IDeltaExecutionAdapter {
  private environment: DeltaEnvironment;
  private connectionManager: DeltaConnectionManager;
  public isMockMode: boolean;

  constructor(environment: DeltaEnvironment = DeltaEnvironment.SANDBOX, isMockMode: boolean = true) {
    this.environment = environment;
    this.connectionManager = new DeltaConnectionManager();
    this.isMockMode = isMockMode;
  }

  public async connect(): Promise<boolean> {
    this.connectionManager.transitionTo(DeltaConnectionState.CONNECTING);
    await new Promise((r) => setTimeout(r, 10));
    this.connectionManager.transitionTo(DeltaConnectionState.CONNECTED);
    DeltaHealthMonitor.updateHeartbeat();
    return true;
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
    return true;
  }
}
