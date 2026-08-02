export interface PairMarketDetails {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  isPositive: boolean;
  high24h: string;
  low24h: string;
  volume24h: string;
  trend: 'STRONG_BULLISH' | 'BULLISH' | 'CONSOLIDATING' | 'BEARISH' | 'STRONG_BEARISH';
  zone: 'BREAKOUT_ACCUMULATION' | 'SUPPORT_RETEST' | 'OVERSOLD' | 'OVERBOUGHT_REJECTION' | 'LIQUIDATION_RISK';
  confidenceScore: number; // 0 to 100
  opportunityScore: number; // 0 to 100
  marketStructure: 'BULLISH_CONTINUATION' | 'BEARISH_REVERSAL' | 'RANGE_BOUND' | 'EXPANSION';
  riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  expectedRR: string;
  waitingStatus: 'WAITING_FOR_TRIGGER' | 'ORDER_PENDING' | 'POSITION_ACTIVE' | 'IDLE';
  tradeStatus: 'READY_TO_EXECUTE' | 'RISK_APPROVED' | 'PAUSED' | 'STANDBY';
  supportLevel: string;
  resistanceLevel: string;
}

export const mockMarketPairs: Record<string, PairMarketDetails> = {
  'BTCUSD.P': {
    symbol: 'BTCUSD.P',
    name: 'Bitcoin Perpetual',
    price: '$64,250.00',
    change24h: '+3.42%',
    isPositive: true,
    high24h: '$65,100.00',
    low24h: '$62,180.00',
    volume24h: '$14.2B',
    trend: 'STRONG_BULLISH',
    zone: 'BREAKOUT_ACCUMULATION',
    confidenceScore: 92,
    opportunityScore: 94,
    marketStructure: 'BULLISH_CONTINUATION',
    riskRating: 'LOW',
    expectedRR: '1 : 3.4',
    waitingStatus: 'WAITING_FOR_TRIGGER',
    tradeStatus: 'READY_TO_EXECUTE',
    supportLevel: '$63,500.00',
    resistanceLevel: '$65,800.00',
  },
  'ETHUSD.P': {
    symbol: 'ETHUSD.P',
    name: 'Ethereum Perpetual',
    price: '$3,480.25',
    change24h: '+2.18%',
    isPositive: true,
    high24h: '$3,520.00',
    low24h: '$3,390.00',
    volume24h: '$6.8B',
    trend: 'BULLISH',
    zone: 'SUPPORT_RETEST',
    confidenceScore: 86,
    opportunityScore: 88,
    marketStructure: 'BULLISH_CONTINUATION',
    riskRating: 'LOW',
    expectedRR: '1 : 2.8',
    waitingStatus: 'POSITION_ACTIVE',
    tradeStatus: 'RISK_APPROVED',
    supportLevel: '$3,420.00',
    resistanceLevel: '$3,580.00',
  },
  'SOLUSD.P': {
    symbol: 'SOLUSD.P',
    name: 'Solana Perpetual',
    price: '$142.10',
    change24h: '-1.45%',
    isPositive: false,
    high24h: '$146.50',
    low24h: '$139.80',
    volume24h: '$2.4B',
    trend: 'CONSOLIDATING',
    zone: 'OVERSOLD',
    confidenceScore: 78,
    opportunityScore: 82,
    marketStructure: 'RANGE_BOUND',
    riskRating: 'MODERATE',
    expectedRR: '1 : 2.2',
    waitingStatus: 'WAITING_FOR_TRIGGER',
    tradeStatus: 'STANDBY',
    supportLevel: '$138.00',
    resistanceLevel: '$148.50',
  },
  'XRPUSD.P': {
    symbol: 'XRPUSD.P',
    name: 'Ripple Perpetual',
    price: '$0.5840',
    change24h: '+4.85%',
    isPositive: true,
    high24h: '$0.6120',
    low24h: '$0.5510',
    volume24h: '$1.1B',
    trend: 'STRONG_BULLISH',
    zone: 'BREAKOUT_ACCUMULATION',
    confidenceScore: 90,
    opportunityScore: 91,
    marketStructure: 'EXPANSION',
    riskRating: 'MODERATE',
    expectedRR: '1 : 3.8',
    waitingStatus: 'ORDER_PENDING',
    tradeStatus: 'READY_TO_EXECUTE',
    supportLevel: '$0.5600',
    resistanceLevel: '$0.6250',
  },
};
