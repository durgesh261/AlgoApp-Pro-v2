import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sliders, ShieldCheck, AlertOctagon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [killSwitchArmed, setKillSwitchArmed] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6"
    >
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#3B82F6]" />
            Single-User Terminal Settings & Emergency Controls
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            System defaults, risk parameters, API rate limits, and emergency kill-switch controls.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono text-[#94A3B8]">
          <Sliders className="w-4 h-4 text-[#3B82F6]" />
          <span>SETTINGS MODULE</span>
        </div>
      </div>

      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#F6465D]/10 border border-[#F6465D]/30 flex items-center justify-center text-[#F6465D]">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC] font-mono">Emergency Platform Kill Switch</h2>
              <p className="text-xs text-[#94A3B8]">
                Instantly halts all automated order placement, cancels pending limit orders, and forces fail-closed risk safety mode.
              </p>
            </div>
          </div>

          <button
            onClick={() => setKillSwitchArmed(!killSwitchArmed)}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
              killSwitchArmed
                ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/40 hover:bg-[#00C896]/25'
                : 'bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/40 hover:bg-[#F6465D]/25'
            }`}
          >
            {killSwitchArmed ? 'ARMED & SAFEGUARDED' : 'HALTED / DISARMED'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-[#94A3B8] font-medium">Default Reporting Currency</label>
            <input
              type="text"
              readOnly
              value="USD ($)"
              className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-2 text-[#F8FAFC] font-mono outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#94A3B8] font-medium">System Execution Mode</label>
            <input
              type="text"
              readOnly
              value="DESKTOP TERMINAL (SINGLE-USER)"
              className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-2 text-[#F8FAFC] font-mono outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#94A3B8] font-medium">Signal Expiry Threshold</label>
            <input
              type="text"
              readOnly
              value="60 Seconds"
              className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-2 text-[#F8FAFC] font-mono outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#94A3B8] font-medium">Correlation ID Header</label>
            <div className="bg-[#0B0E14] border border-[#334155] rounded px-3 py-2 flex items-center justify-between text-[#00C896] font-mono font-semibold">
              <span>X-Request-Id (MANDATORY)</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
