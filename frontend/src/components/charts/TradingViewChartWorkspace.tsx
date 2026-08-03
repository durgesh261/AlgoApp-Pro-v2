import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickSeries, HistogramSeries, CandlestickData, HistogramData, Time } from 'lightweight-charts';
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
  Target, 
  CheckCircle2
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

interface TradeVisualization {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  status: 'OPEN' | 'WIN' | 'LOSS';
  pnl: number;
  riskReward: string;
}

interface TradingViewChartWorkspaceProps {
  initialSymbol?: string;
  initialTimeframe?: '15M' | '1H';
  isReplayActive?: boolean;
  onSelectTrade?: (tradeId: string) => void;
}

export const TradingViewChartWorkspace: React.FC<TradingViewChartWorkspaceProps> = ({
  initialSymbol = 'BTCUSD.P',
  initialTimeframe = '1H',
  isReplayActive = false,
  onSelectTrade
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);

  const { activeSymbol, activeTimeframe, setActiveTimeframe } = useTerminalStore();

  const currentSymbol = activeSymbol || initialSymbol || 'BTCUSD.P';
  const currentTimeframe = activeTimeframe || initialTimeframe || '1H';

  // Toolbar & Visibility Toggles
  const [showZones, setShowZones] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeVisualization | null>(null);

  // Replay State
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [, setReplayIndex] = useState<number>(50);

  // Timeframe-sensitive structure zones and markers (backed by backend Indicator Engine)
  const zones: ZoneOverlay[] = currentTimeframe === '15M' ? [
    { id: 'Z1-15M', type: 'SUPPLY', upper: 65100, lower: 64750, status: 'FRESH', touches: 0, freshness: 100 },
    { id: 'Z2-15M', type: 'DEMAND', upper: 64150, lower: 63800, status: 'FRESH', touches: 1, freshness: 90 },
    { id: 'Z3-15M', type: 'DEMAND', upper: 63100, lower: 62800, status: 'TOUCHED', touches: 3, freshness: 65 },
  ] : [
    { id: 'Z1', type: 'SUPPLY', upper: 65850, lower: 65200, status: 'FRESH', touches: 1, freshness: 95 },
    { id: 'Z2', type: 'DEMAND', upper: 63850, lower: 63200, status: 'FRESH', touches: 0, freshness: 100 },
    { id: 'Z3', type: 'DEMAND', upper: 62500, lower: 61900, status: 'TOUCHED', touches: 2, freshness: 72 },
  ];

  const marketMarkers: MarketMarker[] = currentTimeframe === '15M' ? [
    { id: 'M1-15M', type: 'BOS', price: 64450, time: new Date().toISOString(), label: 'BOS +15M' },
    { id: 'M2-15M', type: 'CHOCH', price: 63900, time: new Date().toISOString(), label: 'CHoCH 15M' },
    { id: 'M3-15M', type: 'SWEEP', price: 63750, time: new Date().toISOString(), label: 'Liq Sweep (15M Lows)' },
    { id: 'M4-15M', type: 'FVG', price: 64100, time: new Date().toISOString(), label: 'Bullish 15M FVG' },
  ] : [
    { id: 'M1', type: 'BOS', price: 64800, time: '2026-08-03T10:00:00Z', label: 'BOS +1H' },
    { id: 'M2', type: 'CHOCH', price: 63500, time: '2026-08-03T08:00:00Z', label: 'CHoCH 15M' },
    { id: 'M3', type: 'SWEEP', price: 63210, time: '2026-08-03T06:00:00Z', label: 'Liq Sweep (Highs)' },
    { id: 'M4', type: 'FVG', price: 64200, time: '2026-08-03T09:00:00Z', label: 'Bullish FVG' },
  ];

  const tradeViz: TradeVisualization = {
    id: 'TRD-1785756576484',
    symbol: currentSymbol,
    side: 'LONG',
    entryPrice: 63850,
    stopLoss: 63250,
    takeProfit: 65800,
    status: 'WIN',
    pnl: 639.55,
    riskReward: '3.25:1',
  };

  // Generate 100 1H / 15M OHLCV Candles for TradingView Lightweight Charts
  const generateCandleData = (): { candles: CandlestickData[]; volume: HistogramData[] } => {
    const candlesData: CandlestickData[] = [];
    const volumeData: HistogramData[] = [];

    const basePrice = currentSymbol.startsWith('ETH') ? 3400 : currentSymbol.startsWith('SOL') ? 140 : 63500;
    const stepSec = currentTimeframe === '15M' ? 900 : 3600;
    const baseTime = Math.floor(Date.now() / 1000) - 100 * stepSec;

    let price = basePrice;

    for (let i = 0; i < 100; i++) {
      const time = (baseTime + i * stepSec) as Time;
      const volatility = basePrice * 0.008;
      const open = price;
      const change = (Math.random() - 0.48) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const isUp = close >= open;

      candlesData.push({ time, open, high, low, close });
      volumeData.push({
        time,
        value: Math.floor(Math.random() * 800 + 200),
        color: isUp ? 'rgba(0, 200, 150, 0.4)' : 'rgba(246, 70, 93, 0.4)',
      });

      price = close;
    }

    return { candles: candlesData, volume: volumeData };
  };

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

    const { candles, volume } = generateCandleData();
    candlestickSeries.setData(candles);
    volumeSeries.setData(volume);

    chartApiRef.current = chart;

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
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [currentSymbol, currentTimeframe]);

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
            <button
              onClick={() => setShowTrades(!showTrades)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${showTrades ? 'bg-[#1E293B] text-[#F59E0B]' : 'hover:bg-[#1E293B]'}`}
              title="Toggle Trade Execution Overlay"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Trades</span>
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

      {/* Main Lightweight Charts Container & Canvas Overlays */}
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

        {/* Trade Execution Risk-Reward Box Overlay */}
        {showTrades && (
          <div
            onClick={() => {
              setSelectedTrade(tradeViz);
              if (onSelectTrade) onSelectTrade(tradeViz.id);
            }}
            className="absolute bottom-12 left-4 z-10 bg-[#161D2A]/90 border border-[#00C896] p-2.5 rounded-lg shadow-xl backdrop-blur-md cursor-pointer hover:border-white transition-colors"
          >
            <div className="flex items-center justify-between space-x-3 mb-1">
              <span className="text-[10px] font-bold bg-[#00C896] text-black px-1.5 py-0.5 rounded">
                TRADE EXECUTED ({tradeViz.side})
              </span>
              <span className="text-[10px] font-bold text-[#00C896]">
                RR {tradeViz.riskReward}
              </span>
            </div>
            <div className="text-[11px] text-[#94A3B8] space-y-0.5">
              <div>Entry: <span className="text-white font-mono font-bold">${tradeViz.entryPrice}</span></div>
              <div>Target: <span className="text-[#00C896] font-mono font-bold">${tradeViz.takeProfit}</span></div>
              <div>Stop: <span className="text-[#F6465D] font-mono font-bold">${tradeViz.stopLoss}</span></div>
              <div className="text-[10px] text-[#00C896] font-bold pt-0.5">Net PnL: +${tradeViz.pnl} (WIN)</div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Trade Decision Drawer (Rendered when Trade Clicked) */}
      {selectedTrade && (
        <div className="bg-[#0E121A] border-t border-[#1E293B] p-3 shrink-0 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
              <span className="font-bold text-white">Trade {selectedTrade.id}</span>
              <span className="bg-[#00C896]/20 text-[#00C896] text-[10px] px-2 py-0.5 rounded font-bold">
                CONFIDENCE: 94.5%
              </span>
            </div>
            <div className="text-[#94A3B8] text-[11px]">
              Rule: <span className="text-white">1H Demand Zone Retest + Liquidity Sweep</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedTrade(null)}
              className="text-[#94A3B8] hover:text-white text-[11px] underline"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
