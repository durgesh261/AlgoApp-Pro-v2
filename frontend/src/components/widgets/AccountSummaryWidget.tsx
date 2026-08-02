import React from 'react';
import { DollarSign, Shield, ArrowUpRight } from 'lucide-react';

export const AccountSummaryWidget: React.FC = () => {
  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#00C896]" />
          Account & Risk Utilization Summary
        </h3>
        <span className="text-[10px] bg-[#00C896]/10 text-[#00C896] px-2 py-0.5 rounded font-mono font-semibold border border-[#00C896]/20">
          HEALTHY MARGIN
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[11px] text-[#94A3B8] block">Total Account Equity</span>
          <div className="text-xl font-bold text-[#F8FAFC] mt-0.5">$11,520.00</div>
          <span className="text-[10px] text-[#00C896] flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +15.20% Growth
          </span>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[11px] text-[#94A3B8] block">Unrealized P&L</span>
          <div className="text-xl font-bold text-[#00C896] mt-0.5">+$1,116.00</div>
          <span className="text-[10px] text-[#00C896]">4 Open Positions</span>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[11px] text-[#94A3B8] block">Realized P&L (Today)</span>
          <div className="text-xl font-bold text-[#00C896] mt-0.5">+$620.00</div>
          <span className="text-[10px] text-[#94A3B8]">Fees Paid: $7.06</span>
        </div>
      </div>

      {/* Risk Utilization Progress Bar */}
      <div className="space-y-1.5 font-mono">
        <div className="flex justify-between text-xs">
          <span className="text-[#94A3B8] flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
            Risk Capacity Used
          </span>
          <span className="text-[#F8FAFC] font-bold">34.5% / 100.0%</span>
        </div>
        <div className="h-2 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-[#1E293B]">
          <div
            className="h-full bg-gradient-to-r from-[#3B82F6] to-[#00C896] rounded-full"
            style={{ width: '34.5%' }}
          />
        </div>
      </div>
    </div>
  );
};
