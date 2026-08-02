export interface OpenTradeItem {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: string;
  markPrice: string;
  quantity: string;
  notionalValue: string;
  unrealizedPnL: string;
  unrealizedPnLPercent: string;
  isPositive: boolean;
  stopLoss: string;
  takeProfit: string;
  leverage: string;
  openedAt: string;
}

export interface TradeHistoryItem {
  id: string;
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  fillPrice: string;
  quantity: string;
  realizedPnL: string;
  isPositive: boolean;
  fee: string;
  executedAt: string;
  strategyName: string;
}

export interface SignalItem {
  id: string;
  source: 'TradingView Alert' | 'Manual Signal' | 'API Webhook';
  symbol: string;
  timeframe: string;
  eventType: 'ENTRY_LONG' | 'ENTRY_SHORT' | 'EXIT_ALL' | 'TRAILING_STOP';
  observedPrice: string;
  confidence: number;
  status: 'PROCESSED' | 'RISK_APPROVED' | 'REJECTED' | 'QUEUED';
  receivedAt: string;
}

export interface ActivityItem {
  id: string;
  category: 'RISK' | 'EXECUTION' | 'SYSTEM' | 'SECURITY';
  action: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
}

export const mockOpenTrades: OpenTradeItem[] = [
  {
    id: 'TRD-8801',
    symbol: 'BTCUSD.P',
    side: 'BUY',
    entryPrice: '$63,150.00',
    markPrice: '$64,250.00',
    quantity: '0.50000000',
    notionalValue: '$32,125.00',
    unrealizedPnL: '+$550.00',
    unrealizedPnLPercent: '+1.74%',
    isPositive: true,
    stopLoss: '$62,400.00',
    takeProfit: '$65,800.00',
    leverage: '10x',
    openedAt: '2026-08-02 18:14:02 UTC',
  },
  {
    id: 'TRD-8802',
    symbol: 'ETHUSD.P',
    side: 'BUY',
    entryPrice: '$3,420.00',
    markPrice: '$3,480.25',
    quantity: '4.00000000',
    notionalValue: '$13,921.00',
    unrealizedPnL: '+$241.00',
    unrealizedPnLPercent: '+1.76%',
    isPositive: true,
    stopLoss: '$3,380.00',
    takeProfit: '$3,580.00',
    leverage: '5x',
    openedAt: '2026-08-02 19:05:18 UTC',
  },
  {
    id: 'TRD-8803',
    symbol: 'SOLUSD.P',
    side: 'SELL',
    entryPrice: '$144.20',
    markPrice: '$142.10',
    quantity: '50.00000000',
    notionalValue: '$7,105.00',
    unrealizedPnL: '+$105.00',
    unrealizedPnLPercent: '+1.45%',
    isPositive: true,
    stopLoss: '$146.50',
    takeProfit: '$138.00',
    leverage: '5x',
    openedAt: '2026-08-02 19:42:50 UTC',
  },
  {
    id: 'TRD-8804',
    symbol: 'XRPUSD.P',
    side: 'BUY',
    entryPrice: '$0.5620',
    markPrice: '$0.5840',
    quantity: '10000.00000000',
    notionalValue: '$5,840.00',
    unrealizedPnL: '+$220.00',
    unrealizedPnLPercent: '+3.91%',
    isPositive: true,
    stopLoss: '$0.5480',
    takeProfit: '$0.6250',
    leverage: '3x',
    openedAt: '2026-08-02 20:10:11 UTC',
  },
];

