import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api.js';

export interface PortfolioSummaryData {
  wallet: {
    totalEquity: number;
    walletBalance: number;
    availableMargin: number;
    positionMargin: number;
    orderMargin: number;
    marginUtilizationPercent: number;
    currency: string;
    balances: {
      asset: string;
      balance: number;
      available: number;
      unrealizedPnl: number;
    }[];
  };
  positions: {
    count: number;
    totalUnrealizedPnl: number;
    totalRealizedPnl: number;
    items: {
      symbol: string;
      side: 'buy' | 'sell';
      size: number;
      entryPrice: number;
      markPrice: number;
      liquidationPrice: number;
      margin: number;
      unrealizedPnl: number;
      realizedPnl: number;
      roePercent: number;
    }[];
  };
  orders: {
    openCount: number;
    items: {
      id: number;
      symbol: string;
      side: 'buy' | 'sell';
      orderType: string;
      size: number;
      unfilledSize: number;
      price: number;
      stopPrice?: number | undefined;
      state: string;
      createdAt: string;
    }[];
  };
  pnlBreakdown: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
    grossProfit: number;
    grossLoss: number;
    netPnl: number;
  };
  analytics: {
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    winRatePercent: number;
    profitFactor: number;
    expectancy: number;
    maxDrawdownPercent: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageWin: number;
    averageLoss: number;
  };
  fundingAndFees: {
    estimatedFunding24h: number;
    totalFeesPaid: number;
    taxObligationEstimate: number;
    tdsDeducted: number;
  };
  connection: {
    status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';
    restStatus: string;
    wsStatus: string;
    lastSyncTime: string;
  };
}

export function usePortfolioSummary() {
  return useQuery<PortfolioSummaryData>({
    queryKey: ['portfolio', 'summary'],
    queryFn: async () => {
      const res = await apiClient.get('/portfolio/summary');
      return res.data.data;
    },
    refetchInterval: 3000,
    staleTime: 2000,
  });
}
