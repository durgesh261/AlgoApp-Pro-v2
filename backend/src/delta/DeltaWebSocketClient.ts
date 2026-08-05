import WebSocket from 'ws';
import crypto from 'crypto';

export interface DeltaWsCallbacks {
  onTicker?: (data: any) => void;
  onPosition?: (data: any) => void;
  onOrder?: (data: any) => void;
  onWallet?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class DeltaWebSocketClient {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isExplicitDisconnect = false;
  private readonly wsUrl: string;

  constructor(
    private credentials: { apiKey: string; apiSecret: string },
    private callbacks: DeltaWsCallbacks,
    isTestnet: boolean = false
  ) {
    this.wsUrl = isTestnet
      ? 'wss://testnet-socket.delta.exchange'
      : 'wss://socket.india.delta.exchange';
  }

  public connect(): void {
    this.isExplicitDisconnect = false;
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        this.callbacks.onConnect?.();
        this.startHeartbeat();
        if (this.credentials.apiKey && this.credentials.apiSecret) {
          this.authenticate();
        }
      });

      this.ws.on('message', (raw: WebSocket.Data) => {
        try {
          const msg = JSON.parse(raw.toString());
          this.handleMessage(msg);
        } catch (err) {
          console.error('[DeltaWS] JSON Parse error:', err);
        }
      });

      this.ws.on('close', () => {
        this.stopHeartbeat();
        this.callbacks.onDisconnect?.();
        if (!this.isExplicitDisconnect) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (err: Error) => {
        console.error('[DeltaWS] Socket Error:', err.message);
      });
    } catch (err) {
      console.error('[DeltaWS] Connection exception:', err);
      this.scheduleReconnect();
    }
  }

  private authenticate(): void {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = 'GET' + timestamp + '/live';
    const signature = crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(payload)
      .digest('hex');

    this.send({
      type: 'auth',
      payload: {
        'api-key': this.credentials.apiKey,
        signature: signature,
        timestamp: timestamp,
      },
    });
  }

  public subscribe(channel: string, symbols?: string[]): void {
    this.send({
      type: 'subscribe',
      payload: {
        channels: [
          {
            name: channel,
            symbols: symbols && symbols.length > 0 ? symbols : undefined,
          },
        ],
      },
    });
  }

  private handleMessage(msg: any): void {
    if (!msg) return;
    if (msg.type === 'v2/ticker') {
      this.callbacks.onTicker?.(msg);
    } else if (msg.type === 'v2/positions') {
      this.callbacks.onPosition?.(msg);
    } else if (msg.type === 'v2/orders') {
      this.callbacks.onOrder?.(msg);
    } else if (msg.type === 'v2/wallet') {
      this.callbacks.onWallet?.(msg);
    }
  }

  private startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      console.log('[DeltaWS] Attempting auto-reconnect...');
      this.connect();
    }, 5000);
  }

  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public disconnect(): void {
    this.isExplicitDisconnect = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
  }
}
