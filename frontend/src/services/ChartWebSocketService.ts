type WebSocketState = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

export interface LiveTrade {
  price: number;
  size: number;
  timestamp: number; // in milliseconds
  symbol: string;
}

export interface LiveTicker {
  markPrice: number;
  indexPrice: number;
  symbol: string;
}

type EventCallback = (data: any) => void;

class ChartWebSocketService {
  private ws: WebSocket | null = null;
  private url = 'wss://socket.india.delta.exchange';
  private state: WebSocketState = 'DISCONNECTED';
  
  private currentSymbol: string | null = null;

  private listeners: Record<'stateChange' | 'trade' | 'ticker', EventCallback[]> = {
    stateChange: [],
    trade: [],
    ticker: [],
  };

  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;

  public connect(symbol: string) {
    if (this.ws && (this.state === 'CONNECTED' || this.state === 'CONNECTING')) {
      if (this.currentSymbol === symbol) return; // already connected to this symbol
      // Need to resubscribe to new symbol
      this.unsubscribeCurrent();
      this.currentSymbol = symbol;
      this.subscribeCurrent();
      return;
    }

    this.currentSymbol = symbol;
    this.setState('CONNECTING');
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.setState('CONNECTED');
        this.subscribeCurrent();
        this.startPing();
      };

      this.ws.onmessage = (event) => this.handleMessage(event);

      this.ws.onclose = () => {
        this.cleanup();
        this.setState('DISCONNECTED');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Delta WebSocket Error:', error);
        this.ws?.close();
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      this.setState('DISCONNECTED');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.cleanup();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('DISCONNECTED');
  }

  public on(event: 'stateChange' | 'trade' | 'ticker', callback: EventCallback) {
    this.listeners[event].push(callback);
    if (event === 'stateChange') {
      callback(this.state);
    }
  }

  public off(event: 'stateChange' | 'trade' | 'ticker', callback: EventCallback) {
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private setState(newState: WebSocketState) {
    this.state = newState;
    this.emit('stateChange', newState);
  }

  private emit(event: 'stateChange' | 'trade' | 'ticker', data: any) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  private getAppSymbol(deltaSymbol: string) {
    const map: Record<string, string> = {
      'BTCUSD': 'BTCUSD.P',
      'ETHUSD': 'ETHUSD.P',
      'SOLUSD': 'SOLUSD.P',
      'XRPUSD': 'XRPUSD.P',
    };
    return map[deltaSymbol] || `${deltaSymbol}.P`;
  }

  private subscribeCurrent() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const symbols = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD'];
    const msg = {
      type: 'subscribe',
      payload: {
        channels: [
          { name: 'v2/trades', symbols: symbols },
          { name: 'v2/ticker', symbols: symbols }
        ]
      }
    };
    this.ws?.send(JSON.stringify(msg));
  }

  private unsubscribeCurrent() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const symbols = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD'];
    const msg = {
      type: 'unsubscribe',
      payload: {
        channels: [
          { name: 'v2/trades', symbols: symbols },
          { name: 'v2/ticker', symbols: symbols }
        ]
      }
    };
    this.ws.send(JSON.stringify(msg));
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'v2/trades' && Array.isArray(data.trades)) {
        data.trades.forEach((t: any) => {
          const trade: LiveTrade = {
            price: parseFloat(t.price),
            size: parseFloat(t.size),
            timestamp: t.timestamp ? parseInt(t.timestamp) : parseInt(t.timestamp_ms || Date.now().toString()),
            symbol: this.getAppSymbol(data.symbol)
          };
          if (trade.timestamp > 1000000000000000) trade.timestamp = Math.floor(trade.timestamp / 1000);
          this.emit('trade', trade);
        });
      }

      if (data.type === 'v2/ticker' && data.symbol) {
        const t = data;
        const ticker: LiveTicker = {
          markPrice: parseFloat(t.close || t.mark_price || 0),
          indexPrice: parseFloat(t.spot_price || t.index_price || 0),
          symbol: this.getAppSymbol(data.symbol)
        };
        if (ticker.markPrice > 0) {
          this.emit('ticker', ticker);
        }
      }

    } catch (e) {
      // Ignore errors
    }
  }

  private startPing() {
    this.cleanup();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private cleanup() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.state === 'RECONNECTING') return;
    this.setState('RECONNECTING');
    this.reconnectTimer = setTimeout(() => {
      if (this.currentSymbol) {
        this.connect(this.currentSymbol);
      }
    }, 3000);
  }
}

export const chartWebSocketService = new ChartWebSocketService();
