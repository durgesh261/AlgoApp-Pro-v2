import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { paperTradingApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PaperPositionDto } from '@algoapp/shared';

export const OpenTradesTable: React.FC = () => {
  const { activeSymbol } = useTerminalStore();

  const { data: positionsData, isLoading } = useQuery({
    queryKey: ['paperPositions'],
    queryFn: paperTradingApi.getPositions,
    refetchInterval: 5000,
  });

  const positions: PaperPositionDto[] = positionsData?.data || [];
  const filtered = activeSymbol === 'ALL' ? positions : positions.filter(p => p.symbol === activeSymbol);

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Active Open Positions ({filtered.length})
          </h3>
        </div>
        <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-0.5 rounded font-mono font-semibold border border-[#3B82F6]/20">
          FILTERED BY: {activeSymbol}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono select-none">
          <thead>
            <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B] h-9">
              <th className="px-3 text-left">Position ID</th>
              <th className="px-3 text-left">Symbol</th>
              <th className="px-3 text-left">Side</th>
              <th className="px-3 text-right">Entry Price</th>
              <th className="px-3 text-right">Mark Price</th>
              <th className="px-3 text-right">Quantity</th>
              <th className="px-3 text-right">Notional</th>
              <th className="px-3 text-right">Unrealized P&L</th>
              <th className="px-3 text-center">Leverage</th>
              <th className="px-3 text-right">Opened At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-3 py-4 text-center text-[#94A3B8]">Loading positions…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-4 text-center text-[#94A3B8]">No open positions. No data available.</td>
              </tr>
            ) : filtered.map((pos) => (
              <tr key={pos.id} className="hover:bg-[#28334A] transition-colors h-10">
                <td className="px-3 font-bold text-[#F8FAFC]">{pos.id.slice(0, 12)}</td>
                <td className="px-3 text-[#F8FAFC] font-semibold">{pos.symbol}</td>
                <td className="px-3">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    pos.side === 'LONG'
                      ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30'
                      : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                  }`}>
                    {pos.side === 'LONG' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {pos.side}
                  </span>
                </td>
                <td className="px-3 text-right text-[#F8FAFC]">${pos.entryPrice.toFixed(2)}</td>
                <td className="px-3 text-right text-[#F8FAFC]">${pos.markPrice.toFixed(2)}</td>
                <td className="px-3 text-right text-[#94A3B8]">{pos.quantity}</td>
                <td className="px-3 text-right text-[#94A3B8]">${pos.notionalValue.toFixed(2)}</td>
                <td className={`px-3 text-right font-bold ${pos.unrealizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                  {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(4)}
                </td>
                <td className="px-3 text-center">
                  <span className="bg-[#1E293B] text-[#94A3B8] px-1.5 py-0.5 rounded text-[10px]">
                    {pos.leverage}x
                  </span>
                </td>
                <td className="px-3 text-right text-[#64748B] text-[11px]">{new Date(pos.openedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
