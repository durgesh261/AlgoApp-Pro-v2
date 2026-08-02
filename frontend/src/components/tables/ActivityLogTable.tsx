import React from 'react';
import { mockActivities } from '../../mock/tradeHistory';
import { ShieldCheck, Activity } from 'lucide-react';

export const ActivityLogTable: React.FC = () => {
  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#00C896]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            System Audit & Risk Activity Log ({mockActivities.length})
          </h3>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono">APPEND-ONLY AUDIT STREAM</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono select-none">
          <thead>
            <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B] h-9">
              <th className="px-3 text-left">Event ID</th>
              <th className="px-3 text-left">Category</th>
              <th className="px-3 text-left">Action</th>
              <th className="px-3 text-left">Audit Details</th>
              <th className="px-3 text-center">Status</th>
              <th className="px-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {mockActivities.map((act) => (
              <tr key={act.id} className="hover:bg-[#28334A] transition-colors h-10">
                <td className="px-3 font-bold text-[#F8FAFC]">{act.id}</td>
                <td className="px-3">
                  <span className="bg-[#1E293B] text-[#3B82F6] px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {act.category}
                  </span>
                </td>
                <td className="px-3 font-semibold text-[#F8FAFC]">{act.action}</td>
                <td className="px-3 text-[#94A3B8] max-w-xs truncate">{act.details}</td>
                <td className="px-3 text-center">
                  <span className="inline-flex items-center gap-1 bg-[#00C896]/15 text-[#00C896] px-2 py-0.5 rounded text-[10px] font-bold border border-[#00C896]/30">
                    <ShieldCheck className="w-3 h-3" />
                    {act.status}
                  </span>
                </td>
                <td className="px-3 text-right text-[#64748B] text-[11px]">{act.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
