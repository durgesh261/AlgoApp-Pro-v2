import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  CandlestickSeries,
  HistogramSeries,
  CandlestickData,
  HistogramData,
  Time,
  ISeriesApi,
  IPriceLine,
} from 'lightweight-charts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { marketDataApi, paperTradingApi, strategyApi } from '../../services/api';
import { chartWebSocketService, LiveTrade } from '../../services/ChartWebSocketService';
import { useTerminalStore } from '../../store/useTerminalStore';
import {
  BarChart2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  Camera,
  RotateCcw,
  Layers,
  Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface TradingViewChartWorkspaceProps {
  initialSymbol?: string;
  initialTimeframe?: '15M' | '1H';
  isReplayActive?: boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export const TradingViewChartWorkspace: React.FC<TradingViewChartWorkspaceProps> = ({
  initialSymbol = 'BTCUSD.P',
  initialTimeframe = '1H',
  isReplayActive = false,
}) => {
  const { activeSymbol, activeTimeframe, setActiveTimeframe } = useTerminalStore();
  const currentSymbol = activeSymbol || initialSymbol;
  const currentTimeframe = activeTimeframe || initialTimeframe;

  // ── Refs ──────────────────────────────────
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<{ candle: ISeriesApi<'Candlestick'>; volume: ISeriesApi<'Histogram'> } | null>(null);

  /** Most recently committed candle — updated without React state for <250ms latency */
  const lastCandleRef = useRef<CandlestickData | null>(null);
  /** Accumulated real volume for the current in-progress candle */
  const currentCandleVolumeRef = useRef<number>(0);

  /** Price-lines created on the chart canvas (positions, orders, zones) */
  const linesRef = useRef<IPriceLine[]>([]);

  /** Whether we are currently loading older (pre-pend) history */
  const isFetchingOlderRef = useRef(false);
  /** Oldest timestamp (Unix seconds) loaded so far — used to paginate backwards */
  const oldestTimestampRef = useRef<number>(0);

  // ── State ──────────────────────────────────
  const [wsState, setWsState] = useState<string>('DISCONNECTED');
  const [chartEngine, setChartEngine] = useState<'TRADINGVIEW_LIVE' | 'LIGHTWEIGHT'>('LIGHTWEIGHT');
  const [showZones, setShowZones] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [, setReplayIndex] = useState<number>(50);

  const queryClient = useQueryClient();

  // ── Fetch: Historical Candles ──────────────
  const limit = currentTimeframe === '1H' ? 2000 : 1000;
  const { data: candleDataResponse } = useQuery({
    queryKey: ['candles', currentSymbol, currentTimeframe],
    queryFn: () =>
      marketDataApi.getCandles({ symbol: currentSymbol, timeframe: currentTimeframe, limit }),
    staleTime: Infinity, // WebSocket handles live updates; no polling needed
  });

  // ── Fetch: Real Supply/Demand Zones from backend ──
  const { data: zonesData } = useQuery({
    queryKey: ['zones', currentSymbol],
    queryFn: () => strategyApi.getZones(currentSymbol),
    staleTime: 60_000, // refresh every minute
  });

  // ── Fetch: Real Strategy Signals (BOS/CHoCH) ──
  const { data: signalsData } = useQuery({
    queryKey: ['signals'],
    queryFn: () => strategyApi.getSignals(),
    staleTime: 60_000,
  });

  // ── Fetch: Paper Positions & Orders ──
  const { data: positionsData } = useQuery({
    queryKey: ['paperPositions'],
    queryFn: paperTradingApi.getPositions,
  });
  const { data: ordersData } = useQuery({
    queryKey: ['paperOrders'],
    queryFn: paperTradingApi.getOrders,
  });

  // ─────────────────────────────────────────────
  // EFFECT 1: Create chart once — never recreated
  // ─────────────────────────────────────────────
  useEffect(() => {
    let rafId: number;
    let chartInstance: ReturnType<typeof createChart> | null = null;
    let ro: ResizeObserver | null = null;

    const initChart = () => {
      const container = chartContainerRef.current;
      if (!container) return;

      // requestAnimationFrame guarantees a full layout pass has occurred.
      // container.offsetWidth is now a real pixel value — guaranteed non-zero.
      const w = container.offsetWidth || window.innerWidth - 420;
      const h = Math.max(400, window.innerHeight - 255);

      chartInstance = createChart(container, {
        width: w,
        height: h,
        layout: {
          background: { color: '#0B0E14' },
          textColor: '#94A3B8',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
        },
        grid: {
          vertLines: { color: '#1E293B' },
          horzLines: { color: '#1E293B' },
        },
        crosshair: {
          mode: 1,
          vertLine: { color: '#3B82F6', width: 1, style: 2, labelBackgroundColor: '#1E293B' },
          horzLine: { color: '#3B82F6', width: 1, style: 2, labelBackgroundColor: '#1E293B' },
        },
        rightPriceScale: {
          borderColor: '#1E293B',
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: '#1E293B',
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 5,
        },
      });

      const candlestickSeries = chartInstance.addSeries(CandlestickSeries, {
        upColor: '#00C896',
        downColor: '#F6465D',
        borderVisible: false,
        wickUpColor: '#00C896',
        wickDownColor: '#F6465D',
      });

      const volumeSeries = chartInstance.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      seriesRef.current = { candle: candlestickSeries, volume: volumeSeries };
      chartApiRef.current = chartInstance;

      // ── Infinite scroll: fetch older candles when user scrolls left ──
      chartInstance.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (!range) return;
        if (range.from < 10 && !isFetchingOlderRef.current && oldestTimestampRef.current > 0) {
          isFetchingOlderRef.current = true;
          const olderTo = oldestTimestampRef.current;
          marketDataApi
            .getCandles({ symbol: currentSymbol, timeframe: currentTimeframe, limit })
            .then((res) => {
              if (!res?.data || res.data.length === 0 || !seriesRef.current) return;
              const map = new Map<number, { candle: CandlestickData; vol: HistogramData }>();
              for (const c of res.data) {
                const t = Math.floor(new Date(c.timestamp).getTime() / 1000);
                if (isNaN(t) || t <= 0 || t >= olderTo) continue;
                map.set(t, {
                  candle: { time: t as Time, open: c.open, high: c.high, low: c.low, close: c.close },
                  vol: { time: t as Time, value: c.volume, color: c.close >= c.open ? 'rgba(0,200,150,0.4)' : 'rgba(246,70,93,0.4)' },
                });
              }
              const sorted = Array.from(map.keys()).sort((a, b) => a - b);
              if (sorted.length > 0 && seriesRef.current) {
                oldestTimestampRef.current = Math.min(oldestTimestampRef.current, sorted[0]!);
                seriesRef.current.candle.setData(sorted.map((t) => map.get(t)!.candle));
                seriesRef.current.volume.setData(sorted.map((t) => map.get(t)!.vol));
              }
            })
            .catch(() => {})
            .finally(() => { isFetchingOlderRef.current = false; });
        }
      });

      // ── ResizeObserver: update chart dimensions when container resizes ──
      ro = new ResizeObserver(() => {
        if (!chartApiRef.current || !chartContainerRef.current) return;
        const nw = chartContainerRef.current.offsetWidth || window.innerWidth - 420;
        const nh = Math.max(400, window.innerHeight - 255);
        chartApiRef.current.applyOptions({ width: nw, height: nh });
      });
      ro.observe(container);

      const onWindowResize = () => {
        if (!chartApiRef.current) return;
        chartApiRef.current.applyOptions({
          width: (chartContainerRef.current?.offsetWidth ?? window.innerWidth - 420),
          height: Math.max(400, window.innerHeight - 255),
        });
      };
      window.addEventListener('resize', onWindowResize);

      // Store cleanup for window resize listener
      (chartInstance as unknown as { _cleanupWindowResize?: () => void })._cleanupWindowResize = () => {
        window.removeEventListener('resize', onWindowResize);
      };
    };

    // Defer by 1 animation frame so layout is complete and offsetWidth > 0
    rafId = requestAnimationFrame(initChart);

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      (chartApiRef.current as unknown as { _cleanupWindowResize?: () => void })?._cleanupWindowResize?.();
      chartInstance?.remove();
      chartApiRef.current = null;
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty: chart created ONCE

  // ─────────────────────────────────────────────
  // EFFECT 2: Load historical candle data into existing series
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !candleDataResponse?.data || candleDataResponse.data.length === 0) return;
    const { candle: candlestickSeries, volume: volumeSeries } = seriesRef.current;

    const map = new Map<number, { candle: CandlestickData; vol: HistogramData }>();
    for (const c of candleDataResponse.data) {
      const timeSec = Math.floor(new Date(c.timestamp).getTime() / 1000);
      if (isNaN(timeSec) || timeSec <= 0) continue;
      map.set(timeSec, {
        candle: { time: timeSec as Time, open: c.open, high: c.high, low: c.low, close: c.close },
        vol: {
          time: timeSec as Time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(0,200,150,0.4)' : 'rgba(246,70,93,0.4)',
        },
      });
    }

    const sortedTimes = Array.from(map.keys()).sort((a, b) => a - b);
    const candles: CandlestickData[] = sortedTimes.map((t) => map.get(t)!.candle);
    const volumes: HistogramData[] = sortedTimes.map((t) => map.get(t)!.vol);

    if (candles.length > 0) {
      candlestickSeries.setData(candles);
      volumeSeries.setData(volumes);
      chartApiRef.current?.timeScale().fitContent();
      const lastCandle = candles[candles.length - 1]!;
      lastCandleRef.current = {
        time: lastCandle.time,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      };
      currentCandleVolumeRef.current = volumes[volumes.length - 1]?.value ?? 0;
      oldestTimestampRef.current = sortedTimes[0]!;
    }
  }, [candleDataResponse]);

  // ─────────────────────────────────────────────
  // EFFECT 3: WebSocket — reconnect on symbol/timeframe change
  // ─────────────────────────────────────────────
  useEffect(() => {
    // Reset live candle state on every symbol/timeframe switch
    lastCandleRef.current = null;
    currentCandleVolumeRef.current = 0;

    // Invalidate candle query to trigger a fresh fetch
    queryClient.invalidateQueries({ queryKey: ['candles', currentSymbol, currentTimeframe] });

    const handleWsState = (state: string) => setWsState(state);
    chartWebSocketService.on('stateChange', handleWsState);

    const handleTrade = (trade: LiveTrade) => {
      if (!seriesRef.current || !lastCandleRef.current) return;

      const { candle: candlestickSeries, volume: volumeSeries } = seriesRef.current;
      const stepSec = currentTimeframe === '15M' ? 900 : 3600;
      const tradeTimeSec = Math.floor(trade.timestamp / 1000);
      const lastCandleTimeSec = lastCandleRef.current.time as number;

      if (tradeTimeSec >= lastCandleTimeSec + stepSec) {
        // ── New candle: align to exact timeframe bucket boundary ──
        const newBucketTime =
          Math.floor(tradeTimeSec / stepSec) * stepSec;

        const newCandle: CandlestickData = {
          time: newBucketTime as Time,
          open: trade.price,
          high: trade.price,
          low: trade.price,
          close: trade.price,
        };
        lastCandleRef.current = newCandle;
        currentCandleVolumeRef.current = trade.size; // reset volume bucket

        candlestickSeries.update(newCandle);
        volumeSeries.update({
          time: newBucketTime as Time,
          value: currentCandleVolumeRef.current,
          color: 'rgba(0,200,150,0.4)',
        });
      } else {
        // ── Update current candle in place ──
        const c = lastCandleRef.current!;
        c.close = trade.price;
        const currentHigh = c.high ?? trade.price;
        const currentLow = c.low ?? trade.price;
        if (trade.price > currentHigh) c.high = trade.price;
        if (trade.price < currentLow) c.low = trade.price;
        currentCandleVolumeRef.current += trade.size; // accumulate real volume

        candlestickSeries.update(c);
        volumeSeries.update({
          time: c.time,
          value: currentCandleVolumeRef.current,
          color: c.close >= c.open ? 'rgba(0,200,150,0.4)' : 'rgba(246,70,93,0.4)',
        });
      }
    };

    chartWebSocketService.on('trade', handleTrade);
    chartWebSocketService.connect(currentSymbol);

    return () => {
      chartWebSocketService.off('trade', handleTrade);
      chartWebSocketService.off('stateChange', handleWsState);
    };
  }, [currentSymbol, currentTimeframe, queryClient]);

  // ─────────────────────────────────────────────
  // EFFECT 4: Price-line overlays (positions, orders, real zones, signals)
  // ─────────────────────────────────────────────
  const renderOverlays = useCallback(() => {
    if (!seriesRef.current?.candle) return;
    const series = seriesRef.current.candle;

    // Clear existing lines
    linesRef.current.forEach((line) => {
      try { series.removePriceLine(line); } catch { /* already removed */ }
    });
    linesRef.current = [];

    const newLines: IPriceLine[] = [];

    // ── Real Supply/Demand Zones from backend ──
    if (showZones && zonesData?.data) {
      zonesData.data
        .filter((z) => z.status !== 'CONSUMED' && z.status !== 'BROKEN')
        .forEach((zone) => {
          const color =
            zone.type === 'SUPPLY'
              ? 'rgba(246,70,93,0.6)'
              : 'rgba(0,200,150,0.6)';
          const top = series.createPriceLine({
            price: zone.upperPrice,
            color,
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: true,
            title: `${zone.type} (${zone.freshness}%)`,
          });
          const bot = series.createPriceLine({
            price: zone.lowerPrice,
            color,
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: false,
            title: '',
          });
          newLines.push(top, bot);
        });
    }

    // ── Real BOS/CHoCH Signals from backend ──
    if (showMarkers && signalsData?.data) {
      signalsData.data
        .filter((s) => s.symbol === currentSymbol)
        .slice(0, 6) // limit to most recent 6
        .forEach((sig) => {
          const line = series.createPriceLine({
            price: sig.price,
            color: 'rgba(59,130,246,0.7)',
            lineWidth: 1,
            lineStyle: 4,
            axisLabelVisible: true,
            title: sig.outcome,
          });
          newLines.push(line);
        });
    }

    // ── Open Positions ──
    if (positionsData?.data) {
      positionsData.data
        .filter((pos) => pos.symbol === currentSymbol && pos.quantity > 0)
        .forEach((pos) => {
          const isLong = (pos.side as string) === 'LONG';
          const color = isLong ? '#00C896' : '#F6465D';
          const line = series.createPriceLine({
            price: pos.entryPrice,
            color,
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `POS ${pos.side} ${pos.leverage}x`,
          });
          newLines.push(line);

          if (pos.stopLoss) {
            const sl = series.createPriceLine({
              price: pos.stopLoss,
              color: '#F6465D',
              lineWidth: 1,
              lineStyle: 3,
              axisLabelVisible: true,
              title: 'SL',
            });
            newLines.push(sl);
          }
          if (pos.takeProfit) {
            const tp = series.createPriceLine({
              price: pos.takeProfit,
              color: '#00C896',
              lineWidth: 1,
              lineStyle: 3,
              axisLabelVisible: true,
              title: 'TP',
            });
            newLines.push(tp);
          }
        });
    }

    // ── Pending Orders ──
    if (ordersData?.data) {
      ordersData.data
        .filter((o) => o.symbol === currentSymbol && o.status === 'PENDING')
        .forEach((order) => {
          const price = order.price;
          if (!price) return;
          const isBuy = (order.side as string) === 'BUY';
          const line = series.createPriceLine({
            price,
            color: isBuy ? '#00C896' : '#F6465D',
            lineWidth: 1,
            lineStyle: 3,
            axisLabelVisible: true,
            title: `ORD ${order.side}`,
          });
          newLines.push(line);
        });
    }

    linesRef.current = newLines;
  }, [showZones, showMarkers, zonesData, signalsData, positionsData, ordersData, currentSymbol]);

  useEffect(() => {
    // Re-render overlays whenever data or toggles change
    // Chart must exist first — guard against mount race
    const timer = setTimeout(renderOverlays, 50);
    return () => clearTimeout(timer);
  }, [renderOverlays]);

  // ─────────────────────────────────────────────
  // Replay playback timer
  // ─────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= 99) { setIsPlaying(false); return 99; }
          return prev + 1;
        });
      }, 1000 / replaySpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, replaySpeed]);

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────
  const handleScreenshot = () => {
    const canvas = chartContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `AlgoApp_${currentSymbol}_${currentTimeframe}_Chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleResetView = () => {
    chartApiRef.current?.timeScale().fitContent();
  };

  // Delta Exchange India TradingView symbol mapping
  const getTvDeltaSymbol = () => {
    // Delta Exchange India is listed on TradingView under DELTAINDIA prefix
    if (currentSymbol.startsWith('BTC')) return 'DELTAINDIA:BTCUSD';
    if (currentSymbol.startsWith('ETH')) return 'DELTAINDIA:ETHUSD';
    if (currentSymbol.startsWith('SOL')) return 'DELTAINDIA:SOLUSD';
    if (currentSymbol.startsWith('XRP')) return 'DELTAINDIA:XRPUSD';
    return `DELTAINDIA:${currentSymbol.replace('.P', '')}`;
  };

  // ─────────────────────────────────────────────
  // Derived display values for zone/signal badges
  // ─────────────────────────────────────────────
  const displayZones = zonesData?.data?.filter(
    (z) => z.symbol === currentSymbol && z.status !== 'CONSUMED' && z.status !== 'BROKEN'
  ) ?? [];

  const displaySignals = signalsData?.data?.filter(
    (s) => s.symbol === currentSymbol
  ).slice(0, 4) ?? [];

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: isFullscreen ? '100vh' : '100%', minHeight: '480px' }}
      className={`bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm font-mono text-xs ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'relative'}`}
    >
      {/* ── Chart Top Toolbar ── */}
      <div className="h-11 bg-[#0E121A] border-b border-[#1E293B] px-3 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-3">
          {/* Symbol */}
          <div className="flex items-center space-x-1.5 font-bold text-[#F8FAFC]">
            <BarChart2 className="w-4 h-4 text-[#3B82F6]" />
            <span>{currentSymbol}</span>
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider uppercase border ${
                wsState === 'CONNECTED'
                  ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30'
                  : wsState === 'RECONNECTING'
                  ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                  : 'bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30'
              }`}
            >
              {wsState === 'CONNECTED' ? '● LIVE' : wsState}
            </span>
          </div>

          {/* Timeframe Switchers */}
          <div className="flex items-center bg-[#161D2A] border border-[#1E293B] rounded p-0.5 space-x-0.5">
            {(['15M', '1H'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  currentTimeframe === tf
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#1E293B]" />

          {/* Visibility Toggles */}
          <div className="flex items-center space-x-1.5 text-[#94A3B8]">
            <button
              onClick={() => setShowZones(!showZones)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showZones ? 'bg-[#1E293B] text-[#00C896]' : 'hover:bg-[#1E293B]'
              }`}
              title="Toggle Supply/Demand Zones"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Zones</span>
            </button>
            <button
              onClick={() => setShowMarkers(!showMarkers)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showMarkers ? 'bg-[#1E293B] text-[#3B82F6]' : 'hover:bg-[#1E293B]'
              }`}
              title="Toggle BOS / CHoCH Markers"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>BOS/CHoCH</span>
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {isReplayActive && (
            <div className="flex items-center space-x-1 bg-[#161D2A] border border-[#1E293B] px-2 py-0.5 rounded text-[11px]">
              <button
                onClick={() => setReplayIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 hover:text-white text-[#94A3B8]"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1 rounded ${isPlaying ? 'bg-[#F59E0B] text-black' : 'bg-[#00C896] text-black'}`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setReplayIndex((prev) => Math.min(99, prev + 1))}
                className="p-1 hover:text-white text-[#94A3B8]"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <select
                value={replaySpeed}
                onChange={(e) => setReplaySpeed(Number(e.target.value))}
                className="bg-[#0E121A] border border-[#1E293B] rounded text-[10px] text-white px-1 py-0.5 ml-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
              </select>
            </div>
          )}

          {/* Chart Engine Switcher */}
          <div className="flex items-center bg-[#0B0E14] border border-[#1E293B] p-0.5 rounded text-[10px]">
            <button
              onClick={() => setChartEngine('TRADINGVIEW_LIVE')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                chartEngine === 'TRADINGVIEW_LIVE'
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Official TradingView Chart Widget (Delta Exchange India)"
            >
              TV LIVE (DELTA INDIA)
            </button>
            <button
              onClick={() => setChartEngine('LIGHTWEIGHT')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                chartEngine === 'LIGHTWEIGHT'
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Native SMC Lightweight Chart with Real Overlay Data"
            >
              NATIVE SMC
            </button>
          </div>

          <button
            onClick={handleScreenshot}
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded transition-colors"
            title="Take Chart Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded transition-colors"
            title="Reset Chart Zoom & Scale"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Main Workspace ── */}
      {chartEngine === 'TRADINGVIEW_LIVE' ? (
        <div className="relative flex-1 w-full h-full min-h-[380px] bg-[#0B0E14] overflow-hidden">
          <iframe
            key={`${currentSymbol}-${currentTimeframe}`}
            title="TradingView Live Delta India Chart"
            src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
              getTvDeltaSymbol()
            )}&interval=${currentTimeframe === '15M' ? '15' : '60'}&symboledit=1&saveimage=1&toolbarbg=0B0E14&theme=dark&style=1&timezone=Asia%2FKolkata&studies=%5B%5D&locale=en`}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            width: '100%',
            // Explicit pixel height — the ONLY reliable way to get Lightweight Charts to render.
            // flex/h-full chains are unreliable during initial paint. All pro terminals use this.
            height: `calc(100vh - 255px)`,
            minHeight: '400px',
            background: '#0B0E14',
            overflow: 'hidden',
          }}
        >
          {/* chartContainerRef gets explicit pixel dimensions via the parent's calc(100vh-255px) */}
          <div
            ref={chartContainerRef}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Real Supply/Demand Zone Badges */}
          {showZones && displayZones.length > 0 && (
            <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 pointer-events-none">
              {displayZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center space-x-2 border shadow-lg backdrop-blur-sm ${
                    zone.type === 'SUPPLY'
                      ? 'bg-[#F6465D]/15 border-[#F6465D]/40 text-[#F6465D]'
                      : 'bg-[#00C896]/15 border-[#00C896]/40 text-[#00C896]'
                  }`}
                >
                  <span className="font-bold">
                    {zone.type} ZONE [{zone.lowerPrice.toFixed(0)} – {zone.upperPrice.toFixed(0)}]
                  </span>
                  <span className="text-[10px] bg-[#0E121A] px-1.5 py-0.5 rounded text-[#94A3B8]">
                    {zone.status} • {zone.touchCount} Touches • {zone.freshness}% Fresh
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* No real zones: show "No Data" instead of fake values */}
          {showZones && displayZones.length === 0 && (
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#1E293B]/60 border border-[#1E293B] text-[#64748B]">
                Zones: No Data
              </div>
            </div>
          )}

          {/* Real BOS/CHoCH Signal Badges */}
          {showMarkers && displaySignals.length > 0 && (
            <div className="absolute top-3 right-3 z-10 flex flex-col space-y-1.5 pointer-events-none">
              {displaySignals.map((sig) => (
                <div
                  key={sig.id}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-[#1E293B]/90 border border-[#3B82F6]/40 text-[#3B82F6] flex items-center space-x-1 shadow-md"
                >
                  <Zap className="w-3 h-3 text-[#F59E0B]" />
                  <span className="font-bold">{sig.outcome}:</span>
                  <span>
                    {sig.timeframe} (${sig.price.toFixed(0)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* No real signals: show "No Data" instead of fake markers */}
          {showMarkers && displaySignals.length === 0 && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <div className="px-2 py-1 rounded text-[10px] font-mono bg-[#1E293B]/60 border border-[#1E293B] text-[#64748B]">
                Signals: No Data
              </div>
            </div>
          )}

          {/* Disconnected overlay — warn user when WS is down */}
          {wsState === 'DISCONNECTED' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-[#0E121A]/90 border border-[#F6465D]/40 rounded-lg px-6 py-4 text-center">
                <div className="text-[#F6465D] font-bold text-sm mb-1">● DISCONNECTED</div>
                <div className="text-[#94A3B8] text-xs">Delta Exchange WebSocket offline</div>
                <div className="text-[#64748B] text-[10px] mt-1">Prices shown are STALE</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
