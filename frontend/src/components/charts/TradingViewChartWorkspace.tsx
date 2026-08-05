import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { strategyApi } from '../../services/api';
import { chartWebSocketService } from '../../services/ChartWebSocketService';
import { useTerminalStore } from '../../store/useTerminalStore';
import { Maximize2, Minimize2 } from 'lucide-react';
import { ZoneStatus } from '@algoapp/shared';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
/**
 * Maps internal AlgoApp symbol (e.g. "BTCUSD.P") to a Delta Exchange India
 * TradingView symbol. Delta Exchange India is registered on TradingView under
 * the "DELTA" exchange prefix. Their perpetual contract names drop the ".P"
 * suffix — e.g. BTCUSD, ETHUSD, SOLUSD, XRPUSD.
 */
const toTvSymbol = (symbol: string, timeframe: '15M' | '1H'): { sym: string; interval: string } => {
  const interval = timeframe === '15M' ? '15' : '60';
  // Strip ".P" suffix → "BTCUSD.P" → "BTCUSD"
  const deltaSymbol = symbol.toUpperCase().replace('.P', '');
  // Delta Exchange India TradingView prefix
  return { sym: `DELTA:${deltaSymbol}`, interval };
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface TradingViewChartWorkspaceProps {
  initialSymbol?: string;
  initialTimeframe?: '15M' | '1H';
  /** kept for backwards-compat with ReplayPage; not used in TradingView mode */
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

  const [wsState, setWsState] = useState<string>('DISCONNECTED');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Supply & Demand Zones (used for price-level info panel) ──
  const { data: zonesData } = useQuery({
    queryKey: ['zones', currentSymbol],
    queryFn: () => strategyApi.getZones(currentSymbol),
    staleTime: 60_000,
  });

  const { data: signalsData } = useQuery({
    queryKey: ['signals', currentSymbol],
    queryFn: () => strategyApi.getSignals(),
    staleTime: 60_000,
  });

  // ── WebSocket state tracking (Delta India feed for live badge) ──
  useEffect(() => {
    const handleState = (state: string) => setWsState(state);
    chartWebSocketService.on('stateChange', handleState);
    chartWebSocketService.connect(currentSymbol);
    return () => {
      chartWebSocketService.off('stateChange', handleState);
    };
  }, [currentSymbol]);

  // ── Derived values ──
  const activeZones = zonesData?.data?.filter(
    (z) => z.symbol === currentSymbol
      && z.status !== ZoneStatus.CONSUMED
      && z.status !== ZoneStatus.BROKEN
  ) ?? [];

  const latestSignal = signalsData?.data?.filter(
    (s) => s.symbol === currentSymbol
  )[0] ?? null;

  const { sym, interval } = toTvSymbol(currentSymbol, currentTimeframe);

  const iframeSrc = [
    `https://s.tradingview.com/widgetembed/`,
    `?symbol=${encodeURIComponent(sym)}`,
    `&interval=${interval}`,
    `&theme=dark`,
    `&style=1`,
    `&timezone=Asia%2FKolkata`,
    `&locale=en`,
    `&toolbarbg=0B0E14`,
    `&symboledit=1`,
    `&saveimage=1`,
    `&hideideas=1`,
  ].join('');

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: isFullscreen ? '100vh' : '100%', minHeight: '520px' }}
      className={`bg-[#0B0E14] border border-[#1E293B] rounded-xl overflow-hidden font-mono text-xs ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'relative'}`}
    >

      {/* ── Minimal Chart Toolbar ── */}
      <div className="h-10 bg-[#0E121A] border-b border-[#1E293B] px-3 flex items-center justify-between shrink-0">

        {/* Left: Symbol + WS status + timeframe switcher */}
        <div className="flex items-center space-x-3">
          <span className="font-bold text-[#F8FAFC] text-[13px] tracking-wide">{currentSymbol}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${wsState === 'CONNECTED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : wsState === 'RECONNECTING'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
          >
            {wsState === 'CONNECTED' ? '● DELTA INDIA LIVE' : wsState}
          </span>

          <div className="h-4 w-px bg-[#1E293B]" />

          {/* Timeframe */}
          <div className="flex items-center bg-[#161D2A] border border-[#1E293B] rounded p-0.5 space-x-0.5">
            {(['15M', '1H'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${currentTimeframe === tf
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#94A3B8] hover:text-white'
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Zone info + controls */}
        <div className="flex items-center space-x-2">

          {/* Active zones count badge */}
          {activeZones.length > 0 && (
            <div className="flex items-center space-x-1 text-[10px] text-slate-400">
              {activeZones.filter(z => z.type === 'SUPPLY').length > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                  {activeZones.filter(z => z.type === 'SUPPLY').length} SUP
                </span>
              )}
              {activeZones.filter(z => z.type === 'DEMAND').length > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  {activeZones.filter(z => z.type === 'DEMAND').length} DEM
                </span>
              )}
            </div>
          )}

          {/* Latest signal badge */}
          {latestSignal && (
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${latestSignal.outcome === 'BUY'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : latestSignal.outcome === 'SELL'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
              }`}
            >
              ⚡ {latestSignal.outcome} {latestSignal.timeframe}
            </div>
          )}

          <div className="h-4 w-px bg-[#1E293B]" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Zone Info Panel (below toolbar, above chart) ── */}
      {activeZones.length > 0 && (
        <div className="bg-[#0E121A] border-b border-[#1E293B] px-3 py-1.5 flex items-center space-x-3 overflow-x-auto no-scrollbar shrink-0">
          {activeZones.slice(0, 6).map((zone) => (
            <div
              key={zone.id}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap ${zone.type === 'SUPPLY'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
            >
              <span className="font-bold">{zone.type}</span>
              <span className="text-slate-400">[{zone.lowerPrice.toFixed(0)}–{zone.upperPrice.toFixed(0)}]</span>
              <span className={`px-1 rounded text-[9px] font-bold ${zone.status === 'FRESH'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
                }`}>{zone.status}</span>
              <span className="text-slate-500">{zone.touchCount}T · {zone.freshness}%</span>
            </div>
          ))}
        </div>
      )}

      {/* ── TradingView Embedded Chart — full height ── */}
      <div className="relative flex-1 w-full overflow-hidden" style={{ minHeight: '400px' }}>
        <iframe
          key={`${currentSymbol}-${currentTimeframe}`}
          title={`TradingView — ${currentSymbol}`}
          src={iframeSrc}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
        />
      </div>

    </div>
  );
};

export default TradingViewChartWorkspace;
