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
  Maximize2
} from 'lucide-react';

export const InteractiveTradingChart: React.FC = () => {
  const { activeSymbol } = useTerminalStore();
  const pair = mockMarketPairs[activeSymbol] ?? mockMarketPairs['BTCUSD.P']!;

  const [showSupplyZones, setShowSupplyZones] = useState(true);
  const [showDemandZones, setShowDemandZones] = useState(true);
  const [showLevels, setShowLevels] = useState(true);

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
    const height = 280;
    return height - ((price - minPrice) / range) * height;
  };

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm flex flex-col h-full select-none">
      {/* Chart Toolbar */}
      <div className="h-11 bg-[#0E121A] border-b border-[#1E293B] px-3 flex items-center justify-between font-mono text-xs shrink-0">
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

        {/* Layer Toggles */}
        <div className="flex items-center space-x-2 text-[11px]">
          <button
            onClick={() => setShowSupplyZones(!showSupplyZones)}
            className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
              showSupplyZones
                ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B]'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            {showSupplyZones ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>SUPPLY ZONE</span>
          </button>

          <button
            onClick={() => setShowDemandZones(!showDemandZones)}
            className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
              showDemandZones
                ? 'bg-[#3B82F6]/15 border-[#3B82F6]/50 text-[#3B82F6]'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            {showDemandZones ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>DEMAND ZONE</span>
          </button>

          <button
            onClick={() => setShowLevels(!showLevels)}
            className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
              showLevels
                ? 'bg-[#00C896]/15 border-[#00C896]/50 text-[#00C896]'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>SL/TP LEVELS</span>
          </button>

          <div className="h-4 w-px bg-[#1E293B]" />

          <button className="p-1 text-[#94A3B8] hover:text-white rounded hover:bg-[#1E2638]">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[#0B0E14] p-3 overflow-hidden min-h-[320px]">
        {/* SVG Chart Layer */}
        <svg className="w-full h-full" viewBox="0 0 700 280" preserveAspectRatio="none">
          {/* Background Grid Lines */}
          <line x1="0" y1="70" x2="700" y2="70" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1="0" y1="140" x2="700" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1="0" y1="210" x2="700" y2="210" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

          {/* Supply Zone Band */}
          {showSupplyZones && (
            <g>
              <rect x="0" y={getSvgY(64800)} width="700" height="32" fill="rgba(245, 158, 11, 0.12)" />
              <line x1="0" y1={getSvgY(64800)} x2="700" y2={getSvgY(64800)} stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4" />
              <text x="10" y={getSvgY(64800) + 16} fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SUPPLY ZONE ($64,650 – $64,800) [CONFIDENCE: 92%]
              </text>
            </g>
          )}

          {/* Demand Zone Band */}
          {showDemandZones && (
            <g>
              <rect x="0" y={getSvgY(63950)} width="700" height="36" fill="rgba(59, 130, 246, 0.12)" />
              <line x1="0" y1={getSvgY(63770)} x2="700" y2={getSvgY(63770)} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 4" />
              <text x="10" y={getSvgY(63950) + 20} fill="#3B82F6" fontSize="10" fontFamily="monospace" fontWeight="bold">
                DEMAND ZONE ($63,770 – $63,950) [RETEST APPROVED]
              </text>
            </g>
          )}

          {/* Order Levels Overlay */}
          {showLevels && (
            <g>
              {/* Take Profit */}
              <line x1="0" y1={getSvgY(64850)} x2="700" y2={getSvgY(64850)} stroke="#00C896" strokeWidth="1.5" strokeDasharray="5 3" />
              <text x="580" y={getSvgY(64850) - 4} fill="#00C896" fontSize="10" fontFamily="monospace" fontWeight="bold">
                TP: $64,850.00
              </text>

              {/* Entry Price */}
              <line x1="0" y1={getSvgY(64150)} x2="700" y2={getSvgY(64150)} stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="580" y={getSvgY(64150) - 4} fill="#3B82F6" fontSize="10" fontFamily="monospace" fontWeight="bold">
                ENTRY: $64,150.00
              </text>

              {/* Stop Loss */}
              <line x1="0" y1={getSvgY(63650)} x2="700" y2={getSvgY(63650)} stroke="#F6465D" strokeWidth="1.5" strokeDasharray="5 3" />
              <text x="580" y={getSvgY(63650) - 4} fill="#F6465D" fontSize="10" fontFamily="monospace" fontWeight="bold">
                SL: $63,650.00
              </text>
            </g>
          )}

          {/* Candlesticks */}
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

        {/* Floating Active Decision Badge */}
        <div className="absolute top-4 right-4 bg-[#161D2A]/90 backdrop-blur border border-[#00C896]/40 p-2.5 rounded-lg font-mono text-xs space-y-1 shadow-lg">
          <div className="flex items-center space-x-1.5 text-[#00C896] font-bold">
            <Zap className="w-3.5 h-3.5 text-[#00C896]" />
            <span>ACTIVE DECISION: BUY / LONG</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span>Confidence:</span>
            <span className="text-[#00C896] font-bold font-mono-tabular">94.5%</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span>Target R:R:</span>
            <span className="text-[#F8FAFC] font-bold font-mono-tabular">1 : 2.8</span>
          </div>
        </div>
      </div>

      {/* Chart Footer Status Bar */}
      <div className="h-8 bg-[#0E121A] border-t border-[#1E293B] px-3 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-[#00C896] font-bold">
            <TrendingUp className="w-3 h-3" /> MARKET STRUCTURE: BULLISH CONTINUATION
          </span>
          <span>|</span>
          <span>VOLUME: 14.2K BTC</span>
        </div>
        <div className="flex items-center space-x-2 text-[#F8FAFC]">
          <span>LAST TICK: 2026-08-03 02:45:00 UTC</span>
        </div>
      </div>
    </div>
  );
};
