import React from 'react';
import { mockSignals } from '../../mock/tradeHistory';
import { Radio, CheckCircle } from 'lucide-react';

export const SignalsTable: React.FC = () => {
  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Inbound TradingView Signals & Alerts ({mockSignals.length})
          </h3>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono">HMAC SIGNATURE VERIFIED</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono select-none">
          <thead>
            <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B] h-9">
              <th className="px-3 text-left">Signal ID</th>
              <th className="px-3 text-left">Source</th>
              <th className="px-3 text-left">Symbol</th>
              <th className="px-3 text-center">Timeframe</th>
              <th className="px-3 text-left">Event Type</th>
              <th className="px-3 text-right">Observed Price</th>
              <th className="px-3 text-center">Confidence</th>
              <th className="px-3 text-center">Status</th>
              <th className="px-3 text-right">Received At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {mockSignals.map((sig) => (
              <tr key={sig.id} className="hover:bg-[#28334A] transition-colors h-10">
                <td className="px-3 font-bold text-[#F8FAFC]">{sig.id}</td>
                <td className="px-3 text-[#94A3B8]">{sig.source}</td>
                <td className="px-3 font-semibold text-[#F8FAFC]">{sig.symbol}</td>
                <td className="px-3 text-center">
                  <span className="bg-[#1E293B] text-[#3B82F6] px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {sig.timeframe}
                  </span>
                </td>
                <td className="px-3 text-[#00C896] font-semibold">{sig.eventType}</td>
                <td className="px-3 text-right text-[#F8FAFC]">{sig.observedPrice}</td>
                <td className="px-3 text-center font-bold text-[#00C896]">{sig.confidence}%</td>
                <td className="px-3 text-center">
                  <span className="inline-flex items-center gap-1 bg-[#00C896]/15 text-[#00C896] px-2 py-0.5 rounded text-[10px] font-bold border border-[#00C896]/30">
                    <CheckCircle className="w-3 h-3" />
                    {sig.status}
                  </span>
                </td>
                <td className="px-3 text-right text-[#64748B] text-[11px]">{sig.receivedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
