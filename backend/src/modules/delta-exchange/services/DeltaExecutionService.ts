import { DeltaRestClient, DeltaPlaceOrderRequest } from './DeltaRestClient.js';
import { eventBus } from '../../../services/EventBus.js';

export interface DeltaOrderExecutionInput {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop_market' | 'stop_limit';
  size: number;
  price?: number | undefined;
  stopPrice?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  clientOrderId?: string | undefined;
  reduceOnly?: boolean | undefined;
}

export class DeltaExecutionService {
  constructor(private rest: DeltaRestClient) {}

  public async placeOrder(input: DeltaOrderExecutionInput): Promise<{
    success: boolean;
    orderId?: number | undefined;
    latencyMs: number;
    data?: any;
    error?: string | undefined;
  }> {
    const startTime = Date.now();
    const idempotencyKey = input.clientOrderId || `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const product = this.rest.getProduct(input.symbol);
      const productId = product?.id ?? 1;

      const orderPayload: DeltaPlaceOrderRequest = {
        product_id: productId,
        product_symbol: input.symbol,
        side: input.side,
        order_type: input.orderType,
        size: input.size,
        price: input.price,
        stop_price: input.stopPrice,
        stop_loss: input.stopLoss,
        take_profit: input.takeProfit,
        client_order_id: idempotencyKey,
        reduce_only: input.reduceOnly,
      };

      const result = await this.rest.placeOrder(orderPayload);
      const latencyMs = Date.now() - startTime;

      eventBus.emit('delta:order:placed', {
        orderId: result?.id,
        symbol: input.symbol,
        side: input.side,
        size: input.size,
        latencyMs,
      });

      return {
        success: true,
        orderId: result?.id,
        latencyMs,
        data: result,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = err?.response?.data?.error?.message || err?.message || 'Execution error';

      eventBus.emit('delta:order:failed', {
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

  public async cancelOrder(orderId: number, productId?: number | undefined): Promise<{
    success: boolean;
    latencyMs: number;
    error?: string | undefined;
  }> {
    const startTime = Date.now();
    try {
      await this.rest.cancelOrder(orderId, productId);
      const latencyMs = Date.now() - startTime;

      eventBus.emit('delta:order:cancelled', { orderId, latencyMs });
      return { success: true, latencyMs };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = err?.response?.data?.error?.message || err?.message || 'Cancel error';
      return { success: false, latencyMs, error: errorMsg };
    }
  }
}
