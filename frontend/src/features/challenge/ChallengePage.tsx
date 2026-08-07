import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { tradeAccountingApi } from '../../services/api';
import { ChallengeSummaryWidget } from '../../components/widgets/ChallengeSummaryWidget';
import { ChallengeProgressChart } from '../../components/charts/ChallengeProgressChart';
import { Trophy, Award, ShieldCheck, Settings } from 'lucide-react';
import { ChallengeStateDto, ResetChallengeInput } from '@algoapp/shared';
import { ChallengeConfigModal } from '../../components/ui/ChallengeConfigModal';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export const ChallengePage: React.FC = () => {
  const { data: challengeData } = useQuery({
    queryKey: ['challengeState'],
    queryFn: tradeAccountingApi.getChallenge,
    refetchInterval: 5000,
  });

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetChallengeMutation = useMutation({
    mutationFn: (input: ResetChallengeInput) => tradeAccountingApi.resetChallenge(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeState'] });
      queryClient.invalidateQueries({ queryKey: ['walletState'] });
      queryClient.invalidateQueries({ queryKey: ['tradeAccountingSummary'] });
      setIsModalOpen(false);
    },
  });

  const challenge: ChallengeStateDto | undefined = challengeData?.data;

  const initialBalance = challenge?.initialBalance ?? 0;
  const targetPercent = challenge?.totalTargetPercent ?? 10.0;
  const targetProfitUsd = initialBalance * (targetPercent / 100);
  
  const dailyDrawdownPercent = challenge?.maxDailyDrawdownPercent ?? 5.0;
  const maxOverallDrawdownPercent = challenge?.maxOverallDrawdownPercent ?? 10.0;
  
  const dailyDrawdownUsd = initialBalance * (dailyDrawdownPercent / 100);
  const overallDrawdownUsd = initialBalance * (maxOverallDrawdownPercent / 100);
  const minTradingDays = challenge ? (challenge.remainingDays > 20 ? challenge.remainingDays / 4 : 5) : 5;

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
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            Trader Evaluation Challenge Monitor
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Rules-based challenge rules, daily loss limit tracking, and profit target progression.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1.5 rounded-md text-xs font-mono text-[#F59E0B]">
            <Award className="w-4 h-4" />
            <span>PHASE 1 EVALUATION ACTIVE</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3 py-1.5 rounded-md text-xs font-mono text-[#F8FAFC] transition"
          >
            <Settings className="w-4 h-4 text-[#38BDF8]" />
            Configure
          </button>
        </div>
      </div>

      <ChallengeSummaryWidget />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChallengeProgressChart />
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <ShieldCheck className="w-4 h-4 text-[#00C896]" />
            <h3 className="font-bold text-[#F8FAFC] uppercase tracking-wider">
              Challenge Governance Rules
            </h3>
          </div>

          <div className="space-y-2">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Profit Target</span>
              <span className="text-[#00C896] font-bold">+${targetProfitUsd.toFixed(2)} ({targetPercent.toFixed(1)}%)</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Max Daily Drawdown</span>
              <span className="text-[#F6465D] font-bold">-${dailyDrawdownUsd.toFixed(2)} ({dailyDrawdownPercent.toFixed(1)}%)</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Max Total Drawdown</span>
              <span className="text-[#F6465D] font-bold">-${overallDrawdownUsd.toFixed(2)} ({maxOverallDrawdownPercent.toFixed(1)}%)</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Minimum Trading Days</span>
              <span className="text-[#00C896] font-bold">{minTradingDays} Days</span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ChallengeConfigModal 
          onClose={() => setIsModalOpen(false)}
          onReset={(config) => resetChallengeMutation.mutate(config)}
          isPending={resetChallengeMutation.isPending}
        />
      )}
    </motion.div>
  );
};
