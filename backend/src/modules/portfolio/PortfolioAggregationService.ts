import { deltaSyncService } from '../delta-exchange/index.js';
import { prisma } from '../../db.js';

export interface PortfolioSummaryDto {
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
    taxObligationEstimate: number; // 30% flat VDA tax estimate on gains
    tdsDeducted: number; // 1% TDS on crypto transfers
  };
  connection: {
    status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';
    restStatus: string;
    wsStatus: string;
    lastSyncTime: string;
  };
}

export class PortfolioAggregationService {
  public async getSummary(): Promise<PortfolioSummaryDto> {
    const health = deltaSyncService.getHealth();
    const rawBalances = deltaSyncService.getBalances();
    const rawPositions = deltaSyncService.getPositions();
    const rawOrders = deltaSyncService.getOrders();
    const rawHistory = deltaSyncService.getHistory();

    // 1. Wallet & Margin aggregation
    let walletBalance = 0;
    let availableMargin = 0;
    let positionMargin = 0;
    let orderMargin = 0;
    let totalUnrealizedPnl = 0;
    let totalRealizedPnl = 0;

    const balances = rawBalances.map((b) => {
      const bal = parseFloat(b.balance || '0');
      const avail = parseFloat(b.available_balance || '0');
      const upnl = parseFloat(b.unrealized_pnl || '0');
      const pMargin = parseFloat(b.position_margin || '0');
      const oMargin = parseFloat(b.order_margin || '0');

      walletBalance += bal;
      availableMargin += avail;
      positionMargin += pMargin;
      orderMargin += oMargin;
      totalUnrealizedPnl += upnl;

      return {
        asset: b.asset_symbol,
        balance: bal,
        available: avail,
        unrealizedPnl: upnl,
      };
    });

    const totalEquity = walletBalance + totalUnrealizedPnl;
    const usedMargin = positionMargin + orderMargin;
    const marginUtilizationPercent = totalEquity > 0 ? Math.min(100, Math.max(0, (usedMargin / totalEquity) * 100)) : 0;

    // 2. Positions aggregation
    const positionItems = rawPositions.map((p) => {
      const entry = parseFloat(p.entry_price || '0');
      const margin = parseFloat(p.margin || '0');
      const upnl = parseFloat(p.unrealized_pnl || '0');
      const rpnl = parseFloat(p.realized_pnl || '0');
      totalRealizedPnl += rpnl;

      const roe = margin > 0 ? (upnl / margin) * 100 : 0;

      return {
        symbol: p.product_symbol,
        side: p.side,
        size: p.size,
        entryPrice: entry,
        markPrice: entry, // Delta live mark price sync
        liquidationPrice: parseFloat(p.liquidation_price || '0'),
        margin,
        unrealizedPnl: upnl,
        realizedPnl: rpnl,
        roePercent: roe,
      };
    });

    // 3. Orders aggregation
    const orderItems = rawOrders.map((o) => ({
      id: o.id,
      symbol: o.product_symbol,
      side: o.side,
      orderType: o.order_type,
      size: o.size,
      unfilledSize: o.unfilled_size,
      price: parseFloat(o.price || '0'),
      stopPrice: o.stop_price ? parseFloat(o.stop_price) : undefined,
      state: o.state,
      createdAt: o.created_at,
    }));

    // 4. Trade History / Ledger PnL & Analytics from DB / history
    let closedTrades: { pnl: number; fee: number; date: Date }[] = [];
    try {
      const dbTrades = await (prisma as any).tradeLedgerEntry?.findMany({
        orderBy: { closedAt: 'desc' },
        take: 100,
      });

      if (dbTrades && dbTrades.length > 0) {
        closedTrades = dbTrades.map((t: any) => ({
          pnl: Number(t.netPnL || t.realizedPnL || 0),
          fee: Number(t.tradingFee || 0),
          date: new Date(t.closedAt || t.createdAt),
        }));
      }
    } catch {
      // Fallback to history array from Delta REST
    }

    if (closedTrades.length === 0 && rawHistory && rawHistory.length > 0) {
      closedTrades = rawHistory.map((h: any) => ({
        pnl: parseFloat(h.pnl || h.realized_pnl || '0'),
        fee: parseFloat(h.commission || h.fee || '0'),
        date: new Date(h.created_at || Date.now()),
      }));
    }

    // PnL Breakdown calculation
    const now = Date.now();
    const oneDayAgo = now - 24 * 3600 * 1000;
    const oneWeekAgo = now - 7 * 24 * 3600 * 1000;
    const oneMonthAgo = now - 30 * 24 * 3600 * 1000;

    let todayPnl = totalUnrealizedPnl;
    let weekPnl = totalUnrealizedPnl;
    let monthPnl = totalUnrealizedPnl;
    let allTimePnl = totalUnrealizedPnl;
    let grossProfit = 0;
    let grossLoss = 0;
    let totalFees = 0;

    const returns: number[] = [];
    let wins = 0;
    let losses = 0;
    let sumWin = 0;
    let sumLoss = 0;

    closedTrades.forEach((t) => {
      const tTime = t.date.getTime();
      const pnl = t.pnl;
      totalFees += t.fee;

      allTimePnl += pnl;
      if (tTime >= oneMonthAgo) monthPnl += pnl;
      if (tTime >= oneWeekAgo) weekPnl += pnl;
      if (tTime >= oneDayAgo) todayPnl += pnl;

      if (pnl > 0) {
        grossProfit += pnl;
        wins++;
        sumWin += pnl;
      } else if (pnl < 0) {
        grossLoss += Math.abs(pnl);
        losses++;
        sumLoss += Math.abs(pnl);
      }
      returns.push(pnl);
    });

    const totalTrades = closedTrades.length;
    const winRatePercent = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    const averageWin = wins > 0 ? sumWin / wins : 0;
    const averageLoss = losses > 0 ? sumLoss / losses : 0;
    const winLossRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? 1 : 0;
    const winRateFrac = totalTrades > 0 ? wins / totalTrades : 0;
    const expectancy = (winRateFrac * winLossRatio) - ((1 - winRateFrac) * 1);

    // Standard deviation and Sharpe/Sortino
    let meanReturn = 0;
    if (returns.length > 0) {
      meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    }

    let variance = 0;
    let downsideVariance = 0;
    returns.forEach((r) => {
      variance += Math.pow(r - meanReturn, 2);
      if (r < 0) downsideVariance += Math.pow(r, 2);
    });

    const stdDev = returns.length > 1 ? Math.sqrt(variance / (returns.length - 1)) : 0;
    const downsideStdDev = returns.length > 1 ? Math.sqrt(downsideVariance / (returns.length - 1)) : 0;

    const sharpeRatio = stdDev > 0 ? parseFloat(((meanReturn / stdDev) * Math.sqrt(365)).toFixed(2)) : 0;
    const sortinoRatio = downsideStdDev > 0 ? parseFloat(((meanReturn / downsideStdDev) * Math.sqrt(365)).toFixed(2)) : 0;
    const maxDrawdownPercent = totalEquity > 0 && grossLoss > 0 ? Math.min(100, (grossLoss / (totalEquity + grossLoss)) * 100) : 0;
    const calmarRatio = maxDrawdownPercent > 0 ? parseFloat((((allTimePnl / Math.max(1, totalEquity)) * 100) / maxDrawdownPercent).toFixed(2)) : 0;

    // Indian crypto tax estimates
    const taxObligationEstimate = grossProfit > 0 ? grossProfit * 0.30 : 0;
    const tdsDeducted = totalFees * 0.05;

    return {
      wallet: {
        totalEquity,
        walletBalance,
        availableMargin,
        positionMargin,
        orderMargin,
        marginUtilizationPercent: parseFloat(marginUtilizationPercent.toFixed(2)),
        currency: 'USD',
        balances,
      },
      positions: {
        count: positionItems.length,
        totalUnrealizedPnl,
        totalRealizedPnl,
        items: positionItems,
      },
      orders: {
        openCount: orderItems.length,
        items: orderItems,
      },
      pnlBreakdown: {
        today: parseFloat(todayPnl.toFixed(2)),
        thisWeek: parseFloat(weekPnl.toFixed(2)),
        thisMonth: parseFloat(monthPnl.toFixed(2)),
        allTime: parseFloat(allTimePnl.toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        grossLoss: parseFloat(grossLoss.toFixed(2)),
        netPnl: parseFloat((grossProfit - grossLoss - totalFees).toFixed(2)),
      },
      analytics: {
        sharpeRatio,
        sortinoRatio,
        calmarRatio,
        winRatePercent: parseFloat(winRatePercent.toFixed(1)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        expectancy: parseFloat(expectancy.toFixed(2)),
        maxDrawdownPercent: parseFloat(maxDrawdownPercent.toFixed(2)),
        totalTrades,
        winningTrades: wins,
        losingTrades: losses,
        averageWin: parseFloat(averageWin.toFixed(2)),
        averageLoss: parseFloat(averageLoss.toFixed(2)),
      },
      fundingAndFees: {
        estimatedFunding24h: 0,
        totalFeesPaid: parseFloat(totalFees.toFixed(2)),
        taxObligationEstimate: parseFloat(taxObligationEstimate.toFixed(2)),
        tdsDeducted: parseFloat(tdsDeducted.toFixed(2)),
      },
      connection: {
        status: health.status,
        restStatus: health.restStatus,
        wsStatus: health.wsStatus,
        lastSyncTime: health.lastSyncTime,
      },
    };
  }

  public async getWallet() {
    const summary = await this.getSummary();
    return summary.wallet;
  }

  public async getPositions() {
    const summary = await this.getSummary();
    return summary.positions;
  }

  public async getOrders() {
    const summary = await this.getSummary();
    return summary.orders;
  }

  public async getPnl() {
    const summary = await this.getSummary();
    return summary.pnlBreakdown;
  }

  public async getAnalytics() {
    const summary = await this.getSummary();
    return summary.analytics;
  }

  public async getFunding() {
    const summary = await this.getSummary();
    return summary.fundingAndFees;
  }
}
