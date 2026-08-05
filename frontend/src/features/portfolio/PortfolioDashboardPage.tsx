import React from 'react';
import { usePortfolioSummary } from '../../hooks/usePortfolioSummary';
import { useOrders } from '../../hooks/useOrders';
import { PortfolioCard } from '../../components/ui/PortfolioCard';
import { ValueDisplay } from '../../components/ui/ValueDisplay';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToastStore } from '../../store/useToastStore';
import { 
  Building2, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Scale, 
  Percent, 
  Clock, 
  Layers,
  AlertCircle
} from 'lucide-react';

export const PortfolioDashboardPage: React.FC = () => {
  const { data: summary, isLoading, isError, refetch, isFetching } = usePortfolioSummary();
  const { cancelOrder, isCancelling } = useOrders();
  const { addToast } = useToastStore();

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      addToast('Order Cancelled', `Order #${orderId} was successfully cancelled.`, 'info');
      void refetch();
    } catch (err: any) {
      addToast('Cancellation Failed', err?.message || 'Failed to cancel order.', 'danger');
    }
  };

  const wallet = summary?.wallet;
  const positions = summary?.positions;
  const orders = summary?.orders;
  const pnl = summary?.pnlBreakdown;
  const analytics = summary?.analytics;
  const funding = summary?.fundingAndFees;
  const connection = summary?.connection;

  const marginUtil = wallet?.marginUtilizationPercent || 0;
  const marginColor =
    marginUtil > 80 ? 'bg-rose-500' : marginUtil > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">
              Institutional Quant & HFT Portfolio Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Delta Exchange India Real-Time Synchronized Balances, Positions & Institutional Risk Analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            status={connection?.status || 'DISCONNECTED'}
            label={`DELTA: ${connection?.status || 'OFFLINE'}`}
          />
          <StatusBadge
            status={connection?.wsStatus || 'DISCONNECTED'}
            label={`WS: ${connection?.wsStatus || 'OFFLINE'}`}
          />
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-mono text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to synchronize with Delta Exchange India. Reconnecting background daemon...</span>
        </div>
      )}

      {/* Top Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioCard
          icon={<Building2 className="w-4 h-4 text-indigo-400" />}
          title="Total Net Equity"
          subtitle="Real-time Capital Valuation"
        >
          <div className="mt-1">
            <ValueDisplay
              value={wallet?.totalEquity}
              format="currency"
              size="xl"
              isLoading={isLoading}
              colorize
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Wallet Balance:</span>
            <ValueDisplay value={wallet?.walletBalance} format="currency" size="sm" isLoading={isLoading} />
          </div>
        </PortfolioCard>

        <PortfolioCard
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          title="Available Margin"
          subtitle="Free Trading Liquidity"
        >
          <div className="mt-1">
            <ValueDisplay
              value={wallet?.availableMargin}
              format="currency"
              size="xl"
              isLoading={isLoading}
              neutralColor="text-emerald-400"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Used Margin:</span>
            <ValueDisplay
              value={(wallet?.positionMargin || 0) + (wallet?.orderMargin || 0)}
              format="currency"
              size="sm"
              isLoading={isLoading}
            />
          </div>
        </PortfolioCard>

        <PortfolioCard
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
          title="Today's Realized + Unrealized"
          subtitle="24h Rolling Net Return"
        >
          <div className="mt-1">
            <ValueDisplay
              value={pnl?.today}
              format="currency"
              size="xl"
              colorize
              isLoading={isLoading}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Unrealized Open PnL:</span>
            <ValueDisplay
              value={positions?.totalUnrealizedPnl}
              format="currency"
              size="sm"
              colorize
              isLoading={isLoading}
            />
          </div>
        </PortfolioCard>

        <PortfolioCard
          icon={<Scale className="w-4 h-4 text-amber-400" />}
          title="Margin Utilization"
          subtitle="Risk Exposure Ratio"
        >
          <div className="mt-1 flex items-baseline justify-between">
            <ValueDisplay
              value={marginUtil}
              format="percent"
              size="xl"
              isLoading={isLoading}
              neutralColor="text-amber-400"
            />
            <span className="text-xs text-slate-500 font-mono">Max Safe: 50%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${marginColor}`}
              style={{ width: `${Math.min(100, Math.max(0, marginUtil))}%` }}
            />
          </div>
        </PortfolioCard>
      </div>

      {/* Middle Section: PnL Breakdown + Institutional Analytics + Tax Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PnL Breakdown */}
        <PortfolioCard
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          title="PnL Period Breakdown"
          subtitle="Computed directly by backend engine"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400">Today:</span>
              <ValueDisplay value={pnl?.today} format="currency" colorize isLoading={isLoading} />
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400">This Week:</span>
              <ValueDisplay value={pnl?.thisWeek} format="currency" colorize isLoading={isLoading} />
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400">This Month:</span>
              <ValueDisplay value={pnl?.thisMonth} format="currency" colorize isLoading={isLoading} />
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 font-medium">All-Time Lifetime:</span>
              <ValueDisplay value={pnl?.allTime} format="currency" colorize isLoading={isLoading} />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-400">Gross Profit / Loss:</span>
              <div className="flex gap-2">
                <ValueDisplay value={pnl?.grossProfit} format="currency" colorize isLoading={isLoading} />
                <span className="text-slate-600">/</span>
                <ValueDisplay value={pnl?.grossLoss ? -pnl.grossLoss : 0} format="currency" colorize isLoading={isLoading} />
              </div>
            </div>
          </div>
        </PortfolioCard>

        {/* Institutional Analytics */}
        <PortfolioCard
          icon={<Activity className="w-4 h-4 text-purple-400" />}
          title="Institutional Risk & Performance"
          subtitle="Quant metrics calculated from trade ledger"
        >
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Sharpe Ratio</span>
              <ValueDisplay value={analytics?.sharpeRatio} format="number" size="md" isLoading={isLoading} />
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Sortino Ratio</span>
              <ValueDisplay value={analytics?.sortinoRatio} format="number" size="md" isLoading={isLoading} />
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Win Rate</span>
              <ValueDisplay value={analytics?.winRatePercent} format="percent" size="md" isLoading={isLoading} />
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Profit Factor</span>
              <ValueDisplay value={analytics?.profitFactor} format="number" size="md" isLoading={isLoading} />
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Expectancy</span>
              <ValueDisplay value={analytics?.expectancy} format="number" size="md" colorize isLoading={isLoading} />
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Max Drawdown</span>
              <ValueDisplay value={analytics?.maxDrawdownPercent} format="percent" size="md" neutralColor="text-rose-400" isLoading={isLoading} />
            </div>
          </div>
        </PortfolioCard>

        {/* Funding & Indian Tax Obligations */}
        <PortfolioCard
          icon={<Percent className="w-4 h-4 text-amber-400" />}
          title="Funding, Fees & Tax Ledger"
          subtitle="Indian VDA 30% Tax & 1% TDS Estimator"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400">Total Fees Paid:</span>
              <ValueDisplay value={funding?.totalFeesPaid} format="currency" isLoading={isLoading} />
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400">Est. 24h Funding:</span>
              <ValueDisplay value={funding?.estimatedFunding24h} format="currency" colorize isLoading={isLoading} />
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-xs text-amber-400 font-medium">30% Flat VDA Tax Est:</span>
              <ValueDisplay value={funding?.taxObligationEstimate} format="currency" neutralColor="text-amber-400" isLoading={isLoading} />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-400">1% TDS Deducted Est:</span>
              <ValueDisplay value={funding?.tdsDeducted} format="currency" isLoading={isLoading} />
            </div>
          </div>
        </PortfolioCard>
      </div>

      {/* Bottom Section: Open Positions Table */}
      <PortfolioCard
        icon={<Layers className="w-4 h-4 text-indigo-400" />}
        title={`Live Open Positions (${positions?.count || 0})`}
        subtitle="Delta Exchange India Perpetual Contracts"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3 text-right">Size</th>
                <th className="py-2.5 px-3 text-right">Entry Price</th>
                <th className="py-2.5 px-3 text-right">Mark Price</th>
                <th className="py-2.5 px-3 text-right">Liq. Price</th>
                <th className="py-2.5 px-3 text-right">Margin</th>
                <th className="py-2.5 px-3 text-right">Unrealized PnL</th>
                <th className="py-2.5 px-3 text-right">ROE %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {positions?.items && positions.items.length > 0 ? (
                positions.items.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3 font-semibold text-white">{pos.symbol}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'buy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {pos.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">{pos.size}</td>
                    <td className="py-3 px-3 text-right">${pos.entryPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">${pos.markPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-rose-400">${pos.liquidationPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">${pos.margin.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">
                      <ValueDisplay value={pos.unrealizedPnl} format="currency" colorize />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <ValueDisplay value={pos.roePercent} format="percent" colorize />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    No open positions on Delta Exchange India. Capital is 100% idle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PortfolioCard>

      {/* Active Orders Table */}
      <PortfolioCard
        icon={<Clock className="w-4 h-4 text-cyan-400" />}
        title={`Pending & Working Orders (${orders?.openCount || 0})`}
        subtitle="Live Limit & Stop Orders on Exchange Books"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3 text-right">Size</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Stop Price</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {orders?.items && orders.items.length > 0 ? (
                orders.items.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3 text-slate-400">#{ord.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{ord.symbol}</td>
                    <td className="py-3 px-3 uppercase text-slate-300">{ord.orderType}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ord.side === 'buy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {ord.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">{ord.size}</td>
                    <td className="py-3 px-3 text-right">${ord.price.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {ord.stopPrice ? `$${ord.stopPrice.toLocaleString()}` : '--'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold border border-amber-500/30">
                        {ord.state}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => void handleCancelOrder(ord.id)}
                        disabled={isCancelling}
                        className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-[10px] transition font-mono disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    No active pending orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PortfolioCard>
    </div>
  );
};

export default PortfolioDashboardPage;
