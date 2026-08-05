import { DeltaSyncService } from './DeltaSyncService.js';

export interface DeltaPortfolioSummary {
  totalEquity: number;
  availableMargin: number;
  positionMargin: number;
  orderMargin: number;
  unrealizedPnl: number;
  realizedPnl: number;
  todayPnl: number;
  openPositionsCount: number;
  openOrdersCount: number;
  balances: {
    asset: string;
    balance: number;
    available: number;
    unrealizedPnl: number;
  }[];
}

export class DeltaPortfolioService {
  constructor(private syncService: DeltaSyncService) {}

  public getPortfolio(): DeltaPortfolioSummary {
    const rawBalances = this.syncService.getBalances();
    const rawPositions = this.syncService.getPositions();
    const rawOrders = this.syncService.getOrders();

    let totalEquity = 0;
    let availableMargin = 0;
    let positionMargin = 0;
    let orderMargin = 0;
    let unrealizedPnl = 0;
    let realizedPnl = 0;

    const balances = rawBalances.map((b) => {
      const bal = parseFloat(b.balance || '0');
      const avail = parseFloat(b.available_balance || '0');
      const upnl = parseFloat(b.unrealized_pnl || '0');
      const pMargin = parseFloat(b.position_margin || '0');
      const oMargin = parseFloat(b.order_margin || '0');

      totalEquity += bal;
      availableMargin += avail;
      positionMargin += pMargin;
      orderMargin += oMargin;
      unrealizedPnl += upnl;

      return {
        asset: b.asset_symbol,
        balance: bal,
        available: avail,
        unrealizedPnl: upnl,
      };
    });

    rawPositions.forEach((p) => {
      realizedPnl += parseFloat(p.realized_pnl || '0');
    });

    return {
      totalEquity,
      availableMargin,
      positionMargin,
      orderMargin,
      unrealizedPnl,
      realizedPnl,
      todayPnl: unrealizedPnl + realizedPnl,
      openPositionsCount: rawPositions.length,
      openOrdersCount: rawOrders.length,
      balances,
    };
  }
}
