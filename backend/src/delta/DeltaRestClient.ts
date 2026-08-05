import crypto from 'crypto';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface DeltaProduct {
  id: number;
  symbol: string;
  underlying_asset?: { symbol: string } | undefined;
  quoting_asset?: { symbol: string } | undefined;
  tick_size?: string | undefined;
  contract_value?: string | undefined;
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

export class DeltaRestClient {
  private client: AxiosInstance;
  private productsCache = new Map<string, DeltaProduct>();
  private readonly baseUrl: string;

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

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) =>
      this.signRequest(config)
    );
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

  public async loadProducts(): Promise<void> {
    try {
      const res = await this.client.get('/v2/products');
      if (res.data?.result) {
        for (const p of res.data.result) {
          this.productsCache.set(p.symbol, p);
        }
      }
    } catch (err) {
      console.warn('[DeltaRestClient] Products loading note:', err instanceof Error ? err.message : err);
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

  public async getWalletBalances(): Promise<any[]> {
    const res = await this.client.get('/v2/wallet/balances');
    return res.data?.result || [];
  }

  public async getPositions(): Promise<any[]> {
    const res = await this.client.get('/v2/positions');
    return res.data?.result || [];
  }

  public async getOrders(params?: { status?: string }): Promise<any[]> {
    const res = await this.client.get('/v2/orders', { params });
    return res.data?.result || [];
  }

  public async placeOrder(order: DeltaPlaceOrderRequest): Promise<any> {
    const res = await this.client.post('/v2/orders', order);
    return res.data?.result;
  }

  public async cancelOrder(orderId: number, productId?: number): Promise<any> {
    const res = await this.client.delete('/v2/orders', {
      data: { id: orderId, product_id: productId },
    });
    return res.data?.result;
  }
}
