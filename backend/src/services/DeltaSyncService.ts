import { DeltaRestClient } from '../delta/DeltaRestClient.js';
import { DeltaWebSocketClient } from '../delta/DeltaWebSocketClient.js';
import { candleEngine } from '../engine/CandleEngine.js';
import { eventBus } from './EventBus.js';

export class DeltaSyncService {
  private rest: DeltaRestClient;
  private ws: DeltaWebSocketClient;
  private syncTimer: NodeJS.Timeout | null = null;
  private latestHealth = { restStatus: 'UNKNOWN', wsStatus: 'DISCONNECTED', lastSync: new Date() };

  constructor(credentials: { apiKey: string; apiSecret: string }, isTestnet: boolean = false) {
    this.rest = new DeltaRestClient(credentials, isTestnet);
    this.ws = new DeltaWebSocketClient(
      credentials,
      {
        onTicker: (data) => this.handleTicker(data),
        onPosition: (data) => this.handlePosition(data),
        onOrder: (data) => this.handleOrder(data),
        onWallet: (data) => this.handleWallet(data),
        onConnect: () => {
          this.latestHealth.wsStatus = 'CONNECTED';
          eventBus.emit('delta:ws:state', 'CONNECTED');
        },
        onDisconnect: () => {
          this.latestHealth.wsStatus = 'DISCONNECTED';
          eventBus.emit('delta:ws:state', 'DISCONNECTED');
        },
      },
      isTestnet
    );
  }

  public async start(): Promise<void> {
    try {
      await this.rest.loadProducts();
      this.latestHealth.restStatus = 'CONNECTED';
    } catch {
      this.latestHealth.restStatus = 'ERROR';
    }

    this.ws.connect();

    const pairs = this.rest.getAllSupportedPairs();
    this.ws.subscribe('v2/ticker', pairs);
    this.ws.subscribe('v2/positions');
    this.ws.subscribe('v2/orders');
    this.ws.subscribe('v2/wallet');

    this.syncTimer = setInterval(() => this.reconcile(), 30000);
    await this.reconcile();
  }

  public async reconcile(): Promise<void> {
    try {
      const [balances, positions, orders] = await Promise.all([
        this.rest.getWalletBalances().catch(() => []),
        this.rest.getPositions().catch(() => []),
        this.rest.getOrders({ status: 'open' }).catch(() => []),
      ]);

      this.latestHealth.restStatus = 'CONNECTED';
      this.latestHealth.lastSync = new Date();

      eventBus.emit('delta:reconciled', { balances, positions, orders });
    } catch (err) {
      this.latestHealth.restStatus = 'ERROR';
      console.warn('[DeltaSync] Periodic reconciliation warning:', err instanceof Error ? err.message : err);
    }
  }

  public getHealth() {
    return this.latestHealth;
  }

  public getRestClient(): DeltaRestClient {
    return this.rest;
  }

  private handleTicker(data: any): void {
    if (!data?.symbol || !data?.price) return;
    const price = parseFloat(data.price);
    const volume = parseFloat(data.volume_24h || '0');
    candleEngine.ingestTick(data.symbol, price, volume, new Date());
    eventBus.emit('ticker', data);
  }

  private handlePosition(data: any): void {
    eventBus.emit('position:ws', data);
  }

  private handleOrder(data: any): void {
    eventBus.emit('order:ws', data);
  }

  private handleWallet(data: any): void {
    eventBus.emit('wallet:ws', data);
  }

  public stop(): void {
    this.ws.disconnect();
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}
