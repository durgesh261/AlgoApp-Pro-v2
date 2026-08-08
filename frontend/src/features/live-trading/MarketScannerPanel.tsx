import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scannerApi } from '../../services/api';
import { ScannerStateDto, ScannerPairTelemetry } from '@algoapp/shared';
import {
  Radar,
  Play,
  Pause,
  Square,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useScanner, ScannerTelemetry } from '../../hooks/useScanner';

export const MarketScannerPanel: React.FC = () => {
  const [selectedAiSymbol, setSelectedAiSymbol] = useState<string | null>(null);

  const { telemetry, stats, scannerState, isConnected, isDeltaConnected, controlScanner } = useScanner();

  const latestAiDecision = null; // Mock for now until AI details are added to telemetry

  const isRunning = scannerState === 'RUNNING';
  const isPaused = scannerState === 'PAUSED';
  // Note: we can map the isInTrade state if we want by tracking active trades,
  // but for now we'll just use simple states to avoid breaking the UI.
  const isInTrade = false; 
  const isStopped = scannerState === 'STOPPED';

  const startAll = () => controlScanner('start');
  const pauseAll = () => controlScanner('pause');
  const resumeAll = () => controlScanner('resume');
  const stopAll = () => controlScanner('stop');
  const startPair = (sym: string) => controlScanner('start', sym);
  const pausePair = (sym: string) => controlScanner('pause', sym);
  const resumePair = (sym: string) => controlScanner('resume', sym);
  const stopPair = (sym: string) => controlScanner('stop', sym);

  return (
    <div className="bg-[#0B0E14] border border-[#1E293B] rounded-xl p-4 font-mono text-xs text-slate-300 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Radar className={`w-5 h-5 ${isRunning || isInTrade ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">24/7 Market Scanner Engine</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  isInTrade
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                    : isRunning
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isPaused
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                }`}
              >
                ● {scannerState}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              1H Institutional Order Block Scanner · 9-Factor AI Gate (≥85%) · Individual Pair Control (Pause/Stop) · Delta Live Order Routing
            </p>
          </div>
        </div>

        {/* Scanner Controls */}
        <div className="flex items-center gap-2">
          {isStopped && (
            <button
              onClick={startAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-lg shadow-emerald-600/20"
            >
              <Play className="w-3.5 h-3.5" /> Start All
            </button>
          )}

          {isRunning && (
            <button
              onClick={pauseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition"
            >
              <Pause className="w-3.5 h-3.5" /> Pause All
            </button>
          )}

          {isPaused && (
            <button
              onClick={resumeAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
            >
              <Play className="w-3.5 h-3.5" /> Resume All
            </button>
          )}

          {(isRunning || isPaused || isInTrade) && (
            <button
              onClick={stopAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold rounded-lg transition"
            >
              <Square className="w-3.5 h-3.5" /> Stop All
            </button>
          )}
        </div>
      </div>

      {/* In-Trade Active Lock Banner */}
      {isInTrade && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 border border-purple-500/50 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/30 rounded-lg text-purple-300 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-white">
                <span>ACTIVE TRADE POSITION LOCKED</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  SINGLE POSITION RULE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                Scanning engine is locked on other pairs until this position reaches Take Profit (+60%) or Stop Loss (-35%).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-900/40 px-3 py-1 rounded-lg border border-purple-500/30 shrink-0">
            ID: LIVE-DELTA-EXECUTION
          </span>
        </motion.div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0E121A] border border-[#1E293B] rounded-lg p-2.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Ticks Processed</span>
          <span className="text-sm font-bold text-white font-mono mt-0.5 block">{(stats.ticks || 0).toLocaleString()}</span>
        </div>
        <div className="bg-[#0E121A] border border-[#1E293B] rounded-lg p-2.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Signals Triggered</span>
          <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">{stats.signals}</span>
        </div>
        <div className="bg-[#0E121A] border border-[#1E293B] rounded-lg p-2.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Trades Executed</span>
          <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{stats.trades}</span>
        </div>
        <div className="bg-[#0E121A] border border-[#1E293B] rounded-lg p-2.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Scan Matrix</span>
          <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">4 Pairs (1H TF)</span>
        </div>
      </div>

      {/* Scanner Matrix Table */}
      <div className="overflow-x-auto border border-[#1E293B] rounded-lg bg-[#0E121A]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#121722] text-[#64748B] text-[10px] uppercase font-bold border-b border-[#1E293B]">
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Live Price</th>
              <th className="py-2.5 px-3">Active OBs</th>
              <th className="py-2.5 px-3">OB Width %</th>
              <th className="py-2.5 px-3">Pair Status</th>
              <th className="py-2.5 px-3">AI Score</th>
              <th className="py-2.5 px-3 text-right">Individual Control & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/60 text-[11px]">
            {['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'].map((sym) => {
              const pair: ScannerTelemetry = telemetry.find(t => t.symbol === sym) || {
                symbol: sym,
                livePrice: 0,
                activeOrderBlocksCount: 0,
                scanState: 'IDLE',
                orderBlockWidthPercent: 0,
                latestConfidenceScore: 0,
                lastScanAt: new Date().toISOString(),
                userStatus: 'RUNNING',
              };

              const pairUserStatus = pair.userStatus || 'RUNNING';
              const isTradeActive = false; // Add trade active tracking if needed later
              const isPairRunning = pairUserStatus === 'RUNNING';
              const isPairPaused = pairUserStatus === 'PAUSED';
              const isPairStopped = pairUserStatus === 'STOPPED';

              return (
                <tr key={sym} className="hover:bg-[#161D2A] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    {isTradeActive ? (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    ) : isPairStopped ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Stopped manually" />
                    ) : isPairPaused ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="Paused manually" />
                    ) : isRunning ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" title="Active scanning" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-500" title="Engine offline" />
                    )}
                    <span>{sym}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">
                    ${pair.livePrice ? pair.livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-center">
                    {pair.activeOrderBlocksCount > 0 ? (
                      <span className="text-[#F59E0B] font-bold">{pair.activeOrderBlocksCount} Zones</span>
                    ) : (
                      <span className="text-[#64748B]">0 Zones</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-center">
                    {pair.orderBlockWidthPercent > 0 ? `${pair.orderBlockWidthPercent.toFixed(2)}%` : '---'}
                  </td>
                  <td className="py-2.5 px-3">
                    {isTradeActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        ● IN ACTIVE TRADE
                      </span>
                    ) : isPairStopped ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        ● STOPPED
                      </span>
                    ) : isPairPaused ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ● PAUSED
                      </span>
                    ) : !isRunning ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        ● ENGINE {scannerState}
                      </span>
                    ) : pair.scanState === 'SIGNAL_TRIGGERED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        ● SIGNAL TRIGGERED
                      </span>
                    ) : pair.scanState === 'EVALUATING' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ● EVALUATING
                      </span>
                    ) : pair.scanState === 'ERROR' || pair.scanState === 'NO_DATA' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        ● {pair.scanState}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        ● SCANNING
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-center">
                    {pair.latestConfidenceScore ? (
                      <span
                        className={
                          pair.latestConfidenceScore >= 85
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {pair.latestConfidenceScore}%
                      </span>
                    ) : (
                      <span className="text-slate-600">---</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Individual Pair Controls */}
                      {isPairRunning ? (
                        <>
                          <button
                            onClick={() => pausePair(sym)}
                            title={`Pause scanner for ${sym}`}
                            className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[10px] text-amber-300 font-semibold flex items-center gap-1 transition"
                          >
                            <Pause className="w-2.5 h-2.5" /> Pause
                          </button>
                          <button
                            onClick={() => stopPair(sym)}
                            title={`Stop scanner for ${sym}`}
                            className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300 font-semibold flex items-center gap-1 transition"
                          >
                            <Square className="w-2.5 h-2.5" /> Stop
                          </button>
                        </>
                      ) : isPairPaused ? (
                        <>
                          <button
                            onClick={() => resumePair(sym)}
                            title={`Resume scanner for ${sym}`}
                            className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold flex items-center gap-1 transition shadow-sm"
                          >
                            <Play className="w-2.5 h-2.5" /> Resume
                          </button>
                          <button
                            onClick={() => stopPair(sym)}
                            title={`Stop scanner for ${sym}`}
                            className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300 font-semibold flex items-center gap-1 transition"
                          >
                            <Square className="w-2.5 h-2.5" /> Stop
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startPair(sym)}
                          title={`Start scanner for ${sym}`}
                          className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold flex items-center gap-1 transition shadow-sm"
                        >
                          <Play className="w-2.5 h-2.5" /> Start
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAiSymbol(sym)}
                        className="px-2 py-1 rounded bg-[#161D2A] hover:bg-[#1E293B] border border-[#1E293B] text-[10px] text-indigo-300 font-semibold transition"
                      >
                        Inspect AI
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Decision Breakdown Inspector Modal */}
      <AnimatePresence>
        {selectedAiSymbol && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E121A] border border-[#1E293B] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">
                    9-Factor AI Institutional Scorecard: {selectedAiSymbol}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAiSymbol(null)}
                  className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded bg-[#161D2A]"
                >
                  ✕ Close
                </button>
              </div>

              {latestAiDecision ? (
                <div className="space-y-3 font-sans">
                  <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Total Approval Score:</span>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">
                        {/* @ts-ignore */}
                        {latestAiDecision.confidenceScore}%
                        <span className="text-xs font-normal text-slate-400 ml-2">
                          (Req: $\ge 85\%$)
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase ${
                        /* @ts-ignore */
                        latestAiDecision.approved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {/* @ts-ignore */}
                      {latestAiDecision.approved ? 'APPROVED FOR LIVE' : 'REJECTED BY AI'}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {/* @ts-ignore */}
                    {latestAiDecision.breakdown &&
                      /* @ts-ignore */
                      Object.values(latestAiDecision.breakdown).map((factor: any, i: number) => (
                        <div
                          key={i}
                          className="bg-[#121722] border border-[#1E293B] rounded p-2 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">{factor.name}</span>
                            <p className="text-[10px] text-slate-400">{factor.explanation}</p>
                          </div>
                          <span className="font-mono font-bold text-indigo-300 ml-2">
                            +{factor.score} pts
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  No AI evaluation recorded yet for this session.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Disconnected Warning */}
      {!isDeltaConnected && (
        <div className="mt-3 bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg p-3 text-center">
          <p className="text-[11px] text-[#F6465D] font-bold">Scanner Offline — Delta Disconnected</p>
          <p className="text-[10px] text-[#94A3B8] mt-1">Add API keys in Settings to activate live scanning</p>
        </div>
      )}
    </div>
  );
};

export default MarketScannerPanel;
