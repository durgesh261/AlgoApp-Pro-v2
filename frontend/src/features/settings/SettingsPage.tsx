import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Sliders, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#3B82F6]" />
            System Settings & Controls
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Single-user environment defaults, currency parameters, and platform kill-switch settings.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono text-[#94A3B8]">
          <Sliders className="w-4 h-4 text-[#3B82F6]" />
          <span>SETTINGS SYSTEM</span>
        </div>
      </div>

      <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2 border-b border-[#1E293B] pb-2">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          Single-User Configuration Baseline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
            <label className="text-[#94A3B8] font-medium">Platform Timezone</label>
            <input
              type="text"
              readOnly
              value="UTC (Coordinated Universal Time)"
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
            <label className="text-[#94A3B8] font-medium">Emergency Kill Switch</label>
            <div className="bg-[#0B0E14] border border-[#334155] rounded px-3 py-2 flex items-center justify-between text-[#00C896] font-mono font-semibold">
              <span>ARMED & READY</span>
              <span className="w-2 h-2 rounded-full bg-[#00C896]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
