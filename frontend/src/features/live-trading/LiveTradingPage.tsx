import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperTradingApi, decisionApi, deltaApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { InteractiveTradingChart } from '../../components/charts/InteractiveTradingChart';
import { 
  Activity, 
  Brain, 
  Send, 
  TrendingUp
} from 'lucide-react';

const SUPPORTED_PAIRS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

export const LiveTradingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol, activeTimeframe, setActiveSymbol, setActiveTimeframe } = useTerminalStore();
  const { addToast } = useToastStore();

  // Tabbed Bottom Dock
  const [bottomTab, setBottomTab] = useState<'POSITIONS' | 'ORDERS' | 'HISTORY' | 'JOURNAL'>('POSITIONS');

  // Order Placement State
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState('0.01');
  const [leverage, setLeverage] = useState(10);

  // Queries for live state
  const { data: walletData } = useQuery({
    queryKey: ['paperWallet'],
    queryFn: paperTradingApi.getWallet,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['paperPositions'],
    queryFn: paperTradingApi.getPositions,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['paperOrders'],
    queryFn: paperTradingApi.getOrders,
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['decisionLogs'],
    queryFn: decisionApi.getLogs,
  });

  const { data: deltaHealth } = useQuery({
    queryKey: ['deltaHealth'],
    queryFn: deltaApi.getHealth,
  });

  const orderMutation = useMutation({
    mutationFn: paperTradingApi.createOrder,
    onSuccess: (res) => {
      addToast('Delta Order Executed', `Live Order ${res.data.id} submitted for ${res.data.symbol}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['paperWallet'] });
      queryClient.invalidateQueries({ queryKey: ['paperPositions'] });
      queryClient.invalidateQueries({ queryKey: ['paperOrders'] });
    },
  });

  const closePositionMutation = useMutation({
    mutationFn: ({ id, exitPrice }: { id: string; exitPrice: number }) =>
      paperTradingApi.closePosition(id, exitPrice),
    onSuccess: (res) => {
      addToast('Position Closed', `Closed ${res.data.symbol} position.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['paperPositions'] });
      queryClient.invalidateQueries({ queryKey: ['paperWallet'] });
    },
  });

  const wallet = walletData?.data;
  const positions = positionsData?.data || [];
  const orders = ordersData?.data || [];
  const decisions = decisionsData?.data || [];
  const latestDecision = decisions[0];
  const isDeltaConnected = deltaHealth?.data?.connectionState === 'CONNECTED';

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    orderMutation.mutate({
      symbol: activeSymbol,
      side: side as any,
      orderType: orderType as any,
      quantity: parseFloat(quantity),
      leverage,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 max-w-[1920px] mx-auto pb-6 font-mono select-none overflow-x-hidden"
    >
      {/* Workstation Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3 bg-[#161D2A] p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-[#00C896]" />
          <div>
            <h1 className="text-lg font-bold text-[#F8FAFC]">
              Professional Live Trading Terminal — {activeSymbol} ({activeTimeframe})
            </h1>
            <div className="flex items-center space-x-2 text-xs text-[#94A3B8] mt-0.5">
              <span>Source of Truth: <strong className="text-[#00C896]">Delta Exchange India</strong></span>
              <span>•</span>
              <span>Status: <strong className={isDeltaConnected ? 'text-[#00C896]' : 'text-[#94A3B8]'}>{isDeltaConnected ? `CONNECTED (${deltaHealth?.data?.wsLatencyMs || 5.5}ms)` : 'DISCONNECTED'}</strong></span>
            </div>
          </div>
        </div>

        {/* Live Gauges Summary */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[10px]">DELTA BALANCE</span>
            <span className="text-white font-bold font-mono-tabular">
              ${isDeltaConnected && wallet ? wallet.virtualBalance.toFixed(2) : '0.00'}
            </span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[10px]">AVAILABLE MARGIN</span>
            <span className="text-[#00C896] font-bold font-mono-tabular">
              ${isDeltaConnected && wallet ? wallet.availableMargin.toFixed(2) : '0.00'}
            </span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[10px]">USED MARGIN</span>
            <span className="text-[#F59E0B] font-bold font-mono-tabular">
              ${isDeltaConnected && wallet ? wallet.usedMargin.toFixed(2) : '0.00'}
            </span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[10px]">UNREALIZED PNL</span>
            <span className={`font-bold font-mono-tabular ${isDeltaConnected && wallet && wallet.unrealizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
              {isDeltaConnected && wallet ? `${wallet.unrealizedPnL >= 0 ? '+' : ''}$${wallet.unrealizedPnL.toFixed(2)}` : '$0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* 4-PANE UNIFIED TRADING TERMINAL LAYOUT */}
      <div className="grid grid-cols-12 gap-3 min-w-0 h-[calc(100vh-210px)] min-h-[680px]">
        
        {/* LEFT PANE: MARKET WATCH & PAIR SELECTOR (Cols 2) */}
        <div className="col-span-12 lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-3 min-w-0 overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
                Market Watch
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] text-[#94A3B8] uppercase font-bold px-1">Perpetual Pairs</div>
              {SUPPORTED_PAIRS.map((pair) => (
                <button
                  key={pair}
                  onClick={() => setActiveSymbol(pair)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${
                    activeSymbol === pair
                      ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/50'
                      : 'bg-[#0B0E14] text-[#F8FAFC] border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <span>{pair}</span>
                  {activeSymbol === pair ? (
                    <span className="text-[9px] bg-[#3B82F6] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      OPEN CHART
                    </span>
                  ) : (
                    <span className={`text-[10px] ${isDeltaConnected ? 'text-[#00C896]' : 'text-[#94A3B8]'}`}>{isDeltaConnected ? 'LIVE' : 'OFF'}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#1E293B] space-y-1.5">
              <div className="text-[10px] text-[#94A3B8] uppercase font-bold px-1">Timeframe</div>
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

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-[10px] space-y-1">
            <div className="flex justify-between text-[#94A3B8]"><span>Market Session:</span><span className="text-white font-bold">New York</span></div>
            <div className="flex justify-between text-[#94A3B8]"><span>Delta Feed:</span><span className={isDeltaConnected ? 'text-[#00C896] font-bold' : 'text-[#94A3B8] font-bold'}>{isDeltaConnected ? 'Healthy' : 'Disconnected'}</span></div>
          </div>
        </div>

        {/* CENTER PANE: TRADINGVIEW CHART WORKSPACE (Cols 7) */}
        <div className="col-span-12 lg:col-span-7 bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm flex flex-col min-w-0 w-full">
          <InteractiveTradingChart initialSymbol={activeSymbol} initialTimeframe={activeTimeframe} />
        </div>

        {/* RIGHT PANE: AI DECISION ENGINE & ORDER ENTRY (Cols 3) */}
        <div className="col-span-12 lg:col-span-3 bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-3 min-w-0 overflow-hidden">
          <div className="space-y-3">
            {/* AI Decision Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#00C896]" />
                <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">AI Decision Panel</h2>
              </div>
              <span className="text-[10px] bg-[#00C896]/20 text-[#00C896] px-2 py-0.5 rounded font-bold">
                {latestDecision ? `CONFIDENCE: ${latestDecision.confidenceScore.toFixed(1)}%` : 'No Data'}
              </span>
            </div>

            {/* Decision Details */}
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Signal State:</span>
                <span className="text-[#00C896] font-bold">{latestDecision?.decisionState ?? 'No Data'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Rule Verification:</span>
                <span className="text-white font-bold">{activeTimeframe} Retest Gate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Strategy Profile:</span>
                <span className="text-[#3B82F6] font-bold">Default {activeTimeframe} Profile</span>
              </div>
            </div>

            {/* Order Entry Form */}
            <form onSubmit={handleOrderSubmit} className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-[#F8FAFC] border-b border-[#1E293B] pb-1">
                Order Execution Panel — {activeSymbol}
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

              <div>
                <label className="text-[10px] text-[#94A3B8] block mb-0.5">Quantity ({activeSymbol})</label>
                <input
                  type="number"
                  step="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#161D2A] border border-[#334155] text-white rounded p-1.5 text-xs font-mono focus:border-[#3B82F6] focus:outline-none"
                />
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

              <button
                type="submit"
                disabled={orderMutation.isPending}
                className="w-full py-2.5 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] font-bold text-xs rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{orderMutation.isPending ? 'EXECUTING...' : `SUBMIT ${side} ORDER`}</span>
              </button>
            </form>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-[10px] text-[#94A3B8] space-y-1">
            <div className="flex justify-between"><span>Max Risk (1.5%):</span><span className="text-[#F59E0B] font-bold">${isDeltaConnected && wallet ? (wallet.equity * 0.015).toFixed(2) : '0.00'}</span></div>
            <div className="flex justify-between"><span>Execution Mode:</span><span className={isDeltaConnected ? 'text-[#00C896] font-bold' : 'text-[#94A3B8] font-bold'}>{isDeltaConnected ? 'Delta Live API' : 'Not Connected'}</span></div>
          </div>
        </div>

      </div>

      {/* BOTTOM PANE: TABBED EXECUTION DOCK */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2 text-xs">
          <button
            onClick={() => setBottomTab('POSITIONS')}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              bottomTab === 'POSITIONS' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Open Positions ({positions.length})
          </button>
          <button
            onClick={() => setBottomTab('ORDERS')}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              bottomTab === 'ORDERS' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Pending Orders ({orders.length})
          </button>
          <button
            onClick={() => setBottomTab('HISTORY')}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              bottomTab === 'HISTORY' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Trade History ({decisions.length})
          </button>
        </div>

        {/* Tab Contents */}
        {bottomTab === 'POSITIONS' && (
          <div className="overflow-x-auto text-xs">
            {positions.length === 0 ? (
              <div className="text-center py-6 text-[#94A3B8]">No active open positions.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Side</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Entry Price</th>
                    <th className="py-2">Mark Price</th>
                    <th className="py-2">Unrealized PnL</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14] text-[#F8FAFC]">
                      <td className="py-2.5 font-bold">{pos.symbol}</td>
                      <td className="py-2.5 text-[#00C896] font-bold">{pos.side}</td>
                      <td className="py-2.5">{pos.quantity}</td>
                      <td className="py-2.5">${pos.entryPrice}</td>
                      <td className="py-2.5">${pos.markPrice}</td>
                      <td className={`py-2.5 font-bold ${pos.unrealizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => closePositionMutation.mutate({ id: pos.id, exitPrice: pos.markPrice })}
                          className="px-2 py-0.5 bg-[#F6465D]/20 text-[#F6465D] hover:bg-[#F6465D]/30 rounded text-[10px] font-bold"
                        >
                          CLOSE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {bottomTab === 'ORDERS' && (
          <div className="overflow-x-auto text-xs">
            {orders.length === 0 ? (
              <div className="text-center py-6 text-[#94A3B8]">No pending orders.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                    <th className="py-2">Order ID</th>
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Side</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14] text-[#F8FAFC]">
                      <td className="py-2.5 font-bold">{ord.id}</td>
                      <td className="py-2.5 text-[#3B82F6]">{ord.symbol}</td>
                      <td className="py-2.5 text-[#00C896]">{ord.side}</td>
                      <td className="py-2.5">${ord.price || 'MARKET'}</td>
                      <td className="py-2.5">{ord.quantity}</td>
                      <td className="py-2.5"><span className="bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded text-[10px]">{ord.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
