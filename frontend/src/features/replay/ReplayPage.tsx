import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { replayApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { ReplayControlAction, ReplayStatus } from '@algoapp/shared';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { TradingViewChartWorkspace } from '../../components/charts/TradingViewChartWorkspace';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Sliders, 
  Clock, 
  Database,
  Radio,
  Cpu
} from 'lucide-react';

export const ReplayPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol } = useTerminalStore();
  const { addToast } = useToastStore();

  const { data: sessionData } = useQuery({
    queryKey: ['replaySession', activeSymbol],
    queryFn: () => replayApi.getSession(activeSymbol),
  });

  const { data: eventsData } = useQuery({
    queryKey: ['replayEvents'],
    queryFn: replayApi.getEvents,
  });

  const controlMutation = useMutation({
    mutationFn: (args: { action: ReplayControlAction; targetIndex?: number; speedMultiplier?: number }) => {
      const payload: { speedMultiplier?: number; targetIndex?: number } = {};
      if (args.speedMultiplier !== undefined) payload.speedMultiplier = args.speedMultiplier;
      if (args.targetIndex !== undefined) payload.targetIndex = args.targetIndex;
      return replayApi.control(args.action, payload);
    },
    onSuccess: (res) => {
      addToast('Replay Engine Updated', `Status: ${res.data.status} (Candle #${res.data.currentCandleIndex + 1}/${res.data.totalCandles})`, 'info');
      queryClient.invalidateQueries({ queryKey: ['replaySession'] });
      queryClient.invalidateQueries({ queryKey: ['replayEvents'] });
    },
  });

  const session = sessionData?.data;
  const events = eventsData?.data || [];
  const candle = session?.currentCandle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#3B82F6]" />
            Historical Replay Terminal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Reproduce historical market movement candle-by-candle with deterministic timeline inspection.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <Clock className="w-4 h-4 text-[#00C896]" />
          <span>REPLAY ENGINE: {session?.status ?? 'IDLE'}</span>
        </div>
      </div>

      <CurrentPairWidget />

      {/* Interactive TradingView Chart Workspace */}
      <div className="h-[420px] w-full">
        <TradingViewChartWorkspace initialSymbol={activeSymbol} initialTimeframe="1H" isReplayActive={true} />
      </div>

      {/* Replay Control Bar & Slider */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Replay Timeline & Playback Controls — {activeSymbol}
            </h3>
          </div>
          <span className="text-[10px] bg-[#1E293B] text-[#00C896] px-2 py-0.5 rounded font-bold">
            PROGRESS: {session?.replayProgressPercent ?? 0}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {session?.status === ReplayStatus.PLAYING ? (
              <button
                onClick={() => controlMutation.mutate({ action: ReplayControlAction.PAUSE })}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-black rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Pause className="w-4 h-4" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                onClick={() => controlMutation.mutate({ action: ReplayControlAction.PLAY })}
                className="px-4 py-2 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Play className="w-4 h-4" />
                <span>PLAY</span>
              </button>
            )}

            <button
              onClick={() => controlMutation.mutate({ action: ReplayControlAction.STEP_BACKWARD })}
              className="px-3 py-2 bg-[#1E293B] hover:bg-[#28334A] text-[#F8FAFC] rounded-lg font-bold text-xs flex items-center space-x-1 border border-[#334155]"
            >
              <SkipBack className="w-4 h-4" />
              <span>STEP BACK</span>
            </button>

            <button
              onClick={() => controlMutation.mutate({ action: ReplayControlAction.STEP_FORWARD })}
              className="px-3 py-2 bg-[#1E293B] hover:bg-[#28334A] text-[#F8FAFC] rounded-lg font-bold text-xs flex items-center space-x-1 border border-[#334155]"
            >
              <SkipForward className="w-4 h-4" />
              <span>STEP FORWARD</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#94A3B8]">
            <span>Speed:</span>
            {[1.0, 2.0, 5.0, 10.0].map((s) => (
              <button
                key={s}
                onClick={() => controlMutation.mutate({ action: ReplayControlAction.SET_SPEED, speedMultiplier: s })}
                className={`px-2 py-1 rounded text-[10px] font-bold ${
                  session?.speedMultiplier === s ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-[10px] text-[#94A3B8]">
            <span>Candle #{session ? session.currentCandleIndex + 1 : 1} of {session?.totalCandles ?? 20}</span>
            <span>{candle?.timestamp ?? '2026-08-02T19:00:00Z'}</span>
          </div>
          <input
            type="range"
            min={0}
            max={(session?.totalCandles ?? 20) - 1}
            value={session?.currentCandleIndex ?? 0}
            onChange={(e) =>
              controlMutation.mutate({ action: ReplayControlAction.JUMP_TO_INDEX, targetIndex: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
          />
        </div>
      </div>

      {/* Candle Inspector Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Replay Candle Card */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Database className="w-4 h-4 text-[#00C896]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Candle Inspector (#{(session?.currentCandleIndex ?? 0) + 1})
            </h3>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5 text-[11px]">
              <span className="text-[#94A3B8]">Timestamp</span>
              <span className="text-[#F8FAFC] font-bold">{candle?.timestamp ?? '2026-08-02T19:00:00Z'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Open</span>
              <span className="text-[#F8FAFC] font-bold">${candle?.open.toLocaleString() ?? '63,850.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">High</span>
              <span className="text-[#00C896] font-bold">${candle?.high.toLocaleString() ?? '64,500.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Low</span>
              <span className="text-[#F6465D] font-bold">${candle?.low.toLocaleString() ?? '63,650.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Close</span>
              <span className="text-[#F8FAFC] font-bold">${candle?.close.toLocaleString() ?? '64,250.00'}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#1E293B]">
              <span className="text-[#94A3B8]">Volume</span>
              <span className="text-[#3B82F6] font-bold">{candle?.volume.toLocaleString() ?? '2,140.2'}</span>
            </div>
          </div>
        </div>

        {/* Replay Stream Events */}
        <div className="lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-[#3B82F6]" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Replay Event Stream Log ({events.length})
              </h3>
            </div>
            <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC TIMELINE STREAM</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.map((evt) => (
              <div key={evt.id} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-[#3B82F6]" />
                  <div>
                    <span className="font-bold text-[#F8FAFC]">{evt.eventType}</span>
                    <span className="text-[10px] text-[#94A3B8] block">{evt.payloadJson}</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#64748B]">{evt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
