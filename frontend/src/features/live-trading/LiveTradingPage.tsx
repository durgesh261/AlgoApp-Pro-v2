import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  tradeAccountingApi, 
  executionApi,
  scannerApi 
} from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useMarketPairs, WATCHLIST_SYMBOLS } from '../../hooks/useMarketPairs';
import { useExecution } from '../../hooks/useExecution';
import { usePortfolioSummary } from '../../hooks/usePortfolioSummary';
import { useChartWebSocket } from '../../hooks/useChartWebSocket';
import { InteractiveTradingChart } from '../../components/charts/InteractiveTradingChart';
import { MarketScannerPanel } from './MarketScannerPanel';
import { 
  Activity, 
  Send,
  TrendingUp,
  XCircle,
  BookOpen,
  FileSpreadsheet,
  ListOrdered,
  ChevronDown,
  Plus,
  RefreshCw
} from 'lucide-react';

export const LiveTradingPage: React.FC = () => {
  const { 
    activeSymbol, 
    activeTimeframe, 
    setActiveSymbol, 
    setActiveTimeframe,
    liveTradingLeftColWidth,
    setLiveTradingLeftColWidth,
    liveTradingRightColWidth,
    setLiveTradingRightColWidth,
  } = useTerminalStore();
  const { pairs } = useMarketPairs();
  const { 
    placeOrder, 
    cancelOrder, 
    cancelAllOrders, 
    closePosition, 
    isPlacing, 
    isCancelling, 
    isCancellingAll, 
    isClosingPosition 
  } = useExecution();

  const { data: portfolioSummary } = usePortfolioSummary();

  // Splitter Resizing States
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const startDragLeftRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: 220 });
  const startDragRightRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: 320 });

  const handleLeftSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
    startDragLeftRef.current = {
      startX: e.clientX,
      startWidth: liveTradingLeftColWidth,
    };
  };

  const handleRightSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
    startDragRightRef.current = {
      startX: e.clientX,
      startWidth: liveTradingRightColWidth,
    };
  };

  useEffect(() => {
    if (!isDraggingLeft && !isDraggingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        const delta = e.clientX - startDragLeftRef.current.startX;
        setLiveTradingLeftColWidth(Math.max(160, Math.min(450, startDragLeftRef.current.startWidth + delta)));
      }
      if (isDraggingRight) {
        const delta = startDragRightRef.current.startX - e.clientX;
        setLiveTradingRightColWidth(Math.max(240, Math.min(550, startDragRightRef.current.startWidth + delta)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, setLiveTradingLeftColWidth, setLiveTradingRightColWidth]);

  // Tabbed Bottom Dock
  const [bottomTab, setBottomTab] = useState<'SCANNER' | 'RISK_CALC' | 'POSITIONS' | 'ORDERS' | 'HISTORY' | 'ACCOUNTING' | 'JOURNAL'>('SCANNER');

  // WebSocket Live Data
  const { state: wsState, ticker } = useChartWebSocket(activeSymbol);

  // Order Placement State
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [quantity, setQuantity] = useState('0.01');
  const [leverage, setLeverage] = useState(10);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  
  const [showTPSL, setShowTPSL] = useState(false);
  const [tpType, setTpType] = useState<'market' | 'limit'>('market');
  const [slType, setSlType] = useState<'market' | 'limit' | 'trail'>('market');
  const [customTpPct, setCustomTpPct] = useState('');
  const [customSlPct, setCustomSlPct] = useState('');

  const { data: scannerResponse } = useQuery({
    queryKey: ['scannerStatus'],
    queryFn: scannerApi.getStatus,
    refetchInterval: 3000,
  });

  const { data: ledgerData } = useQuery({
    queryKey: ['tradeLedger'],
    queryFn: () => tradeAccountingApi.getLedger(),
    refetchInterval: 4000,
  });

  const { data: journalData } = useQuery({
    queryKey: ['executionJournal'],
    queryFn: () => executionApi.getJournal(),
    refetchInterval: 4000,
  });

  const wallet = portfolioSummary?.wallet;
  const positions = portfolioSummary?.positions?.items || [];
  const orders = portfolioSummary?.orders?.items || [];
  const ledgerEntries = ledgerData?.data || [];
  const journalEntries = journalData?.data || [];

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder({
      symbol: activeSymbol,
      side: side === 'BUY' ? 'buy' : 'sell',
      orderType: orderType,
      size: parseFloat(quantity) || 0.01,
      price: orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : undefined,
      leverage,
      stopLossPrice: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfitPrice: takeProfit ? parseFloat(takeProfit) : undefined,
    });
  };

  const handleQuantityPercentage = (pct: number) => {
    const multiplier = pct / 100;
    const availableBalance = wallet?.availableMargin || 0;
    
    let assetPrice = 0;
    if (orderType === 'limit' && limitPrice && !isNaN(parseFloat(limitPrice))) {
      assetPrice = parseFloat(limitPrice);
    } else if (ticker?.markPrice) {
      assetPrice = ticker.markPrice;
    }
    
    if (assetPrice > 0 && availableBalance > 0) {
      // Use 98% buffer for 100% allocation to guarantee sufficient margin for fees/rounding
      const safeBuffer = pct === 100 ? 0.98 : 1.0;
      const maxNotional = availableBalance * leverage * safeBuffer;
      const maxQty = maxNotional / assetPrice;
      const rawQty = maxQty * multiplier;
      
      // Floor to 3 decimal places so it never rounds UP beyond available margin
      const flooredQty = (Math.floor(rawQty * 1000) / 1000).toFixed(3);
      setQuantity(flooredQty);
    } else {
      // Fallback if disconnected or missing data
      setQuantity((1 * multiplier).toFixed(3));
    }
  };

  const handleTpPercentage = (pctStr: string) => {
    let assetPrice = 0;
    if (orderType === 'limit' && limitPrice && !isNaN(parseFloat(limitPrice))) {
      assetPrice = parseFloat(limitPrice);
    } else if (ticker?.markPrice) {
      assetPrice = ticker.markPrice;
    }
    
    if (assetPrice > 0) {
      if (pctStr === '0') {
        setTakeProfit('');
        return;
      }
      const pct = parseFloat(pctStr) / 100;
      const targetPrice = side === 'BUY' 
        ? assetPrice * (1 + pct) 
        : assetPrice * (1 - pct);
      setTakeProfit(targetPrice.toFixed(2));
    }
  };

  const handleSlPercentage = (pctStr: string) => {
    let assetPrice = 0;
    if (orderType === 'limit' && limitPrice && !isNaN(parseFloat(limitPrice))) {
      assetPrice = parseFloat(limitPrice);
    } else if (ticker?.markPrice) {
      assetPrice = ticker.markPrice;
    }
    
    if (assetPrice > 0) {
      if (pctStr === '0') {
        setStopLoss('');
        return;
      }
      const pct = parseFloat(pctStr) / 100;
      const targetPrice = side === 'BUY' 
        ? assetPrice * (1 - pct) 
        : assetPrice * (1 + pct);
      setStopLoss(targetPrice.toFixed(2));
    }
  };

  const pnlBreakdown = portfolioSummary?.pnlBreakdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col p-3 space-y-3 bg-[#0B0E14] text-[#F8FAFC] overflow-y-auto"
    >
      {/* HEADER BAR: Symbol Title, Feed Status, Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg text-[#3B82F6]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base tracking-tight font-mono">
                {activeSymbol} Institutional Terminal
              </h1>
              {ticker && (
                <span className="font-mono font-bold text-sm text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">
                  ${ticker.markPrice.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8] font-sans mt-0.5">
              Source: Delta Exchange India (DELTAIN) · Feed: <span className={wsState === 'CONNECTED' ? "text-[#00C896] font-bold" : "text-[#F6465D]"}>{wsState}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[9px] font-bold">TOTAL EQUITY</span>
            <span className="text-white font-bold font-mono-tabular">
              ${wallet ? wallet.totalEquity.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[9px] font-bold">AVAIL MARGIN</span>
            <span className="text-white font-bold font-mono-tabular">
              ${wallet ? wallet.availableMargin.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[9px] font-bold">USED MARGIN</span>
            <span className="text-white font-bold font-mono-tabular">
              ${wallet ? wallet.positionMargin.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[9px] font-bold">UNREALIZED PNL</span>
            <span className={`font-bold font-mono-tabular ${portfolioSummary?.positions && portfolioSummary.positions.totalUnrealizedPnl >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
              {portfolioSummary?.positions ? `${portfolioSummary.positions.totalUnrealizedPnl >= 0 ? '+' : ''}$${portfolioSummary.positions.totalUnrealizedPnl.toFixed(2)}` : '$0.00'}
            </span>
          </div>
          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[9px] font-bold">TODAY PNL</span>
            <span className={`font-bold font-mono-tabular ${pnlBreakdown && pnlBreakdown.today >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
              {pnlBreakdown ? `${pnlBreakdown.today >= 0 ? '+' : ''}$${pnlBreakdown.today.toFixed(2)}` : '$0.00'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 min-w-0 min-h-[520px] lg:h-[calc(100vh-220px)] items-stretch">
        <div 
          style={{ width: `${liveTradingLeftColWidth}px` }}
          className="w-full lg:w-auto bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-3 min-w-[160px] max-w-[450px] shrink-0 overflow-y-auto"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6]" />
                Delta Watchlist
              </span>
            </div>
            {WATCHLIST_SYMBOLS.map((sym) => {
              const p = pairs[sym];
              const isActive = activeSymbol === sym;
              const symWithP = sym.endsWith('.P') ? sym : `${sym}.P`;
              const pairUserStatus = scannerResponse?.data?.pairStates?.[symWithP] || scannerResponse?.data?.pairs?.[symWithP]?.userStatus || 'RUNNING';
              return (
                <button
                  key={sym}
                  onClick={() => setActiveSymbol(sym)}
                  className={`w-full p-2 rounded-lg text-xs font-bold transition-all border flex flex-col gap-1 ${
                    isActive
                      ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/50 shadow-sm'
                      : 'bg-[#0B0E14] text-[#F8FAFC] border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <div className="w-full flex items-center justify-between gap-1 min-w-0">
                    <div className="flex items-center gap-1 min-w-0 truncate">
                      <span className="font-bold truncate text-[11px]">{sym}</span>
                      {pairUserStatus === 'PAUSED' && (
                        <span className="px-1 py-0.2 rounded text-[7px] bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-bold shrink-0">
                          PAUSED
                        </span>
                      )}
                      {pairUserStatus === 'STOPPED' && (
                        <span className="px-1 py-0.2 rounded text-[7px] bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase font-bold shrink-0">
                          STOPPED
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono-tabular font-bold text-slate-200 shrink-0">
                      {p ? p.priceLabel : '—'}
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between text-[10px] min-w-0">
                    <span className="text-[#64748B] font-mono truncate">PERP</span>
                    {p && (
                      <span className={`font-mono font-semibold shrink-0 ${p.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {p.changeLabel}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            <div className="pt-2 border-t border-[#1E293B] space-y-1.5">
              <div className="text-[10px] text-[#94A3B8] uppercase font-bold px-1">Active Timeframe</div>
              <div className="grid grid-cols-2 gap-2">
                {(['15M', '1H'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`py-1.5 text-xs font-bold rounded border transition-all ${
                      activeTimeframe === tf
                        ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                        : 'bg-[#0B0E14] text-[#94A3B8] border-[#1E293B] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          onMouseDown={handleLeftSplitterMouseDown}
          onDoubleClick={() => setLiveTradingLeftColWidth(220)}
          className={`hidden lg:flex w-2.5 mx-0.5 cursor-col-resize z-20 select-none items-center justify-center group transition-all shrink-0 ${
            isDraggingLeft ? 'bg-[#3B82F6]/30' : 'hover:bg-[#3B82F6]/20'
          }`}
          title="Drag to resize Watchlist column (Double-click to reset)"
        >
          <div className={`w-0.5 h-8 rounded transition-colors ${isDraggingLeft ? 'bg-[#3B82F6]' : 'bg-[#334155] group-hover:bg-[#3B82F6]'}`} />
        </div>

        <div className="flex-1 bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm flex flex-col min-w-[320px] w-full my-2 lg:my-0">
          <InteractiveTradingChart initialSymbol={activeSymbol} initialTimeframe={activeTimeframe} />
        </div>

        <div
          onMouseDown={handleRightSplitterMouseDown}
          onDoubleClick={() => setLiveTradingRightColWidth(320)}
          className={`hidden lg:flex w-2.5 mx-0.5 cursor-col-resize z-20 select-none items-center justify-center group transition-all shrink-0 ${
            isDraggingRight ? 'bg-[#3B82F6]/30' : 'hover:bg-[#3B82F6]/20'
          }`}
          title="Drag to resize AI / Order column (Double-click to reset)"
        >
          <div className={`w-0.5 h-8 rounded transition-colors ${isDraggingRight ? 'bg-[#3B82F6]' : 'bg-[#334155] group-hover:bg-[#3B82F6]'}`} />
        </div>

        <div 
          style={{ width: `${liveTradingRightColWidth}px` }}
          className="w-full lg:w-auto bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-2.5 min-w-[240px] max-w-[550px] shrink-0 overflow-y-auto"
        >
          <div className="space-y-2.5">
            {/* Order Entry Form */}
            <form onSubmit={handleOrderSubmit} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-1">
                <span className="text-[11px] font-bold text-[#F8FAFC]">
                  Execution — {activeSymbol}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setOrderType('market')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${orderType === 'market' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8]'}`}
                  >
                    MKT
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('limit')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${orderType === 'limit' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8]'}`}
                  >
                    LMT
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`py-1.5 font-bold rounded text-xs transition-all ${
                    side === 'BUY' ? 'bg-[#00C896] text-[#0B0E14]' : 'bg-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`py-1.5 font-bold rounded text-xs transition-all ${
                    side === 'SELL' ? 'bg-[#F6465D] text-white' : 'bg-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="text-[10px] text-[#94A3B8] block mb-0.5">Limit Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 98500"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-[#161D2A] border border-[#334155] text-white rounded p-1.5 text-xs font-mono focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-1">
                <div className="bg-[#161D2A] border border-[#334155] rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Enter Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-transparent text-white text-xs font-mono focus:outline-none w-full placeholder-[#475569]"
                    />
                    <div className="flex items-center space-x-1 text-[11px] text-white font-bold cursor-pointer shrink-0 ml-2">
                      <span>Lot</span>
                      <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 border-t border-[#334155] divide-x divide-[#334155]">
                    {[10, 25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        className="py-1 text-[10px] font-bold text-[#94A3B8] hover:bg-[#1E293B] hover:text-white transition-colors bg-[#1E2638]"
                        onClick={() => handleQuantityPercentage(pct)}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-[#475569] mt-1 px-1">
                  <span>~{activeSymbol.replace('USD.P', '')}</span>
                  <span>1 Lot = 0.01 {activeSymbol.replace('USD.P', '')}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#94A3B8] block mb-0.5">Leverage: {leverage}x</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
                  className="w-full accent-[#3B82F6]"
                />
              </div>

              {!showTPSL ? (
                <button
                  type="button"
                  onClick={() => setShowTPSL(true)}
                  className="w-full py-1.5 flex items-center justify-center space-x-2 bg-[#161D2A] hover:bg-[#1E2638] border border-[#334155] rounded-md text-[11px] font-bold text-[#F59E0B] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add TP/SL</span>
                </button>
              ) : (
                <div className="space-y-3 bg-[#161D2A] border border-[#334155] rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">Take Profit</span>
                    <div className="flex bg-[#0B0E14] rounded">
                      <button type="button" onClick={() => setTpType('market')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${tpType === 'market' ? 'text-[#F59E0B] bg-[#1E2638]' : 'text-[#94A3B8]'}`}>Market</button>
                      <button type="button" onClick={() => setTpType('limit')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${tpType === 'limit' ? 'text-[#F59E0B] bg-[#1E2638]' : 'text-[#94A3B8]'}`}>Limit</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8]">Trigger Price</label>
                    <div className="bg-[#0B0E14] border border-[#334155] rounded-md overflow-hidden">
                      <input type="number" step="0.1" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="Trigger Price USD" className="w-full bg-transparent text-white p-1.5 text-xs font-mono focus:outline-none placeholder-[#475569]" />
                      <div className="grid grid-cols-5 border-t border-[#334155] divide-x divide-[#334155]">
                        {['0.25', '0.5', '1', '2'].map(pct => (
                          <button key={pct} type="button" onClick={() => handleTpPercentage(pct)} className="py-1 text-[10px] font-bold text-[#94A3B8] hover:bg-[#1E2638] hover:text-white transition-colors">{pct}%</button>
                        ))}
                        <div className="flex items-center relative overflow-hidden bg-[#1E2638]">
                          <input 
                            type="number" 
                            step="0.1" 
                            value={customTpPct}
                            onChange={(e) => {
                              setCustomTpPct(e.target.value);
                              if (e.target.value) handleTpPercentage(e.target.value);
                            }}
                            className="w-full h-full bg-transparent text-center text-[10px] font-bold text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] pr-3 py-1"
                          />
                          <span className="absolute right-1 text-[10px] text-[#94A3B8] pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b border-[#334155] border-dashed my-1.5"></div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">Stop Loss</span>
                    <div className="flex bg-[#0B0E14] rounded">
                      <button type="button" onClick={() => setSlType('market')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${slType === 'market' ? 'text-[#F59E0B] bg-[#1E2638]' : 'text-[#94A3B8]'}`}>Market</button>
                      <button type="button" onClick={() => setSlType('limit')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${slType === 'limit' ? 'text-[#F59E0B] bg-[#1E2638]' : 'text-[#94A3B8]'}`}>Limit</button>
                      <button type="button" onClick={() => setSlType('trail')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${slType === 'trail' ? 'text-[#F59E0B] bg-[#1E2638]' : 'text-[#94A3B8]'}`}>Trail</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8]">Trigger Price</label>
                    <div className="bg-[#0B0E14] border border-[#334155] rounded-md overflow-hidden">
                      <input type="number" step="0.1" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="Trigger Price USD" className="w-full bg-transparent text-white p-1.5 text-xs font-mono focus:outline-none placeholder-[#475569]" />
                      <div className="grid grid-cols-5 border-t border-[#334155] divide-x divide-[#334155]">
                        {['0.25', '0.5', '1', '2'].map(pct => (
                          <button key={pct} type="button" onClick={() => handleSlPercentage(pct)} className="py-1 text-[10px] font-bold text-[#94A3B8] hover:bg-[#1E2638] hover:text-white transition-colors">{pct}%</button>
                        ))}
                        <div className="flex items-center relative overflow-hidden bg-[#1E2638]">
                          <input 
                            type="number" 
                            step="0.1" 
                            value={customSlPct}
                            onChange={(e) => {
                              setCustomSlPct(e.target.value);
                              if (e.target.value) handleSlPercentage(e.target.value);
                            }}
                            className="w-full h-full bg-transparent text-center text-[10px] font-bold text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] pr-3 py-1"
                          />
                          <span className="absolute right-1 text-[10px] text-[#94A3B8] pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1 text-[#94A3B8]">
                    <span className="border-b border-dashed border-[#475569]">Funds req.</span>
                    <RefreshCw className="w-3 h-3 text-[#F59E0B]" />
                  </div>
                  <span className="text-white font-bold font-mono">
                    {(() => {
                      let assetPrice = 0;
                      if (orderType === 'limit' && limitPrice && !isNaN(parseFloat(limitPrice))) {
                        assetPrice = parseFloat(limitPrice);
                      } else if (ticker?.markPrice) {
                        assetPrice = ticker.markPrice;
                      }
                      const req = (assetPrice * (parseFloat(quantity) || 0)) / leverage;
                      return req > 0 ? req.toFixed(2) : '0.00';
                    })()} USD
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#94A3B8]">Available Margin</span>
                  <span className="text-white font-bold font-mono">{wallet ? wallet.availableMargin.toFixed(2) : '0.00'} USD</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPlacing}
                className="w-full py-2.5 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] font-bold text-xs rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors mt-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPlacing ? 'EXECUTING ON DELTA...' : `SUBMIT ${side} ORDER`}</span>
              </button>
            </form>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2 rounded-lg text-[10px] text-[#94A3B8] space-y-0.5">
            <div className="flex justify-between"><span>Maker/Taker Rate:</span><span className="text-white font-bold">0.02% / 0.05%</span></div>
            <div className="flex justify-between"><span>Delta GST:</span><span className="text-[#00C896] font-bold">18% On Fees</span></div>
          </div>
        </div>

      </div>

      {/* BOTTOM PANE: UNIFIED EXECUTION & ACCOUNTING DOCK */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => setBottomTab('SCANNER')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'SCANNER' ? 'bg-indigo-600 text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>24/7 Market Scanner</span>
            </button>
            <button
              onClick={() => setBottomTab('RISK_CALC')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'RISK_CALC' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Risk & Leverage Calc</span>
            </button>
            <button
              onClick={() => setBottomTab('POSITIONS')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'POSITIONS' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Open Positions ({positions.length})</span>
            </button>
            <button
              onClick={() => setBottomTab('ORDERS')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'ORDERS' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Pending Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => setBottomTab('ACCOUNTING')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'ACCOUNTING' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Trade Accounting Ledger ({ledgerEntries.length})</span>
            </button>
            <button
              onClick={() => setBottomTab('JOURNAL')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'JOURNAL' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Execution Journal ({journalEntries.length})</span>
            </button>
          </div>

          {bottomTab === 'ORDERS' && orders.length > 0 && (
            <button
              onClick={() => cancelAllOrders()}
              disabled={isCancellingAll}
              className="px-2.5 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded text-[11px] font-bold transition-colors flex items-center space-x-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel All Orders</span>
            </button>
          )}
        </div>

        {/* Tab Contents: Scanner */}
        {bottomTab === 'SCANNER' && (
          <MarketScannerPanel />
        )}

        {/* Tab Contents: Dynamic Risk Calculator */}
        {bottomTab === 'RISK_CALC' && (
          <div className="bg-[#0B0E14] border border-[#1E293B] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Institutional Dynamic Risk & Leverage Calculator</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Calculates exact dynamic leverage (L = 0.35 / RiskDistance), 35% Stop Loss distance, and 60% Take Profit target (1.71x risk).
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded text-xs font-mono font-bold">
                Balance: ${wallet ? wallet.totalEquity.toFixed(2) : '1,000.00'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#121722] border border-[#1E293B] rounded-lg p-3 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Active Symbol</span>
                <span className="text-sm font-bold text-white font-mono block">{activeSymbol}</span>
              </div>
              <div className="bg-[#121722] border border-[#1E293B] rounded-lg p-3 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Stop Loss Risk</span>
                <span className="text-sm font-bold text-rose-400 font-mono block">-35.00% Account Risk</span>
              </div>
              <div className="bg-[#121722] border border-[#1E293B] rounded-lg p-3 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Take Profit Target</span>
                <span className="text-sm font-bold text-emerald-400 font-mono block">+60.00% Account Gain</span>
              </div>
              <div className="bg-[#121722] border border-[#1E293B] rounded-lg p-3 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Risk-to-Reward (R:R)</span>
                <span className="text-sm font-bold text-cyan-400 font-mono block">1 : 1.714</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Contents: Positions */}
        {bottomTab === 'POSITIONS' && (
          <div className="overflow-x-auto text-xs">
            {positions.length === 0 ? (
              <div className="text-center py-6 text-[#94A3B8]">No active open positions on Delta Exchange India.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Side</th>
                    <th className="py-2">Size</th>
                    <th className="py-2">Entry Price</th>
                    <th className="py-2">Mark Price</th>
                    <th className="py-2">Liq Price</th>
                    <th className="py-2">Unrealized PnL</th>
                    <th className="py-2">ROE %</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, idx) => (
                    <tr key={`${pos.symbol}-${idx}`} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14] text-[#F8FAFC]">
                      <td className="py-2.5 font-bold">{pos.symbol}</td>
                      <td className={`py-2.5 font-bold ${pos.side === 'buy' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.side.toUpperCase()}
                      </td>
                      <td className="py-2.5">{pos.size}</td>
                      <td className="py-2.5">${pos.entryPrice.toFixed(2)}</td>
                      <td className="py-2.5">${pos.markPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-[#F59E0B]">${pos.liquidationPrice ? pos.liquidationPrice.toFixed(2) : '—'}</td>
                      <td className={`py-2.5 font-bold ${pos.unrealizedPnl >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                      </td>
                      <td className={`py-2.5 font-bold ${pos.unrealizedPnl >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.roePercent ? `${pos.roePercent.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => closePosition(pos.symbol)}
                          disabled={isClosingPosition}
                          className="px-2.5 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded text-[11px] font-bold transition-colors"
                        >
                          CLOSE MARKET
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Contents: Orders */}
        {bottomTab === 'ORDERS' && (
          <div className="overflow-x-auto text-xs">
            {orders.length === 0 ? (
              <div className="text-center py-6 text-[#94A3B8]">No pending working orders.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                    <th className="py-2">Order ID</th>
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Side</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14] text-[#F8FAFC]">
                      <td className="py-2.5 font-bold">{ord.id}</td>
                      <td className="py-2.5 text-[#3B82F6]">{ord.symbol}</td>
                      <td className={`py-2.5 font-bold ${ord.side === 'buy' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {ord.side.toUpperCase()}
                      </td>
                      <td className="py-2.5 uppercase">{ord.orderType}</td>
                      <td className="py-2.5">${ord.price || 'MARKET'}</td>
                      <td className="py-2.5">{ord.size}</td>
                      <td className="py-2.5"><span className="bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded text-[10px]">{ord.state}</span></td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => cancelOrder(ord.id)}
                          disabled={isCancelling}
                          className="px-2 py-0.5 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded text-[10px] font-bold"
                        >
                          CANCEL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Contents: Accounting Ledger */}
        {bottomTab === 'ACCOUNTING' && (
          <div className="overflow-x-auto text-xs">
            {ledgerEntries.length === 0 ? (
              <div className="text-center py-6 text-[#94A3B8]">No completed trade accounting records yet. Completed trades calculate 18% GST and 0% TDS automatically.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                    <th className="py-2">Trade ID</th>
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Side</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Gross PnL</th>
                    <th className="py-2">Trading Fees</th>
                    <th className="py-2">18% GST</th>
                    <th className="py-2">TDS</th>
                    <th className="py-2">Net PnL</th>
                    <th className="py-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((item) => (
                    <tr key={item.id} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14] text-[#F8FAFC]">
                      <td className="py-2.5 font-bold text-[#94A3B8]">{item.tradeId}</td>
                      <td className="py-2.5 font-bold">{item.symbol}</td>
                      <td className={`py-2.5 font-bold ${item.side === 'LONG' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>{item.side}</td>
                      <td className="py-2.5">{item.quantity}</td>
                      <td className={`py-2.5 font-bold ${item.grossPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {item.grossPnL >= 0 ? '+' : ''}${item.grossPnL.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-[#F59E0B]">${item.tradingFee.toFixed(2)}</td>
                      <td className="py-2.5 text-[#F59E0B]">${(item.gstOnFees ?? 0).toFixed(2)}</td>
                      <td className="py-2.5 text-[#00C896]">$0.00 (0%)</td>
                      <td className={`py-2.5 font-bold ${item.netPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {item.netPnL >= 0 ? '+' : ''}${item.netPnL.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-[#94A3B8]">{new Date(item.executedAt || item.closedAt || Date.now()).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Contents: Execution Journal */}
        {bottomTab === 'JOURNAL' && (
          <div className="overflow-x-auto text-xs">
            {journalEntries.length === 0 ? (
              <div className="text-center py-6 text-[#94A3B8]">No execution journal events recorded yet.</div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {journalEntries.map((log) => (
                  <div key={log.id} className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded text-[10px] font-bold">{log.toState || log.action}</span>
                      <span className="text-white">{log.details || log.action}</span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
