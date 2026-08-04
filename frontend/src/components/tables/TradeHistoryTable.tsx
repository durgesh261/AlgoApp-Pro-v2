import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tradeAccountingApi, paperTradingApi } from '../../services/api';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TradeLedgerEntryDto, PaperOrderDto } from '@algoapp/shared';

export const TradeHistoryTable: React.FC = () => {
  const { data: ledgerData, isLoading: isLoadingLedger } = useQuery({
    queryKey: ['tradeLedger'],
    queryFn: tradeAccountingApi.getLedger,
    refetchInterval: 5000,
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['paperOrders'],
    queryFn: paperTradingApi.getOrders,
    refetchInterval: 5000,
  });

  const ledgerEntries: TradeLedgerEntryDto[] = ledgerData?.data || [];
  const paperOrders: PaperOrderDto[] = ordersData?.data || [];

  const isLoading = isLoadingLedger || isLoadingOrders;

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Historical Executed Fills ({ledgerEntries.length > 0 ? ledgerEntries.length : paperOrders.length})
          </h3>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono">LIVE RECONCILED</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B] h-9">
              <th className="px-3 text-left">Fill / Order ID</th>
              <th className="px-3 text-left">Symbol</th>
              <th className="px-3 text-left">Side</th>
              <th className="px-3 text-right">Fill Price</th>
              <th className="px-3 text-right">Quantity</th>
              <th className="px-3 text-right">Realized P&L</th>
              <th className="px-3 text-right">Fee</th>
              <th className="px-3 text-left">Status</th>
              <th className="px-3 text-right">Executed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-[#94A3B8]">Loading trade history…</td>
              </tr>
            ) : ledgerEntries.length === 0 && paperOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-[#94A3B8]">No data available.</td>
              </tr>
            ) : ledgerEntries.length > 0 ? (
              ledgerEntries.map((trade) => (
                <tr key={trade.id} className="hover:bg-[#28334A] transition-colors h-10">
                  <td className="px-3 font-bold text-[#F8FAFC]">{trade.tradeId || trade.id.slice(0, 10)}</td>
                  <td className="px-3 font-semibold text-[#F8FAFC]">{trade.symbol}</td>
                  <td className="px-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      trade.side === 'LONG' || (trade.side as string) === 'BUY'
                        ? 'bg-[#00C896]/15 text-[#00C896]'
                        : 'bg-[#F6465D]/15 text-[#F6465D]'
                    }`}>
                      {trade.side === 'LONG' || (trade.side as string) === 'BUY' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-3 text-right text-[#F8FAFC] font-mono-tabular">${trade.entryPrice.toFixed(2)}</td>
                  <td className="px-3 text-right text-[#94A3B8] font-mono-tabular">{trade.quantity}</td>
                  <td className={`px-3 text-right font-bold font-mono-tabular ${trade.netPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                    {trade.netPnL >= 0 ? '+' : ''}${trade.netPnL.toFixed(2)}
                  </td>
                  <td className="px-3 text-right text-[#94A3B8] font-mono-tabular">${trade.tradingFee.toFixed(2)}</td>
                  <td className="px-3 text-[#3B82F6] font-semibold">{trade.resultStatus}</td>
                  <td className="px-3 text-right text-[#94A3B8] font-mono-tabular text-[11px]">
                    {new Date(trade.executedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            ) : (
              paperOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#28334A] transition-colors h-10">
                  <td className="px-3 font-bold text-[#F8FAFC]">{order.id.slice(0, 10)}</td>
                  <td className="px-3 font-semibold text-[#F8FAFC]">{order.symbol}</td>
                  <td className="px-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      order.side === 'BUY' ? 'bg-[#00C896]/15 text-[#00C896]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                    }`}>
                      {order.side === 'BUY' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {order.side}
                    </span>
                  </td>
                  <td className="px-3 text-right text-[#F8FAFC] font-mono-tabular">${order.price ? order.price.toFixed(2) : 'MARKET'}</td>
                  <td className="px-3 text-right text-[#94A3B8] font-mono-tabular">{order.quantity}</td>
                  <td className="px-3 text-right text-[#94A3B8] font-mono-tabular">$0.00</td>
                  <td className="px-3 text-right text-[#94A3B8] font-mono-tabular">$0.00</td>
                  <td className="px-3 text-[#3B82F6] font-semibold">{order.status}</td>
                  <td className="px-3 text-right text-[#94A3B8] font-mono-tabular text-[11px]">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
