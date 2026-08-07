import { eventBus } from '../../../services/EventBus.js';

export type OrderState =
  | 'NEW'
  | 'PENDING'
  | 'OPEN'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export interface OrderLifecycleRecord {
  id: number | string;
  clientOrderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop_market' | 'stop_limit';
  size: number;
  unfilledSize: number;
  filledSize: number;
  price?: number | undefined;
  stopPrice?: number | undefined;
  avgFillPrice?: number | undefined;
  state: OrderState;
  reduceOnly: boolean;
  postOnly: boolean;
  createdAt: string;
  updatedAt: string;
  transitions: {
    from: OrderState | 'NONE';
    to: OrderState;
    timestamp: string;
    reason?: string | undefined;
  }[];
}

export class OrderLifecycleService {
  private orders = new Map<string, OrderLifecycleRecord>();

  public createOrderRecord(params: {
    id: number | string;
    clientOrderId: string;
    symbol: string;
    side: 'buy' | 'sell';
    orderType: 'market' | 'limit' | 'stop_market' | 'stop_limit';
    size: number;
    price?: number | undefined;
    stopPrice?: number | undefined;
    reduceOnly?: boolean | undefined;
    postOnly?: boolean | undefined;
  }): OrderLifecycleRecord {
    const now = new Date().toISOString();
    const record: OrderLifecycleRecord = {
      id: params.id,
      clientOrderId: params.clientOrderId,
      symbol: params.symbol,
      side: params.side,
      orderType: params.orderType,
      size: params.size,
      unfilledSize: params.size,
      filledSize: 0,
      price: params.price,
      stopPrice: params.stopPrice,
      state: 'PENDING',
      reduceOnly: !!params.reduceOnly,
      postOnly: !!params.postOnly,
      createdAt: now,
      updatedAt: now,
      transitions: [
        {
          from: 'NONE',
          to: 'PENDING',
          timestamp: now,
          reason: 'Order created and queued for execution',
        },
      ],
    };

    this.orders.set(String(record.id), record);
    this.orders.set(record.clientOrderId, record);

    eventBus.emit('order:created', record);
    return record;
  }

  public transitionState(
    idOrClientOrderId: string | number,
    nextState: OrderState,
    updates?: {
      filledSize?: number | undefined;
      unfilledSize?: number | undefined;
      avgFillPrice?: number | undefined;
      reason?: string | undefined;
    }
  ): OrderLifecycleRecord | null {
    const key = String(idOrClientOrderId);
    const record = this.orders.get(key);
    if (!record) return null;

    const fromState = record.state;
    const now = new Date().toISOString();

    record.state = nextState;
    record.updatedAt = now;

    if (updates?.filledSize !== undefined) {
      record.filledSize = updates.filledSize;
      record.unfilledSize = Math.max(0, record.size - updates.filledSize);
    }
    if (updates?.unfilledSize !== undefined) {
      record.unfilledSize = updates.unfilledSize;
      record.filledSize = Math.max(0, record.size - updates.unfilledSize);
    }
    if (updates?.avgFillPrice !== undefined) {
      record.avgFillPrice = updates.avgFillPrice;
    }

    record.transitions.push({
      from: fromState,
      to: nextState,
      timestamp: now,
      reason: updates?.reason,
    });

    eventBus.emit('order:updated', record);

    if (nextState === 'FILLED') {
      eventBus.emit('order:filled', record);
    } else if (nextState === 'CANCELLED') {
      eventBus.emit('order:cancelled', record);
    } else if (nextState === 'REJECTED') {
      eventBus.emit('order:rejected', record);
    }

    return record;
  }

  public getOrder(idOrClientOrderId: string | number): OrderLifecycleRecord | undefined {
    return this.orders.get(String(idOrClientOrderId));
  }

  public getActiveOrders(): OrderLifecycleRecord[] {
    const seen = new Set<string>();
    const active: OrderLifecycleRecord[] = [];

    this.orders.forEach((rec) => {
      const idKey = String(rec.id);
      if (seen.has(idKey)) return;
      seen.add(idKey);

      if (['PENDING', 'OPEN', 'PARTIALLY_FILLED'].includes(rec.state)) {
        active.push(rec);
      }
    });

    return active;
  }

  public getAllOrders(): OrderLifecycleRecord[] {
    const seen = new Set<string>();
    const result: OrderLifecycleRecord[] = [];

    this.orders.forEach((rec) => {
      const idKey = String(rec.id);
      if (seen.has(idKey)) return;
      seen.add(idKey);
      result.push(rec);
    });

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  public transition(_orderId: string, _state: any, _result?: any): void {
    // Stub
  }
}

export const orderLifecycleService = new OrderLifecycleService();
