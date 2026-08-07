import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { ResetChallengeInput } from '@algoapp/shared';

interface ChallengeConfigModalProps {
  onClose: () => void;
  onReset: (config: ResetChallengeInput) => void;
  isPending?: boolean;
}

export const ChallengeConfigModal: React.FC<ChallengeConfigModalProps> = ({ onClose, onReset, isPending }) => {
  const [config, setConfig] = useState<ResetChallengeInput>({
    totalTargetPercent: 10,
    maxDailyDrawdownPercent: 5,
    maxOverallDrawdownPercent: 10,
    minimumTradingDays: 5,
  } as ResetChallengeInput);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#1E293B] flex justify-between items-center bg-[#161D2A]">
          <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#38BDF8]" />
            Configure Challenge
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-[#94A3B8] font-semibold uppercase">Initial Balance ($)</label>
            <input
              type="number"
              name="initialBalance"
              value={config.initialBalance ?? ''}
              onChange={handleChange}
              placeholder="Leave empty for Delta Portfolio balance"
              className="w-full bg-[#1E293B] border border-[#334155] rounded-md px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[#94A3B8] font-semibold uppercase">Profit Target (%)</label>
              <input
                type="number"
                name="totalTargetPercent"
                value={config.totalTargetPercent}
                onChange={handleChange}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-md px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#94A3B8] font-semibold uppercase">Min Trading Days</label>
              <input
                type="number"
                name="minimumTradingDays"
                value={config.minimumTradingDays}
                onChange={handleChange}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-md px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[#94A3B8] font-semibold uppercase">Max Daily Drawdown (%)</label>
              <input
                type="number"
                name="maxDailyDrawdownPercent"
                value={config.maxDailyDrawdownPercent}
                onChange={handleChange}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-md px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#94A3B8] font-semibold uppercase">Max Total Drawdown (%)</label>
              <input
                type="number"
                name="maxOverallDrawdownPercent"
                value={config.maxOverallDrawdownPercent}
                onChange={handleChange}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-md px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#1E293B] flex justify-end gap-3 bg-[#161D2A]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onReset(config)}
            disabled={isPending}
            className="px-4 py-2 rounded-md text-sm font-medium bg-[#38BDF8] text-white hover:bg-[#0EA5E9] disabled:opacity-50 transition"
          >
            {isPending ? 'Starting...' : 'Start Fresh Challenge'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
