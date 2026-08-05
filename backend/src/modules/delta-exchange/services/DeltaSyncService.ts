import { DeltaRestClient, DeltaWalletBalance, DeltaPosition, DeltaOrder } from './DeltaRestClient.js';
import { DeltaWebSocketClient } from './DeltaWebSocketClient.js';
import { candleEngine } from '../../../engine/CandleEngine.js';
import { eventBus } from '../../../services/EventBus.js';

export interface DeltaHealthStatus {
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';
  restStatus: 'CONNECTED' | 'DEGRADED' | 'ERROR' | 'UNCONFIGURED';
  wsStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  lastSyncTime: string;
  reconcileCount: number;
}

export class DeltaSyncService {
  private rest: DeltaRestClient;
  private ws: DeltaWebSocketClient;
  private syncTimer: NodeJS.Timeout | null = null;
  private reconcileCount = 0;

  private latestBalances: DeltaWalletBalance[] = [];
  private latestPositions: DeltaPosition[] = [];
  private latestOrders: DeltaOrder[] = [];
  private latestHistory: any[] = [];

  private health: DeltaHealthStatus = {
    status: 'DISCONNECTED',
    restStatus: 'UNCONFIGURED',
    wsStatus: 'DISCONNECTED',
    lastSyncTime: new Date().toISOString(),
    reconcileCount: 0,
  };

  constructor(credentials: { apiKey: string; apiSecret: string }, isTestnet: boolean = false) {
    this.rest = new DeltaRestClient(credentials, isTestnet);
    this.ws = new DeltaWebSocketClient(
      credentials,
      {
        onTicker: (data) => this.handleTicker(data),
        onPosition: (data) => this.handleWsPosition(data),
        onOrder: (data) => this.handleWsOrder(data),
        onWallet: (data) => this.handleWsWallet(data),
        onConnect: () => {
          this.health.wsStatus = 'CONNECTED';
          this.updateAggregateStatus();
          eventBus.emit('delta:ws:connected');
        },
        onDisconnect: () => {
          this.health.wsStatus = 'DISCONNECTED';
          this.updateAggregateStatus();
          eventBus.emit('delta:ws:disconnected');
        },
        onError: () => {
          this.health.wsStatus = 'RECONNECTING';
          this.updateAggregateStatus();
        },
      },
      isTestnet
    );
  }

  private updateAggregateStatus(): void {
    if (this.health.wsStatus === 'CONNECTED' && this.health.restStatus === 'CONNECTED') {
      this.health.status = 'CONNECTED';
    } else if (this.health.wsStatus === 'RECONNECTING') {
      this.health.status = 'RECONNECTING';
    } else {
      this.health.status = 'DISCONNECTED';
    }
  }

  public async start(): Promise<void> {
    try {
      await this.rest.loadProducts();
      this.health.restStatus = 'CONNECTED';
    } catch {
      this.health.restStatus = 'DEGRADED';
    }

    this.ws.connect();

    const pairs = this.rest.getAllSupportedPairs();
    this.ws.subscribe('v2/ticker', pairs);
    this.ws.subscribe('v2/positions');
    this.ws.subscribe('v2/orders');
    this.ws.subscribe('v2/wallet');

    // Run reconciliation immediately and every 30s
    await this.reconcile();
    this.syncTimer = setInterval(() => this.reconcile(), 30000);
  }

  public async reconcile(): Promise<void> {
    try {
      const [balances, positions, orders, history] = await Promise.all([
        this.rest.getWalletBalances().catch(() => []),
        this.rest.getPositions().catch(() => []),
        this.rest.getOrders({ status: 'open' }).catch(() => []),
        this.rest.getHistory({ limit: 50 }).catch(() => []),
      ]);

      this.latestBalances = balances;
      this.latestPositions = positions;
      this.latestOrders = orders;
      this.latestHistory = history;

      this.reconcileCount++;
      this.health.reconcileCount = this.reconcileCount;
      this.health.lastSyncTime = new Date().toISOString();
      this.health.restStatus = 'CONNECTED';
      this.updateAggregateStatus();

      eventBus.emit('delta:synced', {
        balances: this.latestBalances,
        positions: this.latestPositions,
        orders: this.latestOrders,
      });
    } catch (err) {
      this.health.restStatus = 'ERROR';
      this.updateAggregateStatus();
      console.warn('[DeltaSyncService] Reconciliation notice:', err instanceof Error ? err.message : err);
    }
  }

  public getBalances(): DeltaWalletBalance[] {
    return this.latestBalances;
  }

  public getPositions(): DeltaPosition[] {
    return this.latestPositions;
  }

  public getOrders(): DeltaOrder[] {
    return this.latestOrders;
  }

  public getHistory(): any[] {
    return this.latestHistory;
  }

  public getHealth(): DeltaHealthStatus {
    return this.health;
  }

  public getRestClient(): DeltaRestClient {
    return this.rest;
  }

  private handleTicker(data: any): void {
    if (!data?.symbol || !data?.price) return;
    const price = parseFloat(data.price);
    const volume = parseFloat(data.volume_24h || '0');
    candleEngine.ingestTick(data.symbol, price, volume, new Date());
    eventBus.emit('ticker:live', data);
  }

  private handleWsPosition(data: any): void {
    eventBus.emit('position:live', data);
    void this.reconcile();
  }

  private handleWsOrder(data: any): void {
    eventBus.emit('order:live', data);
    void this.reconcile();
  }

  private handleWsWallet(data: any): void {
    eventBus.emit('wallet:live', data);
    void this.reconcile();
  }

  public stop(): void {
    this.ws.disconnect();
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}
