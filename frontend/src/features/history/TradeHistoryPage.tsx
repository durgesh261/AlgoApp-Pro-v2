import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { tradeAccountingApi, paperTradingApi } from '../../services/api';
import { History, RefreshCw } from 'lucide-react';

import { TradeLedgerEntryDto } from '@algoapp/shared';

export const TradeHistoryPage: React.FC = () => {
  const { data: ledgerData, isLoading, refetch } = useQuery({
    queryKey: ['tradeLedger'],
    queryFn: () => tradeAccountingApi.getLedger(),
  });

  const { data: closedPositionsData } = useQuery({
    queryKey: ['closedPositions'],
    queryFn: paperTradingApi.getClosedPositions,
  });

  const ledger: TradeLedgerEntryDto[] = ledgerData?.data || [];
  const closedPositions = closedPositionsData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-[1600px] mx-auto pb-6 font-mono select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <History className="w-6 h-6 text-[#F59E0B]" />
          <div>
            <h1 className="text-lg font-bold text-white uppercase">Historical Trade Ledger</h1>
            <p className="text-xs text-[#94A3B8]">Audit trail of closed trades, execution latency, gross PnL, fees, and net profit.</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#28334A] text-white text-xs font-bold rounded-lg border border-[#334155] flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH HISTORY</span>
        </button>
      </div>

      {/* Trade History Table */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 text-xs">
          <span className="font-bold text-white">Closed Trades ({ledger.length > 0 ? ledger.length : closedPositions.length})</span>
        </div>

        {ledger.length === 0 && closedPositions.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8] text-xs">
            No trade history records found.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                  <th className="py-2.5 px-3">Trade ID</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3">Entry / Exit</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Gross PnL</th>
                  <th className="py-2.5 px-3">Fees</th>
                  <th className="py-2.5 px-3">Net PnL</th>
                  <th className="py-2.5 px-3">Sync Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length > 0 ? (
                  ledger.map((entry) => (
                    <tr key={entry.tradeId} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14]">
                      <td className="py-3 px-3 text-white font-bold">{entry.tradeId}</td>
                      <td className="py-3 px-3 text-[#3B82F6] font-bold">{entry.symbol}</td>
                      <td className={`py-3 px-3 font-bold ${(entry.side as string) === 'BUY' || (entry.side as string) === 'LONG' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {entry.side}
                      </td>
                      <td className="py-3 px-3 text-white">${entry.entryPrice} → ${entry.exitPrice}</td>
                      <td className="py-3 px-3 text-white">{entry.quantity}</td>
                      <td className={`py-3 px-3 font-bold ${entry.grossPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {entry.grossPnL >= 0 ? '+' : ''}${entry.grossPnL.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-[#F59E0B]">${entry.tradingFee.toFixed(2)}</td>
                      <td className={`py-3 px-3 font-bold ${entry.netPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {entry.netPnL >= 0 ? '+' : ''}${entry.netPnL.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-[#00C896]/20 text-[#00C896] px-2 py-0.5 rounded text-[10px] font-bold">
                          {entry.syncStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  closedPositions.map((pos) => (
                    <tr key={pos.id} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14]">
                      <td className="py-3 px-3 text-white font-bold">{pos.id}</td>
                      <td className="py-3 px-3 text-[#3B82F6] font-bold">{pos.symbol}</td>
                      <td className={`py-3 px-3 font-bold ${(pos.side as string) === 'BUY' || (pos.side as string) === 'LONG' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.side}
                      </td>
                      <td className="py-3 px-3 text-white">${pos.entryPrice} → ${pos.markPrice}</td>
                      <td className="py-3 px-3 text-white">{pos.quantity}</td>
                      <td className={`py-3 px-3 font-bold ${pos.realizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.realizedPnL >= 0 ? '+' : ''}${pos.realizedPnL.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-[#F59E0B]">$0.00</td>
                      <td className={`py-3 px-3 font-bold ${pos.realizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.realizedPnL >= 0 ? '+' : ''}${pos.realizedPnL.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-[#00C896]/20 text-[#00C896] px-2 py-0.5 rounded text-[10px] font-bold">
                          CLOSED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
