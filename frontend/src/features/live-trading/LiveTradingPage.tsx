import React, { useState, useEffect, useRef } from 'react';
import { toISTTime } from '../../utils/time';
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
import { ExecutionPanel } from '../../components/execution/ExecutionPanel';
import { 
  Activity, 
  FileSpreadsheet,
  Terminal,
  BookOpen
} from 'lucide-react';

export const LiveTradingPage: React.FC = () => {
  const { 
    activeSymbol, 
    activeTimeframe, 
    setActiveSymbol, 
    liveTradingLeftColWidth,
    setLiveTradingLeftColWidth,
    liveTradingRightColWidth,
    setLiveTradingRightColWidth,
  } = useTerminalStore();
  const { pairs } = useMarketPairs();
  const { 
    cancelOrder, 
    cancelAllOrders, 
    closePosition, 
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
  const [bottomTab, setBottomTab] = useState<'SCANNER' | 'RISK_CALC' | 'TERMINAL' | 'JOURNAL'>('SCANNER');

  // WebSocket Live Data
  const { state: wsState } = useChartWebSocket(activeSymbol);

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

  const positions = portfolioSummary?.positions?.items || [];
  const orders = portfolioSummary?.orders?.items || [];
  const ledgerEntries = ledgerData?.data || [];
  const journalEntries = journalData?.data || [];

  return (
    <div className="h-full flex flex-col p-2 bg-[#0B0E14] text-[#F8FAFC] font-mono text-xs overflow-hidden">
      
      {/* TOP PANE: TRADING WORKSPACE */}
      <div className="flex-1 flex min-h-0 relative mb-2">
        
        {/* Left Watchlist Sidebar */}
        <div 
          style={{ width: `${liveTradingLeftColWidth}px` }} 
          className="hidden lg:flex bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 flex-col shrink-0 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3 border-b border-[#1E293B] pb-2">
            <span className="font-bold text-[#F8FAFC]">Watchlist</span>
            <div className={`w-2 h-2 rounded-full ${wsState === 'connected' ? 'bg-[#00C896] animate-pulse' : 'bg-[#EF4444]'}`} />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {WATCHLIST_SYMBOLS.map(symbol => {
              const pair: any = Object.values(pairs || {}).find((p: any) => p.symbol === symbol);
              const isActive = activeSymbol === symbol;
              const priceClass = !pair ? 'text-[#94A3B8]' : (pair.priceChangePercent >= 0 ? 'text-[#00C896]' : 'text-[#EF4444]');
              
              return (
                <button
                  key={symbol}
                  onClick={() => setActiveSymbol(symbol)}
                  className={`w-full text-left px-2 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    isActive ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/30' : 'hover:bg-[#1E293B] border border-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-bold ${isActive ? 'text-white' : 'text-[#94A3B8]'}`}>
                      {symbol.replace('USD.P', '')}
                    </span>
                    <span className="text-[9px] text-[#64748B]">Perpetual</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-mono font-bold ${priceClass}`}>
                      {pair ? pair.markPrice.toFixed(2) : '---'}
                    </span>
                    <span className={`text-[9px] ${priceClass}`}>
                      {pair ? `${pair.priceChangePercent >= 0 ? '+' : ''}${pair.priceChangePercent.toFixed(2)}%` : '---'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resizer Left */}
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
          <InteractiveTradingChart initialSymbol={activeSymbol} initialTimeframe={activeTimeframe as '1H'} />
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
          className="w-full lg:w-auto flex flex-col justify-between shadow-sm space-y-2.5 min-w-[240px] max-w-[550px] shrink-0 overflow-y-auto"
        >
          <div className="space-y-2.5">
            <ExecutionPanel />
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
                bottomTab === 'SCANNER' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
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
              onClick={() => setBottomTab('TERMINAL')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'TERMINAL' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Terminal</span>
            </button>
            <button
              onClick={() => setBottomTab('JOURNAL')}
              className={`flex items-center space-x-1 px-3 py-1 rounded font-bold transition-colors ${
                bottomTab === 'JOURNAL' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Execution Journal</span>
            </button>
          </div>
        </div>

        <div className="h-[250px] overflow-y-auto">
          {bottomTab === 'SCANNER' && (
            <MarketScannerPanel />
          )}

          {bottomTab === 'RISK_CALC' && (
            <div className="flex items-center justify-center h-full text-[#94A3B8]">
              Risk Calculator Module
            </div>
          )}

          {bottomTab === 'TERMINAL' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-[#F8FAFC] mb-2 uppercase tracking-wider">Open Positions ({positions.length})</h4>
                {positions.length === 0 ? (
                  <div className="text-center py-4 text-[#94A3B8] text-[10px] bg-[#0B0E14] border border-[#1E293B] rounded">No open positions</div>
                ) : (
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-[#0B0E14] border border-[#1E293B]">
                        <th className="p-1.5 font-bold">Symbol</th>
                        <th className="p-1.5 font-bold">Side</th>
                        <th className="p-1.5 font-bold">Size</th>
                        <th className="p-1.5 font-bold">Entry Price</th>
                        <th className="p-1.5 font-bold">Mark Price</th>
                        <th className="p-1.5 font-bold">Unrealized PNL</th>
                        <th className="p-1.5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos: any, idx: number) => (
                        <tr key={idx} className="border-b border-[#1E293B] hover:bg-[#0B0E14] transition-colors">
                          <td className="p-1.5 font-bold text-white">{pos.symbol}</td>
                          <td className={`p-1.5 font-bold ${pos.side.toLowerCase() === 'buy' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>{pos.side.toUpperCase()}</td>
                          <td className="p-1.5 font-mono">{pos.size}</td>
                          <td className="p-1.5 font-mono">{pos.entryPrice?.toFixed(2)}</td>
                          <td className="p-1.5 font-mono">{pos.markPrice?.toFixed(2)}</td>
                          <td className={`p-1.5 font-mono font-bold ${pos.unrealizedPnl >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                            {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl?.toFixed(2)}
                          </td>
                          <td className="p-1.5 text-right">
                            <button
                              onClick={() => closePosition(pos.symbol)}
                              disabled={isClosingPosition}
                              className="px-2 py-0.5 bg-[#F6465D]/10 hover:bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/30 rounded transition-colors"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold text-[#F8FAFC] mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Working Orders ({orders.length})</span>
                  {orders.length > 0 && (
                    <button 
                      onClick={() => cancelAllOrders()}
                      disabled={isCancellingAll}
                      className="text-[9px] px-2 py-0.5 bg-[#F6465D] text-white rounded hover:bg-[#DC2626]"
                    >
                      Cancel All
                    </button>
                  )}
                </h4>
                {orders.length === 0 ? (
                  <div className="text-center py-4 text-[#94A3B8] text-[10px] bg-[#0B0E14] border border-[#1E293B] rounded">No active orders</div>
                ) : (
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-[#0B0E14] border border-[#1E293B]">
                        <th className="p-1.5 font-bold">Time</th>
                        <th className="p-1.5 font-bold">Symbol</th>
                        <th className="p-1.5 font-bold">Type</th>
                        <th className="p-1.5 font-bold">Side</th>
                        <th className="p-1.5 font-bold">Price</th>
                        <th className="p-1.5 font-bold">Size</th>
                        <th className="p-1.5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord: any) => (
                        <tr key={ord.id} className="border-b border-[#1E293B] hover:bg-[#0B0E14] transition-colors">
                          <td className="p-1.5 font-mono text-[#94A3B8]">{toISTTime(new Date(ord.createdAt))}</td>
                          <td className="p-1.5 font-bold text-white">{ord.symbol}</td>
                          <td className="p-1.5 font-mono">{ord.orderType}</td>
                          <td className={`p-1.5 font-bold ${ord.side.toLowerCase() === 'buy' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>{ord.side.toUpperCase()}</td>
                          <td className="p-1.5 font-mono">{ord.price || ord.stopPrice}</td>
                          <td className="p-1.5 font-mono">{ord.unfilledSize}</td>
                          <td className="p-1.5 text-right">
                            <button
                              onClick={() => cancelOrder(ord.id)}
                              disabled={isCancelling}
                              className="px-2 py-0.5 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {bottomTab === 'JOURNAL' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-[#F8FAFC] mb-2 uppercase tracking-wider">Execution Journal</h4>
                {journalEntries.length === 0 ? (
                  <div className="text-center py-4 text-[#94A3B8] text-[10px] bg-[#0B0E14] border border-[#1E293B] rounded">No journal entries found</div>
                ) : (
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-[#0B0E14] border border-[#1E293B]">
                        <th className="p-1.5 font-bold">Time</th>
                        <th className="p-1.5 font-bold">Symbol</th>
                        <th className="p-1.5 font-bold">Type</th>
                        <th className="p-1.5 font-bold">Side</th>
                        <th className="p-1.5 font-bold">Price</th>
                        <th className="p-1.5 font-bold">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journalEntries.map((log: any, i: number) => (
                        <tr key={i} className="border-b border-[#1E293B] hover:bg-[#0B0E14] transition-colors">
                          <td className="p-1.5 font-mono text-[#94A3B8]">{toISTTime(new Date(log.timestamp))}</td>
                          <td className="p-1.5 font-bold text-white">{log.symbol}</td>
                          <td className="p-1.5 font-mono">{log.orderType}</td>
                          <td className={`p-1.5 font-bold ${log.side?.toLowerCase() === 'buy' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>{log.side?.toUpperCase()}</td>
                          <td className="p-1.5 font-mono">{log.price || 'MKT'}</td>
                          <td className="p-1.5 font-mono">{log.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
