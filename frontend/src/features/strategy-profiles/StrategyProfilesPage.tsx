import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { strategyProfileApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { Sliders, CheckCircle2, RefreshCw } from 'lucide-react';

export const StrategyProfilesPage: React.FC = () => {
  const { activeSymbol, activeProfileId, setActiveProfileId } = useTerminalStore();

  const { data: profilesData, isLoading, refetch } = useQuery({
    queryKey: ['strategyProfiles'],
    queryFn: strategyProfileApi.getProfiles,
  });

  const profiles = profilesData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-[1600px] mx-auto pb-6 font-mono select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <Sliders className="w-6 h-6 text-[#3B82F6]" />
          <div>
            <h1 className="text-lg font-bold text-white uppercase">Strategy Profiles Lab — {activeSymbol}</h1>
            <p className="text-xs text-[#94A3B8]">Select and activate strategy configurations for indicator parameters, risk rules, and decision gates.</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#28334A] text-white text-xs font-bold rounded-lg border border-[#334155] flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH PROFILES</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const isSelected = activeProfileId === profile.id;
          return (
            <div
              key={profile.id}
              onClick={() => setActiveProfileId(profile.id)}
              className={`bg-[#161D2A] border p-4 rounded-xl space-y-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#3B82F6] ring-1 ring-[#3B82F6] bg-[#161D2A]'
                  : 'border-[#1E293B] hover:border-[#334155]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                  {activeSymbol} ({profile.timeframe})
                </span>
                {isSelected && (
                  <span className="flex items-center space-x-1 text-[10px] text-[#00C896] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE PROFILE</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">{profile.description}</p>
              </div>

              <div className="pt-2 border-t border-[#1E293B] flex justify-between text-[11px] text-[#94A3B8]">
                <span>Version: <strong className="text-white">{profile.version}</strong></span>
                <span>Status: <strong className="text-[#00C896]">ACTIVE</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
