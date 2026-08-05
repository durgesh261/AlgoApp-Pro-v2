import { DeltaRestClient, DeltaPlaceOrderRequest } from '../delta/DeltaRestClient.js';
import { eventBus } from './EventBus.js';

export interface ExecuteOrderInput {
  symbol: string;
  side: 'LONG' | 'SHORT';
  orderType?: 'MARKET' | 'LIMIT' | undefined;
  quantity: number;
  price?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  decisionId?: string | undefined;
}

export class ExecutionService {
  constructor(private rest: DeltaRestClient) {}

  public async executeOrder(input: ExecuteOrderInput): Promise<{
    success: boolean;
    orderId?: number;
    latencyMs: number;
    error?: string;
  }> {
    const start = Date.now();
    const idempotencyKey = `exec-${input.decisionId || 'manual'}-${Date.now()}`;

    try {
      const product = this.rest.getProduct(input.symbol);
      const productId = product?.id ?? 1;

      const orderReq: DeltaPlaceOrderRequest = {
        product_id: productId,
        product_symbol: input.symbol,
        side: input.side === 'LONG' ? 'buy' : 'sell',
        order_type: input.orderType === 'LIMIT' ? 'limit' : 'market',
        size: input.quantity,
        price: input.price,
        stop_loss: input.stopLoss,
        take_profit: input.takeProfit,
        client_order_id: idempotencyKey,
      };

      const result = await this.rest.placeOrder(orderReq);
      const latencyMs = Date.now() - start;

      eventBus.emit('execution:success', {
        idempotencyKey,
        orderId: result?.id,
        symbol: input.symbol,
        side: input.side,
        quantity: input.quantity,
        latencyMs,
      });

      return {
        success: true,
        orderId: result?.id,
        latencyMs,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : 'Unknown execution error';

      eventBus.emit('execution:failed', {
        idempotencyKey,
        symbol: input.symbol,
        error: errorMsg,
        latencyMs,
      });

      return {
        success: false,
        latencyMs,
        error: errorMsg,
      };
    }
  }

  public async cancelOrder(deltaOrderId: number): Promise<boolean> {
    try {
      await this.rest.cancelOrder(deltaOrderId);
      eventBus.emit('order:cancelled', { deltaOrderId });
      return true;
    } catch (err) {
      console.error('[ExecutionService] Cancel order error:', err);
      return false;
    }
  }
}
