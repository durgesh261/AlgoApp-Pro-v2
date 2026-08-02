import React from 'react';
import { mockTradeHistory } from '../../mock/tradeHistory';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const TradeHistoryTable: React.FC = () => {
  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Historical Executed Fills ({mockTradeHistory.length})
          </h3>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono">ALL FILLS RECONCILED</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono select-none">
          <thead>
            <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B] h-9">
              <th className="px-3 text-left">Fill ID</th>
              <th className="px-3 text-left">Order ID</th>
              <th className="px-3 text-left">Symbol</th>
              <th className="px-3 text-left">Side</th>
              <th className="px-3 text-right">Fill Price</th>
              <th className="px-3 text-right">Quantity</th>
              <th className="px-3 text-right">Realized P&L</th>
              <th className="px-3 text-right">Fee</th>
              <th className="px-3 text-left">Strategy Attributed</th>
              <th className="px-3 text-right">Executed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {mockTradeHistory.map((trade) => (
              <tr key={trade.id} className="hover:bg-[#28334A] transition-colors h-10">
                <td className="px-3 font-bold text-[#F8FAFC]">{trade.id}</td>
                <td className="px-3 text-[#94A3B8]">{trade.orderId}</td>
                <td className="px-3 font-semibold text-[#F8FAFC]">{trade.symbol}</td>
                <td className="px-3">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      trade.side === 'BUY'
                        ? 'bg-[#00C896]/15 text-[#00C896]'
                        : 'bg-[#F6465D]/15 text-[#F6465D]'
                    }`}
                  >
                    {trade.side === 'BUY' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {trade.side}
                  </span>
                </td>
                <td className="px-3 text-right text-[#F8FAFC]">{trade.fillPrice}</td>
                <td className="px-3 text-right text-[#94A3B8]">{trade.quantity}</td>
                <td
                  className={`px-3 text-right font-bold ${
                    trade.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'
                  }`}
                >
                  {trade.realizedPnL}
                </td>
                <td className="px-3 text-right text-[#94A3B8]">{trade.fee}</td>
                <td className="px-3 text-[#3B82F6] font-medium">{trade.strategyName}</td>
                <td className="px-3 text-right text-[#64748B] text-[11px]">{trade.executedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
