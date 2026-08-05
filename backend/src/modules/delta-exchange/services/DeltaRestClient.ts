import crypto from 'crypto';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface DeltaProduct {
  id: number;
  symbol: string;
  underlying_asset?: { symbol: string } | undefined;
  quoting_asset?: { symbol: string } | undefined;
  tick_size?: string | undefined;
  contract_value?: string | undefined;
  initial_margin?: string | undefined;
  maintenance_margin?: string | undefined;
}

export interface DeltaPlaceOrderRequest {
  product_id: number;
  product_symbol: string;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit' | 'stop_market' | 'stop_limit';
  size: number;
  price?: number | undefined;
  stop_price?: number | undefined;
  stop_loss?: number | undefined;
  take_profit?: number | undefined;
  client_order_id?: string | undefined;
  time_in_force?: 'gtc' | 'ioc' | 'fok' | undefined;
  reduce_only?: boolean | undefined;
  post_only?: boolean | undefined;
}

export interface DeltaWalletBalance {
  asset_id: number;
  asset_symbol: string;
  balance: string;
  available_balance: string;
  order_margin: string;
  position_margin: string;
  unrealized_pnl: string;
}

export interface DeltaPosition {
  product_id: number;
  product_symbol: string;
  size: number;
  entry_price: string;
  margin: string;
  liquidation_price: string;
  bankruptcy_price: string;
  unrealized_pnl: string;
  realized_pnl: string;
  side: 'buy' | 'sell';
}

export interface DeltaOrder {
  id: number;
  product_id: number;
  product_symbol: string;
  side: 'buy' | 'sell';
  order_type: string;
  size: number;
  unfilled_size: number;
  price: string;
  stop_price?: string | undefined;
  state: 'open' | 'pending' | 'closed' | 'cancelled' | 'rejected';
  created_at: string;
  updated_at: string;
}

export class DeltaRestClient {
  private client: AxiosInstance;
  private productsCache = new Map<string, DeltaProduct>();
  private readonly baseUrl: string;
  private tokens: number = 10;
  private lastTokenRefill: number = Date.now();
  private readonly maxTokens: number = 10;
  private readonly refillRatePerSec: number = 10;

  constructor(
    private credentials: { apiKey: string; apiSecret: string },
    isTestnet: boolean = false
  ) {
    this.baseUrl = isTestnet
      ? 'https://testnet-api.delta.exchange'
      : 'https://api.india.delta.exchange';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });

    this.client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      await this.waitForRateLimitToken();
      return this.signRequest(config);
    });
  }

  public isConfigured(): boolean {
    return !!(this.credentials.apiKey && this.credentials.apiSecret);
  }

  private async waitForRateLimitToken(): Promise<void> {
    const now = Date.now();
    const elapsed = (now - this.lastTokenRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRatePerSec);
    this.lastTokenRefill = now;

    if (this.tokens < 1) {
      const waitTime = ((1 - this.tokens) / this.refillRatePerSec) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.tokens = 0;
    } else {
      this.tokens -= 1;
    }
  }

  private signRequest(reqConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    if (!this.credentials.apiKey || !this.credentials.apiSecret) {
      return reqConfig;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = reqConfig.method?.toUpperCase() || 'GET';
    const path = reqConfig.url || '';
    const query = reqConfig.params
      ? '?' + new URLSearchParams(reqConfig.params).toString()
      : '';
    const body = reqConfig.data ? JSON.stringify(reqConfig.data) : '';

    const payload = method + timestamp + path + query + body;
    const signature = crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(payload)
      .digest('hex');

    reqConfig.headers.set('api-key', this.credentials.apiKey);
    reqConfig.headers.set('signature', signature);
    reqConfig.headers.set('timestamp', timestamp);
    reqConfig.headers.set('Content-Type', 'application/json');
    reqConfig.headers.set('User-Agent', 'AlgoApp-Enterprise-v2');

    return reqConfig;
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (err: any) {
        attempt++;
        if (attempt >= maxRetries || (err.response && err.response.status >= 400 && err.response.status < 500 && err.response.status !== 429)) {
          throw err;
        }
        const backoff = Math.pow(2, attempt) * 200 + Math.random() * 100;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    throw new Error('Max retries exceeded');
  }

  public async loadProducts(): Promise<void> {
    try {
      const res = await this.executeWithRetry(() => this.client.get('/v2/products'));
      if (res.data?.result) {
        for (const p of res.data.result) {
          this.productsCache.set(p.symbol, p);
        }
      }
    } catch (err) {
      console.warn('[DeltaRestClient] Load products notice:', err instanceof Error ? err.message : err);
    }
  }

  public getProduct(symbol: string): DeltaProduct | undefined {
    return this.productsCache.get(symbol);
  }

  public getAllSupportedPairs(): string[] {
    const list = Array.from(this.productsCache.keys());
    if (list.length > 0) {
      return list.filter((s) => ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'].includes(s));
    }
    return ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];
  }

  public async getWalletBalances(): Promise<DeltaWalletBalance[]> {
    const res = await this.executeWithRetry(() => this.client.get('/v2/wallet/balances'));
    return res.data?.result || [];
  }

  public async getPositions(): Promise<DeltaPosition[]> {
    const res = await this.executeWithRetry(() => this.client.get('/v2/positions'));
    return res.data?.result || [];
  }

  public async getOrders(params?: { status?: string | undefined }): Promise<DeltaOrder[]> {
    const res = await this.executeWithRetry(() => this.client.get('/v2/orders', { params }));
    return res.data?.result || [];
  }

  public async getHistory(params?: { limit?: number | undefined }): Promise<any[]> {
    const res = await this.executeWithRetry(() => this.client.get('/v2/orders/history', { params }));
    return res.data?.result || [];
  }

  public async placeOrder(order: DeltaPlaceOrderRequest): Promise<any> {
    const res = await this.executeWithRetry(() => this.client.post('/v2/orders', order), 2);
    return res.data?.result;
  }

  public async cancelOrder(orderId: number, productId?: number | undefined): Promise<any> {
    const res = await this.executeWithRetry(() =>
      this.client.delete('/v2/orders', {
        data: { id: orderId, product_id: productId },
      }),
      2
    );
    return res.data?.result;
  }

  public async getTicker(symbol: string): Promise<any> {
    const res = await this.executeWithRetry(() => this.client.get(`/v2/tickers/${symbol}`));
    return res.data?.result;
  }
}
