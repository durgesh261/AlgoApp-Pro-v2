import React, { useState } from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { mockMarketPairs } from '../../mock/marketData';
import { 
  BarChart2, 
  Eye, 
  EyeOff, 
  Zap, 
  Target, 
  TrendingUp, 
  Layers,
  Maximize2,
  Activity,
  ShieldCheck
} from 'lucide-react';

export const InteractiveTradingChart: React.FC = () => {
  const { activeSymbol } = useTerminalStore();
  const pair = mockMarketPairs[activeSymbol] ?? mockMarketPairs['BTCUSD.P']!;

  const [showSupplyZones, setShowSupplyZones] = useState(true);
  const [showDemandZones, setShowDemandZones] = useState(true);
  const [showMergedZones, setShowMergedZones] = useState(true);
  const [showLevels, setShowLevels] = useState(true);
  const [showDecisionOverlay, setShowDecisionOverlay] = useState(true);

  // Simulated 1H Candlestick Data
  const candles = [
    { time: '14:00', open: 63800, high: 64100, low: 63750, close: 64050, isBull: true },
    { time: '15:00', open: 64050, high: 64300, low: 63900, close: 64200, isBull: true },
    { time: '16:00', open: 64200, high: 64450, low: 64150, close: 64380, isBull: true },
    { time: '17:00', open: 64380, high: 64500, low: 64100, close: 64150, isBull: false },
    { time: '18:00', open: 64150, high: 64350, low: 64000, close: 64280, isBull: true },
    { time: '19:00', open: 64280, high: 64600, low: 64250, close: 64550, isBull: true },
    { time: '20:00', open: 64550, high: 64800, low: 64400, close: 64700, isBull: true },
    { time: '21:00', open: 64700, high: 64750, low: 64100, close: 64250, isBull: false },
  ];

  const minPrice = 63600;
  const maxPrice = 65000;
  const range = maxPrice - minPrice;

  const getSvgY = (price: number) => {
    const height = 300;
    return height - ((price - minPrice) / range) * height;
  };

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm flex flex-col h-full select-none font-mono">
      {/* Chart Toolbar */}
      <div className="h-11 bg-[#0E121A] border-b border-[#1E293B] px-3 flex items-center justify-between text-xs shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold text-[#F8FAFC]">
            <BarChart2 className="w-4 h-4 text-[#3B82F6]" />
            <span>{pair.symbol}</span>
            <span className="text-[10px] bg-[#1E2638] text-[#3B82F6] px-1.5 py-0.5 rounded">1H</span>
          </div>

          <div className="h-4 w-px bg-[#1E293B]" />

          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-[#94A3B8]">PRICE:</span>
            <span className="font-bold text-[#F8FAFC] font-mono-tabular">{pair.price}</span>
            <span className={`font-semibold font-mono-tabular ${pair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
              {pair.change24h}
            </span>
          </div>
        </div>

        {/* TradingView Style Layer Toggles */}
        <div className="flex items-center space-x-1.5 text-[11px]">
          <button
            onClick={() => setShowSupplyZones(!showSupplyZones)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded border transition-colors ${
              showSupplyZones
                ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B] font-bold'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            {showSupplyZones ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>SUPPLY ZONE</span>
          </button>

          <button
            onClick={() => setShowDemandZones(!showDemandZones)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded border transition-colors ${
              showDemandZones
                ? 'bg-[#3B82F6]/15 border-[#3B82F6]/50 text-[#3B82F6] font-bold'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            {showDemandZones ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>DEMAND ZONE</span>
          </button>

          <button
            onClick={() => setShowMergedZones(!showMergedZones)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded border transition-colors ${
              showMergedZones
                ? 'bg-[#A855F7]/15 border-[#A855F7]/50 text-[#A855F7] font-bold'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>MERGED ZONE</span>
          </button>

          <button
            onClick={() => setShowLevels(!showLevels)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded border transition-colors ${
              showLevels
                ? 'bg-[#00C896]/15 border-[#00C896]/50 text-[#00C896] font-bold'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>SL/TP LEVELS</span>
          </button>

          <button
            onClick={() => setShowDecisionOverlay(!showDecisionOverlay)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded border transition-colors ${
              showDecisionOverlay
                ? 'bg-[#00C896]/15 border-[#00C896]/50 text-[#00C896] font-bold'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>DECISION</span>
          </button>

          <div className="h-4 w-px bg-[#1E293B]" />

          <button className="p-1 text-[#94A3B8] hover:text-white rounded hover:bg-[#1E2638]">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[#0B0E14] p-3 overflow-hidden min-h-[340px]">
        {/* SVG Chart Layer */}
        <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="none">
          {/* Background Grid Lines */}
          <line x1="0" y1="75" x2="700" y2="75" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1="0" y1="150" x2="700" y2="150" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1="0" y1="225" x2="700" y2="225" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

          {/* 1. Supply Zone (Resistance) Shaded Rectangle */}
          {showSupplyZones && (
            <g>
              <rect x="0" y={getSvgY(64800)} width="700" height="32" fill="rgba(245, 158, 11, 0.16)" />
              <line x1="0" y1={getSvgY(64800)} x2="700" y2={getSvgY(64800)} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="0" y1={getSvgY(64650)} x2="700" y2={getSvgY(64650)} stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" fill="none" />
              <text x="12" y={getSvgY(64800) + 16} fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SUPPLY ZONE ($64,650 – $64,800) | STRENGTH: 88/100 | TOUCHES: 2 | STATUS: TESTED
              </text>
            </g>
          )}

          {/* 2. Merged Zone Shaded Rectangle */}
          {showMergedZones && (
            <g>
              <rect x="0" y={getSvgY(64350)} width="700" height="28" fill="rgba(168, 85, 247, 0.16)" />
              <line x1="0" y1={getSvgY(64350)} x2="700" y2={getSvgY(64350)} stroke="#A855F7" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="12" y={getSvgY(64350) + 16} fill="#A855F7" fontSize="10" fontFamily="monospace" fontWeight="bold">
                MERGED ZONE ($64,200 – $64,350) | STRENGTH: 91/100 | SOURCE: PIT_LITE + LUXALGO
              </text>
            </g>
          )}

          {/* 3. Demand Zone (Support) Shaded Rectangle */}
          {showDemandZones && (
            <g>
              <rect x="0" y={getSvgY(63950)} width="700" height="38" fill="rgba(59, 130, 246, 0.16)" />
              <line x1="0" y1={getSvgY(63770)} x2="700" y2={getSvgY(63770)} stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="12" y={getSvgY(63950) + 20} fill="#3B82F6" fontSize="10" fontFamily="monospace" fontWeight="bold">
                DEMAND ZONE ($63,770 – $63,950) | STRENGTH: 94/100 | TOUCHES: 1 | STATUS: VALIDATED
              </text>
            </g>
          )}

          {/* 4. Order Level Overlays */}
          {showLevels && (
            <g>
              {/* Take Profit (TP) */}
              <line x1="0" y1={getSvgY(64850)} x2="700" y2={getSvgY(64850)} stroke="#00C896" strokeWidth="1.5" strokeDasharray="5 3" />
              <rect x="560" y={getSvgY(64850) - 14} width="130" height="18" fill="#00C896" rx="3" />
              <text x="566" y={getSvgY(64850) - 1} fill="#0B0E14" fontSize="10" fontFamily="monospace" fontWeight="bold">
                TP: $64,850.00 (R:R 1:2.8)
              </text>

              {/* Current Price Line */}
              <line x1="0" y1={getSvgY(64250)} x2="700" y2={getSvgY(64250)} stroke="#3B82F6" strokeWidth="1.5" />
              <rect x="560" y={getSvgY(64250) - 14} width="130" height="18" fill="#3B82F6" rx="3" />
              <text x="566" y={getSvgY(64250) - 1} fill="#FFFFFF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                MARK: $64,250.00
              </text>

              {/* Entry Price */}
              <line x1="0" y1={getSvgY(64150)} x2="700" y2={getSvgY(64150)} stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3 3" />
              <rect x="560" y={getSvgY(64150) - 14} width="130" height="18" fill="#06B6D4" rx="3" />
              <text x="566" y={getSvgY(64150) - 1} fill="#0B0E14" fontSize="10" fontFamily="monospace" fontWeight="bold">
                ENTRY: $64,150.00
              </text>

              {/* Stop Loss (SL) */}
              <line x1="0" y1={getSvgY(63650)} x2="700" y2={getSvgY(63650)} stroke="#F6465D" strokeWidth="1.5" strokeDasharray="5 3" />
              <rect x="560" y={getSvgY(63650) - 14} width="130" height="18" fill="#F6465D" rx="3" />
              <text x="566" y={getSvgY(63650) - 1} fill="#FFFFFF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SL: $63,650.00 (1.2%)
              </text>
            </g>
          )}

          {/* 5. Candlesticks */}
          {candles.map((c, idx) => {
            const x = 50 + idx * 80;
            const openY = getSvgY(c.open);
            const closeY = getSvgY(c.close);
            const highY = getSvgY(c.high);
            const lowY = getSvgY(c.low);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 4);
            const color = c.isBull ? '#00C896' : '#F6465D';

            return (
              <g key={c.time}>
                {/* Wick */}
                <line x1={x + 12} y1={highY} x2={x + 12} y2={lowY} stroke={color} strokeWidth="1.5" />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width="24"
                  height={bodyHeight}
                  fill={color}
                  rx="2"
                />
              </g>
            );
          })}
        </svg>

        {/* 6. TradingView Central Decision Workspace Badge Overlay */}
        {showDecisionOverlay && (
          <div className="absolute top-4 right-4 bg-[#161D2A]/90 backdrop-blur border border-[#00C896]/40 p-3 rounded-xl font-mono text-xs space-y-2 shadow-xl w-72">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
              <div className="flex items-center space-x-1.5 text-[#00C896] font-bold">
                <Zap className="w-4 h-4 text-[#00C896]" />
                <span>DECISION WORKSPACE</span>
              </div>
              <span className="text-[10px] bg-[#00C896]/20 text-[#00C896] px-1.5 py-0.5 rounded font-bold">
                BUY / LONG
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#0B0E14] border border-[#1E293B] p-1.5 rounded">
                <span className="text-[10px] text-[#94A3B8] block">CONFIDENCE</span>
                <span className="font-bold text-[#00C896] font-mono-tabular">94.5%</span>
              </div>
              <div className="bg-[#0B0E14] border border-[#1E293B] p-1.5 rounded">
                <span className="text-[10px] text-[#94A3B8] block">TARGET R:R</span>
                <span className="font-bold text-[#F8FAFC] font-mono-tabular">1 : 2.8</span>
              </div>
              <div className="bg-[#0B0E14] border border-[#1E293B] p-1.5 rounded">
                <span className="text-[10px] text-[#94A3B8] block">ZONE STRENGTH</span>
                <span className="font-bold text-[#3B82F6] font-mono-tabular">94 / 100</span>
              </div>
              <div className="bg-[#0B0E14] border border-[#1E293B] p-1.5 rounded">
                <span className="text-[10px] text-[#94A3B8] block">TOUCH COUNT</span>
                <span className="font-bold text-[#F59E0B] font-mono-tabular">1 TOUCH</span>
              </div>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-2 rounded text-[10px] space-y-1 text-[#94A3B8]">
              <span className="text-[#F8FAFC] font-bold block">CONFIRMED RULES:</span>
              <div className="flex items-center justify-between text-[#00C896]">
                <span>• FRESH_ZONE_CONFIRMED</span>
                <ShieldCheck className="w-3 h-3" />
              </div>
              <div className="flex items-center justify-between text-[#00C896]">
                <span>• MOMENTUM_ALIGNED</span>
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Status Bar */}
      <div className="h-8 bg-[#0E121A] border-t border-[#1E293B] px-3 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-[#00C896] font-bold">
            <TrendingUp className="w-3 h-3" /> MARKET STRUCTURE: BULLISH CONTINUATION
          </span>
          <span>|</span>
          <span>VOLUME: 14.2K BTC</span>
          <span>|</span>
          <span className="text-[#3B82F6] font-bold">3 ACTIVE ZONES OVERLAID</span>
        </div>
        <div className="flex items-center space-x-2 text-[#F8FAFC]">
          <Activity className="w-3 h-3 text-[#00C896]" />
          <span>LAST TICK: 2026-08-03 03:05:00 UTC</span>
        </div>
      </div>
    </div>
  );
};
