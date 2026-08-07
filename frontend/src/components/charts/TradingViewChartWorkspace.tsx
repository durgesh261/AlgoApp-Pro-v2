import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { strategyApi, indicatorApi } from '../../services/api';
import { chartWebSocketService } from '../../services/ChartWebSocketService';
import { useTerminalStore } from '../../store/useTerminalStore';
import { Maximize2, Minimize2, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { ZoneStatus } from '@algoapp/shared';

// ─────────────────────────────────────────────
// Symbol mapping — Delta Exchange India
//
// Confirmed TradingView exchange code: DELTAIN
//   ✅  DELTAIN:BTCUSD.P  → Delta Exchange India BTC Perpetual
//   ✅  DELTAIN:ETHUSD.P  → Delta Exchange India ETH Perpetual
//   ✅  DELTAIN:SOLUSD.P  → Delta Exchange India SOL Perpetual
//   ✅  DELTAIN:XRPUSD.P  → Delta Exchange India XRP Perpetual
// ─────────────────────────────────────────────
const DELTA_SYMBOL_MAP: Record<string, string> = {
  'BTCUSD.P': 'DELTAIN:BTCUSD.P',
  'ETHUSD.P': 'DELTAIN:ETHUSD.P',
  'SOLUSD.P': 'DELTAIN:SOLUSD.P',
  'XRPUSD.P': 'DELTAIN:XRPUSD.P',
  'BNBUSD.P': 'DELTAIN:BNBUSD.P',
  'DOGEUSD.P': 'DELTAIN:DOGEUSD.P',
  'AVAXUSD.P': 'DELTAIN:AVAXUSD.P',
  'LINKUSD.P': 'DELTAIN:LINKUSD.P',
};

const toDeltaSymbol = (symbol: string): string => {
  const key = symbol.toUpperCase();
  return DELTA_SYMBOL_MAP[key] ?? `DELTAIN:${key}`;
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TradingViewChartWorkspaceProps {
  initialSymbol?: string;
  initialTimeframe?: '15M' | '1H';
  /** kept for backwards-compat with ReplayPage */
  isReplayActive?: boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const TradingViewChartWorkspace: React.FC<TradingViewChartWorkspaceProps> = ({
  initialSymbol = 'BTCUSD.P',
  initialTimeframe = '1H',
}) => {
  const { activeSymbol, activeTimeframe, setActiveTimeframe } = useTerminalStore();
  const currentSymbol = activeSymbol || initialSymbol;
  const currentTimeframe = activeTimeframe || initialTimeframe;

  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [wsState, setWsState] = useState<string>('DISCONNECTED');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── TradingView Advanced Chart Widget (script-based) ──────────────
  // Uses embed-widget-advanced-chart which properly resolves DELTA:
  // exchange symbols (Delta Exchange India) unlike the simple widgetembed
  // iframe which only supports a limited subset of exchanges.
  useEffect(() => {
    const container = widgetContainerRef.current;
    if (!container) return;

    // Clear any previous widget
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: toDeltaSymbol(currentSymbol),
      interval: currentTimeframe === '15M' ? '15' : '60',
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#0B0E14',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: true,
      details: false,
      hotlist: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [currentSymbol, currentTimeframe]);

  // ── WebSocket state tracking ──────────────────────────────────────
  useEffect(() => {
    const handleState = (state: string) => setWsState(state);
    chartWebSocketService.on('stateChange', handleState);
    chartWebSocketService.connect(currentSymbol);
    return () => {
      chartWebSocketService.off('stateChange', handleState);
    };
  }, [currentSymbol]);

  // ── Supply & Demand Zones & Indicators ────────────────────────────
  const { data: zonesData } = useQuery({
    queryKey: ['zones', currentSymbol],
    queryFn: () => strategyApi.getZones(currentSymbol),
    staleTime: 30_000,
  });

  const { data: signalsData } = useQuery({
    queryKey: ['signals', currentSymbol],
    queryFn: () => strategyApi.getSignals(),
    staleTime: 30_000,
  });

  const { data: indicatorRes } = useQuery({
    queryKey: ['indicator-engine', currentSymbol, currentTimeframe],
    queryFn: () => indicatorApi.evaluate(currentSymbol, currentTimeframe),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const indicators = indicatorRes?.data;
  const marketStructure = indicators?.marketStructure;
  const pdZones = indicators?.premiumDiscountZones;
  const orderBlocks = indicators?.orderBlocks ?? [];
  const liquiditySweeps = indicators?.liquiditySweeps ?? [];
  const equalHighLows = indicators?.equalHighLows ?? [];

  const activeZones =
    zonesData?.data?.filter(
      (z) =>
        z.symbol === currentSymbol &&
        z.status !== ZoneStatus.CONSUMED &&
        z.status !== ZoneStatus.BROKEN
    ) ?? [];

  const latestSignal =
    signalsData?.data?.filter((s) => s.symbol === currentSymbol)[0] ?? null;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100vh' : '100%',
        minHeight: isFullscreen ? '100vh' : '360px',
      }}
      className={`bg-[#0B0E14] border border-[#1E293B] rounded-xl overflow-hidden font-mono text-xs ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'relative'
      }`}
    >
      {/* ── Toolbar ── */}
      <div className="h-9 bg-[#0E121A] border-b border-[#1E293B] px-3 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar gap-2 whitespace-nowrap">
        {/* Left */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <span className="font-bold text-[#F8FAFC] text-[13px] tracking-wide shrink-0">
            {currentSymbol}
          </span>

          {/* Delta India live badge */}
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${
              wsState === 'CONNECTED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : wsState === 'RECONNECTING'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {wsState === 'CONNECTED' ? '● DELTA INDIA LIVE' : wsState}
          </span>

          <div className="h-4 w-px bg-[#1E293B] shrink-0" />

          {/* Timeframe switcher */}
          <div className="flex items-center bg-[#161D2A] border border-[#1E293B] rounded p-0.5 space-x-0.5 shrink-0">
            {(['15M', '1H'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  currentTimeframe === tf
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Structure Trend Badge */}
          {marketStructure && (
            <div
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                marketStructure.trend === 'BULLISH'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {marketStructure.trend === 'BULLISH' ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span>SMC {marketStructure.trend}</span>
            </div>
          )}

          {/* Premium / Discount Zone Badge */}
          {pdZones && (
            <div
              className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                pdZones.currentZone === 'DISCOUNT'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : pdZones.currentZone === 'PREMIUM'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              🎯 {pdZones.currentZone} ZONE
            </div>
          )}

          {/* Signal badge */}
          {latestSignal && (
            <div
              className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                latestSignal.outcome === 'BUY'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : latestSignal.outcome === 'SELL'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
              }`}
            >
              ⚡ {latestSignal.outcome} {latestSignal.timeframe}
            </div>
          )}

          <div className="h-4 w-px bg-[#1E293B] shrink-0" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded transition-colors shrink-0"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── Native Backend SMC & PAT Analytics Strip (Adjusted Clean Single-Line Pill Strip) ── */}
      <div className="bg-[#0B0E14] border-b border-[#1E293B] px-3 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-[10px] font-mono whitespace-nowrap">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold shrink-0">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>NATIVE SMC ENGINE</span>
        </div>

        {marketStructure && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161D2A] border border-[#1E293B] text-slate-300 shrink-0">
            <span>Swing:</span>
            <strong className={marketStructure.swingTrend === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}>
              {marketStructure.swingTrend}
            </strong>
            <span className="text-slate-500">•</span>
            <span>Int:</span>
            <strong className={marketStructure.internalTrend === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}>
              {marketStructure.internalTrend}
            </strong>
          </div>
        )}

        {pdZones && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161D2A] border border-[#1E293B] text-slate-300 shrink-0">
            <span>Eq:</span>
            <strong className="text-cyan-300">{pdZones.equilibrium.toFixed(1)}</strong>
            <span className="text-slate-400 text-[9px]">
              [D: {pdZones.discountZone.top.toFixed(0)} | P: {pdZones.premiumZone.bottom.toFixed(0)}]
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161D2A] border border-[#1E293B] text-slate-300 shrink-0">
          <span>Order Blocks:</span>
          <strong className="text-amber-400 font-bold">
            {orderBlocks.filter((ob) => !ob.isMitigated).length} active
          </strong>
          <span className="text-slate-400">({orderBlocks.length} total)</span>
        </div>

        {liquiditySweeps.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold shrink-0">
            <span>⚡</span>
            <span>{liquiditySweeps.length} Sweeps Detected</span>
          </div>
        )}

        {equalHighLows.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold shrink-0">
            <span>⚌</span>
            <span>{equalHighLows.length} EQH/EQL</span>
          </div>
        )}

        {activeZones.slice(0, 4).map((zone) => (
          <div
            key={zone.id}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border shrink-0 font-bold ${
              zone.type === 'SUPPLY'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <span>{zone.type}</span>
            <span className="font-normal opacity-80">
              [{zone.lowerPrice.toFixed(0)}-{zone.upperPrice.toFixed(0)}]
            </span>
          </div>
        ))}
      </div>

      {/* ── TradingView Advanced Chart Widget ── */}
      <div
        className="tradingview-widget-container flex-1 w-full overflow-hidden"
        style={{ minHeight: '320px' }}
      >
        <div
          ref={widgetContainerRef}
          className="tradingview-widget-container__widget"
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
};

export default TradingViewChartWorkspace;