export const mockTradeHistory: TradeHistoryItem[] = [
  {
    id: 'FIL-9901',
    orderId: 'ORD-7710',
    symbol: 'BTCUSD.P',
    side: 'BUY',
    fillPrice: '$62,800.00',
    quantity: '0.25000000',
    realizedPnL: '+$420.50',
    isPositive: true,
    fee: '$3.92',
    executedAt: '2026-08-02 15:30:00 UTC',
    strategyName: 'Momentum Breakout Alpha',
  },
  {
    id: 'FIL-9902',
    orderId: 'ORD-7711',
    symbol: 'ETHUSD.P',
    side: 'SELL',
    fillPrice: '$3,490.00',
    quantity: '2.00000000',
    realizedPnL: '+$185.20',
    isPositive: true,
    fee: '$1.74',
    executedAt: '2026-08-02 14:15:22 UTC',
    strategyName: 'Mean Reversion v2',
  },
  {
    id: 'FIL-9903',
    orderId: 'ORD-7712',
    symbol: 'SOLUSD.P',
    side: 'BUY',
    fillPrice: '$145.50',
    quantity: '20.00000000',
    realizedPnL: '-$62.00',
    isPositive: false,
    fee: '$0.72',
    executedAt: '2026-08-02 12:08:44 UTC',
    strategyName: 'Scalp Trend Follower',
  },
  {
    id: 'FIL-9904',
    orderId: 'ORD-7713',
    symbol: 'XRPUSD.P',
    side: 'BUY',
    fillPrice: '$0.5520',
    quantity: '5000.00000000',
    realizedPnL: '+$140.00',
    isPositive: true,
    fee: '$0.68',
    executedAt: '2026-08-02 10:45:10 UTC',
    strategyName: 'Breakout Volume Spike',
  },
];

export const mockSignals: SignalItem[] = [
  {
    id: 'SIG-401',
    source: 'TradingView Alert',
    symbol: 'BTCUSD.P',
    timeframe: '15m',
    eventType: 'ENTRY_LONG',
    observedPrice: '$64,180.00',
    confidence: 94,
    status: 'RISK_APPROVED',
    receivedAt: '2026-08-02 20:42:15 UTC',
  },
  {
    id: 'SIG-402',
    source: 'TradingView Alert',
    symbol: 'ETHUSD.P',
    timeframe: '1h',
    eventType: 'ENTRY_LONG',
    observedPrice: '$3,475.50',
    confidence: 88,
    status: 'PROCESSED',
    receivedAt: '2026-08-02 20:30:00 UTC',
  },
  {
    id: 'SIG-403',
    source: 'TradingView Alert',
    symbol: 'SOLUSD.P',
    timeframe: '5m',
    eventType: 'ENTRY_SHORT',
    observedPrice: '$142.30',
    confidence: 82,
    status: 'RISK_APPROVED',
    receivedAt: '2026-08-02 20:15:40 UTC',
  },
  {
    id: 'SIG-404',
    source: 'Manual Signal',
    symbol: 'XRPUSD.P',
    timeframe: '4h',
    eventType: 'ENTRY_LONG',
    observedPrice: '$0.5810',
    confidence: 91,
    status: 'PROCESSED',
    receivedAt: '2026-08-02 19:50:12 UTC',
  },
];

export const mockActivities: ActivityItem[] = [
  {
    id: 'ACT-101',
    category: 'RISK',
    action: 'Risk Utilization Evaluated',
    details: 'Current account exposure risk at 34.5% of max policy threshold.',
    status: 'SUCCESS',
    timestamp: '2026-08-02 20:44:00 UTC',
  },
  {
    id: 'ACT-102',
    category: 'EXECUTION',
    action: 'Client Order ID Assigned',
    details: 'Generated client order identifier CL-ORD-88210 for BTCUSD.P.',
    status: 'SUCCESS',
    timestamp: '2026-08-02 20:42:16 UTC',
  },
  {
    id: 'ACT-103',
    category: 'SYSTEM',
    action: 'Clock Synchronization Check',
    details: 'Server clock offset within target tolerance (< 2ms).',
    status: 'SUCCESS',
    timestamp: '2026-08-02 20:30:00 UTC',
  },
  {
    id: 'ACT-104',
    category: 'SECURITY',
    action: 'Single-User Session Verified',
    details: 'Active desktop terminal connection verified.',
    status: 'SUCCESS',
    timestamp: '2026-08-02 20:00:00 UTC',
  },
];
