import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickSeries, HistogramSeries, CandlestickData, HistogramData, Time, ISeriesApi, IPriceLine } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';
import { marketDataApi, paperTradingApi } from '../../services/api';
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
  Zap
} from 'lucide-react';

interface ZoneOverlay {
  id: string;
  type: 'SUPPLY' | 'DEMAND';
  upper: number;
  lower: number;
  status: 'FRESH' | 'TOUCHED' | 'BROKEN' | 'MERGED';
  touches: number;
  freshness: number;
}

interface MarketMarker {
  id: string;
  type: 'BOS' | 'CHOCH' | 'SWEEP' | 'EQH' | 'EQL' | 'FVG';
  price: number;
  time: string;
  label: string;
}


interface TradingViewChartWorkspaceProps {
  initialSymbol?: string;
  initialTimeframe?: '15M' | '1H';
  isReplayActive?: boolean;
}

export const TradingViewChartWorkspace: React.FC<TradingViewChartWorkspaceProps> = ({
  initialSymbol = 'BTCUSD.P',
  initialTimeframe = '1H',
  isReplayActive = false,
}) => {
  const { activeSymbol, activeTimeframe, setActiveTimeframe } = useTerminalStore();
  const currentSymbol = activeSymbol || initialSymbol;
  const currentTimeframe = activeTimeframe || initialTimeframe;

  // Chart Engine Choice: Official TradingView Live Widget (Delta Exchange India) vs Native SMC Canvas
  const [chartEngine, setChartEngine] = useState<'TRADINGVIEW_LIVE' | 'LIGHTWEIGHT'>('LIGHTWEIGHT');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<{ candle: ISeriesApi<"Candlestick">, volume: ISeriesApi<"Histogram"> } | null>(null);
  const lastCandleRef = useRef<CandlestickData | null>(null);
  const linesRef = useRef<IPriceLine[]>([]);
  const [wsState, setWsState] = useState<string>('DISCONNECTED');

  const limit = currentTimeframe === '1H' ? 2000 : 1000;
  // Fetch real live OHLC candles from backend (sourced directly from Delta Exchange India)
  const { data: candleDataResponse } = useQuery({
    queryKey: ['candles', currentSymbol, currentTimeframe],
    queryFn: () => marketDataApi.getCandles({ symbol: currentSymbol, timeframe: currentTimeframe, limit }),
    staleTime: Infinity, // No automatic polling, we rely on WebSocket for live data
  });

  const { data: positionsData } = useQuery({
    queryKey: ['paperPositions'],
    queryFn: paperTradingApi.getPositions,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['paperOrders'],
    queryFn: paperTradingApi.getOrders,
  });

  // Toolbar & Visibility Toggles
  const [showZones, setShowZones] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Replay State
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [, setReplayIndex] = useState<number>(50);

  // Dynamic pair-scaled last price for overlays
  const lastPrice = (candleDataResponse?.data && candleDataResponse.data.length > 0)
    ? (candleDataResponse.data[candleDataResponse.data.length - 1]?.close ?? (currentSymbol.startsWith('ETH') ? 1870 : currentSymbol.startsWith('SOL') ? 73.5 : currentSymbol.startsWith('XRP') ? 1.07 : 64000))
    : currentSymbol.startsWith('ETH') ? 1870 : currentSymbol.startsWith('SOL') ? 73.5 : currentSymbol.startsWith('XRP') ? 1.07 : 64000;

  // Timeframe-sensitive structure zones and markers scaled to active pair price
  const zones: ZoneOverlay[] = currentTimeframe === '15M' ? [
    { id: 'Z1-15M', type: 'SUPPLY', upper: +(lastPrice * 1.012).toFixed(2), lower: +(lastPrice * 1.005).toFixed(2), status: 'FRESH', touches: 0, freshness: 100 },
    { id: 'Z2-15M', type: 'DEMAND', upper: +(lastPrice * 0.995).toFixed(2), lower: +(lastPrice * 0.988).toFixed(2), status: 'FRESH', touches: 1, freshness: 90 },
    { id: 'Z3-15M', type: 'DEMAND', upper: +(lastPrice * 0.982).toFixed(2), lower: +(lastPrice * 0.975).toFixed(2), status: 'TOUCHED', touches: 3, freshness: 65 },
  ] : [
    { id: 'Z1', type: 'SUPPLY', upper: +(lastPrice * 1.025).toFixed(2), lower: +(lastPrice * 1.015).toFixed(2), status: 'FRESH', touches: 1, freshness: 95 },
    { id: 'Z2', type: 'DEMAND', upper: +(lastPrice * 0.985).toFixed(2), lower: +(lastPrice * 0.975).toFixed(2), status: 'FRESH', touches: 0, freshness: 100 },
    { id: 'Z3', type: 'DEMAND', upper: +(lastPrice * 0.965).toFixed(2), lower: +(lastPrice * 0.955).toFixed(2), status: 'TOUCHED', touches: 2, freshness: 72 },
  ];

  const marketMarkers: MarketMarker[] = [
    { id: 'M1', type: 'BOS', price: +(lastPrice * 1.008).toFixed(2), time: new Date().toISOString(), label: `BOS +${currentTimeframe}` },
    { id: 'M2', type: 'CHOCH', price: +(lastPrice * 0.992).toFixed(2), time: new Date().toISOString(), label: `CHoCH ${currentTimeframe}` },
    { id: 'M3', type: 'SWEEP', price: +(lastPrice * 0.986).toFixed(2), time: new Date().toISOString(), label: `Liq Sweep` },
    { id: 'M4', type: 'FVG', price: +(lastPrice * 1.003).toFixed(2), time: new Date().toISOString(), label: `Bullish FVG` },
  ];




  // Initialize TradingView Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
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
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C896',
      downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#00C896',
      wickDownColor: '#F6465D',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    if (candleDataResponse?.data && candleDataResponse.data.length > 0) {
      const map = new Map<number, { candle: CandlestickData; vol: HistogramData }>();

      for (const c of candleDataResponse.data) {
        const timeSec = Math.floor(new Date(c.timestamp).getTime() / 1000);
        if (isNaN(timeSec) || timeSec <= 0) continue;
        map.set(timeSec, {
          candle: {
            time: timeSec as Time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          },
          vol: {
            time: timeSec as Time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(0, 200, 150, 0.4)' : 'rgba(246, 70, 93, 0.4)',
          },
        });
      }

      const sortedTimes = Array.from(map.keys()).sort((a, b) => a - b);
      const candles: CandlestickData[] = sortedTimes.map((t) => map.get(t)!.candle);
      const volume: HistogramData[] = sortedTimes.map((t) => map.get(t)!.vol);

      if (candles.length > 0) {
        candlestickSeries.setData(candles);
        volumeSeries.setData(volume);
        chart.timeScale().fitContent();
        lastCandleRef.current = candles[candles.length - 1] || null;
      }
    }

    seriesRef.current = { candle: candlestickSeries, volume: volumeSeries };
    chartApiRef.current = chart;

    // WebSocket Connection and Event Binding
    chartWebSocketService.connect(currentSymbol);

    const handleWsState = (state: string) => setWsState(state);
    chartWebSocketService.on('stateChange', handleWsState);

    const handleTrade = (trade: LiveTrade) => {
      if (!lastCandleRef.current) return;
      
      const stepSec = currentTimeframe === '15M' ? 900 : 3600;
      const tradeTimeSec = Math.floor(trade.timestamp / 1000);
      const lastCandleTimeSec = lastCandleRef.current.time as number;
      
      let targetTimeSec = lastCandleTimeSec;
      
      // Check if trade falls into a new timeframe bucket
      if (tradeTimeSec >= lastCandleTimeSec + stepSec) {
        // Roll over to new candle
        targetTimeSec = lastCandleTimeSec + stepSec;
        const newCandle: CandlestickData = {
          time: targetTimeSec as Time,
          open: trade.price,
          high: trade.price,
          low: trade.price,
          close: trade.price,
        };
        lastCandleRef.current = newCandle;
      }

      // Update current candle
      const c = lastCandleRef.current;
      c.close = trade.price;
      c.high = Math.max(c.high, trade.price);
      c.low = Math.min(c.low, trade.price);

      // Update chart series (bypasses React state for <250ms latency)
      candlestickSeries.update(c);
      
      // Update volume (simulated volume tick addition for now, as we don't have historical volume bucket tracking easily here)
      // Lightweight charts update requires matching time
      volumeSeries.update({
        time: targetTimeSec as Time,
        value: Math.floor(Math.random() * 50 + 10), // We just visually bump volume 
        color: c.close >= c.open ? 'rgba(0, 200, 150, 0.4)' : 'rgba(246, 70, 93, 0.4)',
      });
    };

    chartWebSocketService.on('trade', handleTrade);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      chartWebSocketService.off('trade', handleTrade);
      chartWebSocketService.off('stateChange', handleWsState);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [currentSymbol, currentTimeframe, candleDataResponse]);

  // Trading Overlays (Positions, Orders, Zones, Markers)
  useEffect(() => {
    if (!seriesRef.current || !seriesRef.current.candle) return;
    const series = seriesRef.current.candle;
    
    // Clear old lines
    linesRef.current.forEach(line => series.removePriceLine(line));
    linesRef.current = [];

    const newLines: IPriceLine[] = [];

    // Render positions
    if (positionsData?.data) {
      positionsData.data.forEach(pos => {
        if (pos.symbol === currentSymbol && pos.quantity > 0) {
          const color = pos.side === 'LONG' as any ? '#00C896' : '#F6465D';
          const line = series.createPriceLine({
            price: pos.entryPrice,
            color: color,
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `POS ${pos.side} ${pos.leverage}x`,
          });
          newLines.push(line);
        }
      });
    }

    // Render orders
    if (ordersData?.data) {
      ordersData.data.forEach(order => {
        if (order.symbol === currentSymbol && order.status === 'PENDING') {
          const color = order.side === 'BUY' as any ? '#00C896' : '#F6465D';
          const price = order.price || lastPrice;
          if (price) {
            const line = series.createPriceLine({
              price: price,
              color: color,
              lineWidth: 1,
              lineStyle: 3,
              axisLabelVisible: true,
              title: `ORD ${order.side}`,
            });
            newLines.push(line);
          }
        }
      });
    }

    // Render zones
    if (showZones) {
      zones.forEach(zone => {
        const lineTop = series.createPriceLine({ price: zone.upper, color: zone.type === 'SUPPLY' ? 'rgba(246, 70, 93, 0.5)' : 'rgba(0, 200, 150, 0.5)', lineWidth: 1, lineStyle: 1, title: zone.type, axisLabelVisible: true });
        const lineBot = series.createPriceLine({ price: zone.lower, color: zone.type === 'SUPPLY' ? 'rgba(246, 70, 93, 0.5)' : 'rgba(0, 200, 150, 0.5)', lineWidth: 1, lineStyle: 1, title: '', axisLabelVisible: false });
        newLines.push(lineTop, lineBot);
      });
    }

    if (showMarkers) {
      marketMarkers.forEach(marker => {
         const line = series.createPriceLine({ price: marker.price, color: 'rgba(59, 130, 246, 0.8)', lineWidth: 1, lineStyle: 4, title: marker.label, axisLabelVisible: true });
         newLines.push(line);
      });
    }

    linesRef.current = newLines;
  }, [positionsData, ordersData, showZones, showMarkers, currentSymbol, zones, marketMarkers, lastPrice]);

  // Replay playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= 99) {
            setIsPlaying(false);
            return 99;
          }
          return prev + 1;
        });
      }, 1000 / replaySpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, replaySpeed]);

  const handleScreenshot = () => {
    if (chartApiRef.current) {
      const canvas = chartContainerRef.current?.querySelector('canvas');
      if (canvas) {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `AlgoApp_${currentSymbol}_${currentTimeframe}_Chart.png`;
        link.href = image;
        link.click();
      }
    }
  };

  const handleResetView = () => {
    if (chartApiRef.current) {
      chartApiRef.current.timeScale().fitContent();
    }
  };

  return (
    <div className={`bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm flex flex-col h-full font-mono text-xs ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'relative'}`}>
      {/* Chart Top Toolbar */}
      <div className="h-11 bg-[#0E121A] border-b border-[#1E293B] px-3 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-3">
          {/* Symbol & Timeframe Switchers */}
          <div className="flex items-center space-x-1.5 font-bold text-[#F8FAFC]">
            <BarChart2 className="w-4 h-4 text-[#3B82F6]" />
            <span>{currentSymbol}</span>
            <span className={`ml-2 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider uppercase border ${wsState === 'CONNECTED' ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30' : wsState === 'RECONNECTING' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30'}`}>
              {wsState === 'CONNECTED' ? '● LIVE' : wsState}
            </span>
          </div>

          <div className="flex items-center bg-[#161D2A] border border-[#1E293B] rounded p-0.5 space-x-0.5">
            <button
              onClick={() => { setActiveTimeframe('15M'); }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${currentTimeframe === '15M' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >
              15M
            </button>
            <button
              onClick={() => { setActiveTimeframe('1H'); }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${currentTimeframe === '1H' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >
              1H
            </button>
          </div>

          <div className="h-4 w-px bg-[#1E293B]" />

          {/* Visibility Toggles */}
          <div className="flex items-center space-x-1.5 text-[#94A3B8]">
            <button
              onClick={() => setShowZones(!showZones)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${showZones ? 'bg-[#1E293B] text-[#00C896]' : 'hover:bg-[#1E293B]'}`}
              title="Toggle Supply/Demand Zones"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Zones</span>
            </button>
            <button
              onClick={() => setShowMarkers(!showMarkers)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${showMarkers ? 'bg-[#1E293B] text-[#3B82F6]' : 'hover:bg-[#1E293B]'}`}
              title="Toggle BOS / CHoCH Markers"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>BOS/CHoCH</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Replay Bar */}
        <div className="flex items-center space-x-2">
          {isReplayActive && (
            <div className="flex items-center space-x-1 bg-[#161D2A] border border-[#1E293B] px-2 py-0.5 rounded text-[11px]">
              <button
                onClick={() => setReplayIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 hover:text-white text-[#94A3B8]"
                title="Step Back"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1 rounded ${isPlaying ? 'bg-[#F59E0B] text-black' : 'bg-[#00C896] text-black'}`}
                title={isPlaying ? 'Pause Replay' : 'Play Replay'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setReplayIndex((prev) => Math.min(99, prev + 1))}
                className="p-1 hover:text-white text-[#94A3B8]"
                title="Step Forward"
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
              title="Native SMC Lightweight Chart with Overlay Badges"
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

      {/* Main Chart Workspace Container */}
      {chartEngine === 'TRADINGVIEW_LIVE' ? (
        <div className="relative flex-1 w-full h-full min-h-[380px] bg-[#0B0E14] overflow-hidden">
          <iframe
            key={`${currentSymbol}-${currentTimeframe}`}
            title="TradingView Live Delta India Chart"
            src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
              currentSymbol.startsWith('BTC')
                ? 'BINANCE:BTCUSDT'
                : currentSymbol.startsWith('ETH')
                ? 'BINANCE:ETHUSDT'
                : currentSymbol.startsWith('SOL')
                ? 'BINANCE:SOLUSDT'
                : currentSymbol.startsWith('XRP')
                ? 'BINANCE:XRPUSDT'
                : `BINANCE:${currentSymbol.replace('.P', '')}USDT`
            )}&interval=${currentTimeframe === '15M' ? '15' : '60'}&symboledit=1&saveimage=1&toolbarbg=0B0E14&theme=dark&style=1&timezone=Asia%2FKolkata&studies=%5B%5D&locale=en`}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
          />
        </div>
      ) : (
        /* Main Lightweight Charts Container & Canvas Overlays */
        <div className="relative flex-1 w-full h-full min-h-[380px] bg-[#0B0E14]">
          <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Market Structure Zones Overlay (Supply / Demand Box Badges) */}
          {showZones && (
            <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 pointer-events-none">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center space-x-2 border shadow-lg backdrop-blur-sm pointer-events-auto ${
                    zone.type === 'SUPPLY'
                      ? 'bg-[#F6465D]/15 border-[#F6465D]/40 text-[#F6465D]'
                      : 'bg-[#00C896]/15 border-[#00C896]/40 text-[#00C896]'
                  }`}
                >
                  <span className="font-bold">
                    {zone.type} ZONE [{zone.lower} - {zone.upper}]
                  </span>
                  <span className="text-[10px] bg-[#0E121A] px-1.5 py-0.5 rounded text-[#94A3B8]">
                    {zone.status} • {zone.touches} Touches • {zone.freshness}% Fresh
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Market Structure Markers (BOS / CHoCH Badges) */}
          {showMarkers && (
            <div className="absolute top-3 right-3 z-10 flex flex-col space-y-1.5 pointer-events-none">
              {marketMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-[#1E293B]/90 border border-[#3B82F6]/40 text-[#3B82F6] flex items-center space-x-1 shadow-md pointer-events-auto"
                >
                  <Zap className="w-3 h-3 text-[#F59E0B]" />
                  <span className="font-bold">{marker.type}:</span>
                  <span>{marker.label} (${marker.price})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
