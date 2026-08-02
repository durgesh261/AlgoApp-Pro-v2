import {
  ExecutionRequestDto,
  ExecutionResultDto,
  ExecutionMode,
  ExecutionStatus,
  PaperOrderSide,
  PaperOrderType,
} from '@algoapp/shared';

import { IExecutionAdapter, AdapterValidationResult } from './executionAdapter.interface.js';
import { PaperOrderService } from '../../paper-trading/services/paperOrder.service.js';
import { PaperPositionService } from '../../paper-trading/services/paperPosition.service.js';

export class PaperAdapter implements IExecutionAdapter {
  public readonly name = 'PAPER_ADAPTER';
  public readonly mode = ExecutionMode.PAPER;

  public async validate(request: ExecutionRequestDto): Promise<AdapterValidationResult> {
    if (!request.symbol || request.quantity <= 0) {
      return { valid: false, reason: 'INVALID_ADAPTER_REQUEST: Quantity must be greater than 0.' };
    }
    return { valid: true };
  }

  public async submit(request: ExecutionRequestDto): Promise<ExecutionResultDto> {
    const startTime = Date.now();

    try {
      const order = await PaperOrderService.createOrder({
        symbol: request.symbol,
        side: request.side === 'LONG' ? PaperOrderSide.BUY : PaperOrderSide.SELL,
        orderType: request.orderType === 'LIMIT' ? PaperOrderType.LIMIT : PaperOrderType.MARKET,
        price: request.price,
        quantity: request.quantity,
        leverage: 10,
        stopLoss: request.stopLoss,
        takeProfit: request.takeProfit,
      });

      const latencyMs = Date.now() - startTime;

      return {
        id: `RES-${Date.now()}`,
        requestId: request.id,
        sessionId: request.sessionId,
        adapter: this.name,
        status: order.status === 'FILLED' ? ExecutionStatus.FILLED : ExecutionStatus.SUBMITTED,
        fillPrice: order.price ?? request.price ?? 64000.0,
        filledQuantity: order.filledQuantity > 0 ? order.filledQuantity : order.quantity,
        observability: {
          queueTimeMs: 5,
          validationLatencyMs: 2,
          adapterLatencyMs: latencyMs,
          totalLifecycleTimeMs: latencyMs + 7,
        },
        message: `Paper order ${order.id} submitted successfully.`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        id: `RES-${Date.now()}`,
        requestId: request.id,
        sessionId: request.sessionId,
        adapter: this.name,
        status: ExecutionStatus.FAILED,
        filledQuantity: 0,
        observability: {
          queueTimeMs: 5,
          validationLatencyMs: 2,
          adapterLatencyMs: latencyMs,
          totalLifecycleTimeMs: latencyMs + 7,
        },
        message: err?.message || 'Paper execution error.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  public async modify(orderId: string, input: Partial<ExecutionRequestDto>): Promise<ExecutionResultDto> {
    const startTime = Date.now();
    await PaperOrderService.modifyOrder(orderId, {
      price: input.price,
      stopLoss: input.stopLoss,
      takeProfit: input.takeProfit,
    });
    const latencyMs = Date.now() - startTime;

    return {
      id: `RES-${Date.now()}`,
      requestId: input.id || `REQ-MOD-${orderId}`,
      sessionId: input.sessionId || 'SESSION-DEFAULT',
      adapter: this.name,
      status: ExecutionStatus.SUBMITTED,
      filledQuantity: 0,
      observability: {
        queueTimeMs: 2,
        validationLatencyMs: 1,
        adapterLatencyMs: latencyMs,
        totalLifecycleTimeMs: latencyMs + 3,
      },
      message: `Paper order ${orderId} modified successfully.`,
      timestamp: new Date().toISOString(),
    };
  }

  public async cancel(orderId: string): Promise<ExecutionResultDto> {
    const startTime = Date.now();
    await PaperOrderService.cancelOrder(orderId);
    const latencyMs = Date.now() - startTime;

    return {
      id: `RES-${Date.now()}`,
      requestId: `REQ-CANCEL-${orderId}`,
      sessionId: 'SESSION-DEFAULT',
      adapter: this.name,
      status: ExecutionStatus.CANCELLED,
      filledQuantity: 0,
      observability: {
        queueTimeMs: 2,
        validationLatencyMs: 1,
        adapterLatencyMs: latencyMs,
        totalLifecycleTimeMs: latencyMs + 3,
      },
      message: `Paper order ${orderId} cancelled.`,
      timestamp: new Date().toISOString(),
    };
  }

  public async closePosition(symbol: string, exitPrice: number): Promise<ExecutionResultDto> {
    const startTime = Date.now();
    const positions = await PaperPositionService.getOpenPositions();
    const target = positions.find((p) => p.symbol === symbol);
    if (target) {
      await PaperPositionService.closePosition(target.id, exitPrice);
    }
    const latencyMs = Date.now() - startTime;

    return {
      id: `RES-${Date.now()}`,
      requestId: `REQ-CLOSE-${symbol}`,
      sessionId: 'SESSION-DEFAULT',
      adapter: this.name,
      status: ExecutionStatus.FILLED,
      fillPrice: exitPrice,
      filledQuantity: target?.quantity ?? 0,
      observability: {
        queueTimeMs: 2,
        validationLatencyMs: 1,
        adapterLatencyMs: latencyMs,
        totalLifecycleTimeMs: latencyMs + 3,
      },
      message: `Closed paper position for ${symbol} @ $${exitPrice}`,
      timestamp: new Date().toISOString(),
    };
  }

  public async synchronize(): Promise<void> {
    return;
  }

  public async getExecutionStatus(orderId: string): Promise<ExecutionStatus> {
    const orders = await PaperOrderService.getOrders();
    const found = orders.find((o) => o.id === orderId);
    if (!found) return ExecutionStatus.REJECTED;
    if (found.status === 'FILLED') return ExecutionStatus.FILLED;
    if (found.status === 'CANCELLED') return ExecutionStatus.CANCELLED;
    return ExecutionStatus.SUBMITTED;
  }
}
