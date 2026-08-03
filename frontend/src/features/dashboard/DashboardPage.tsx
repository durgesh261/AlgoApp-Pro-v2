import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperTradingApi, decisionApi, tradeAccountingApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { InteractiveTradingChart } from '../../components/charts/InteractiveTradingChart';
import { 
  LayoutDashboard, 
  Zap, 
  ShieldCheck, 
  Brain, 
  CheckCircle2, 
  FileText,
  X,
  Send,
  Sun
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol, setActiveSymbol, activeTimeframe } = useTerminalStore();
  const { addToast } = useToastStore();

  const [showMorningChecklist, setShowMorningChecklist] = useState(false);
  const [showPreTradeModal, setShowPreTradeModal] = useState(false);
  const [showEodReport, setShowEodReport] = useState(false);

  // Tabbed Bottom Execution Dock
  const [bottomTab, setBottomTab] = useState<'POSITIONS' | 'ORDERS' | 'HISTORY' | 'JOURNAL'>('POSITIONS');

  // Morning Checklist Prerequisites
  const checklistItems = [
    { id: 1, label: 'TradingView Adapter Connected', passed: true },
    { id: 2, label: 'Delta Exchange Sandbox Connected', passed: true },
    { id: 3, label: 'PostgreSQL Database Healthy', passed: true },
    { id: 4, label: 'Paper Wallet Synced ($50,000)', passed: true },
    { id: 5, label: '20-Day Challenge Session Active', passed: true },
    { id: 6, label: 'Strategy Profile Loaded (Default 1H)', passed: true },
    { id: 7, label: 'Timeframe Selected (1H)', passed: true },
    { id: 8, label: 'Emergency Kill Switch Inactive', passed: true },
    { id: 9, label: 'New York Market Session Open', passed: true },
    { id: 10, label: '1.5% Risk Sizing Rules Applied', passed: true },
  ];

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

  const { data: challengeData } = useQuery({
    queryKey: ['challengeState'],
    queryFn: tradeAccountingApi.getChallenge,
  });

  const orderMutation = useMutation({
    mutationFn: paperTradingApi.createOrder,
    onSuccess: (res) => {
      addToast('Order Executed', `Paper Order ${res.data.id} Submitted at $${res.data.price}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['paperWallet'] });
      queryClient.invalidateQueries({ queryKey: ['paperPositions'] });
      queryClient.invalidateQueries({ queryKey: ['paperOrders'] });
      setShowPreTradeModal(false);
    },
  });

  const wallet = walletData?.data;
  const positions = positionsData?.data || [];
  const orders = ordersData?.data || [];
  const decisions = decisionsData?.data || [];
  const challenge = challengeData?.data;

  const pairs = [
    { symbol: 'BTCUSD.P', price: '$64,250.00', change: '+3.42%', regime: 'BULLISH' },
    { symbol: 'ETHUSD.P', price: '$3,480.25', change: '+2.18%', regime: 'BULLISH' },
    { symbol: 'SOLUSD.P', price: '$142.10', change: '-1.45%', regime: 'RANGING' },
    { symbol: 'XRPUSD.P', price: '$0.5840', change: '+4.85%', regime: 'BULLISH' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 max-w-[1920px] mx-auto pb-6 font-mono select-none"
    >
      {/* Workstation Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3 bg-[#161D2A] p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="w-6 h-6 text-[#3B82F6]" />
          <div>
            <h1 className="text-lg font-bold text-[#F8FAFC]">
              AlgoApp Pro v4.0 Workstation — {activeSymbol} ({activeTimeframe})
            </h1>
            <div className="flex items-center space-x-2 text-xs text-[#94A3B8] mt-0.5">
              <span>Profile: <strong className="text-white">Default 1H Profile</strong></span>
              <span>•</span>
              <span>Regime: <strong className="text-[#00C896]">TRENDING BULLISH</strong></span>
            </div>
          </div>
        </div>

        {/* Live Gauges Summary */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[10px]">WALLET BALANCE</span>
            <span className="text-white font-bold font-mono-tabular">${wallet?.virtualBalance.toLocaleString() ?? '50,000.00'}</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[10px]">TODAY'S NET PNL</span>
            <span className="text-[#00C896] font-bold font-mono-tabular">+$639.55 (+1.28%)</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 rounded-lg">
            <span className="text-[#94A3B8] block text-[10px]">CHALLENGE (DAY {challenge?.currentDay ?? 1}/20)</span>
            <span className="text-[#3B82F6] font-bold font-mono-tabular">1.28% / 10% TARGET</span>
          </div>

          {/* Action Modals */}
          <button
            onClick={() => setShowMorningChecklist(true)}
            className="px-3 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-bold flex items-center space-x-1.5"
          >
            <Sun className="w-4 h-4" />
            <span>MORNING CHECKLIST</span>
          </button>

          <button
            onClick={() => setShowEodReport(true)}
            className="px-3 py-2 bg-[#1E293B] hover:bg-[#28334A] text-white rounded-lg font-bold flex items-center space-x-1.5 border border-[#334155]"
          >
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <span>EOD REPORT</span>
          </button>
        </div>
      </div>

      {/* 4-PANE UNIFIED TRADING WORKSTATION LAYOUT */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[680px]">
        {/* LEFT PANE: MARKET WATCH (Cols 2) */}
        <div className="col-span-12 lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 flex flex-col shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2.5 mb-2">
            <Zap className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Market Watch</h2>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
            {pairs.map((p) => (
              <div
                key={p.symbol}
                onClick={() => setActiveSymbol(p.symbol)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  activeSymbol === p.symbol
                    ? 'bg-[#1E293B] border-[#3B82F6]'
                    : 'bg-[#0B0E14] border-[#1E293B] hover:border-[#334155]'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">{p.symbol}</span>
                  <span className={p.change.startsWith('+') ? 'text-[#00C896]' : 'text-[#F6465D]'}>{p.change}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#94A3B8] mt-1">
                  <span>{p.price}</span>
                  <span className="text-[9px] bg-[#161D2A] px-1.5 py-0.5 rounded text-[#3B82F6]">{p.regime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANE: TRADINGVIEW CHART WORKSPACE (Cols 7) */}
        <div className="col-span-12 lg:col-span-7 bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm flex flex-col">
          <InteractiveTradingChart initialSymbol={activeSymbol} initialTimeframe={activeTimeframe} />
        </div>

        {/* RIGHT PANE: DECISION PANEL & RISK SIZING (Cols 3) */}
        <div className="col-span-12 lg:col-span-3 bg-[#161D2A] border border-[#1E293B] rounded-xl p-3 flex flex-col justify-between shadow-sm space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#00C896]" />
                <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">AI Decision Panel</h2>
              </div>
              <span className="text-[10px] bg-[#00C896]/20 text-[#00C896] px-2 py-0.5 rounded font-bold">
                CONFIDENCE: 94.5%
              </span>
            </div>

            {/* Decision Card */}
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Signal Decision</span>
                <span className="text-[#00C896] font-bold">BUY / LONG</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Rule Verified</span>
                <span className="text-white font-bold">1H Demand Retest</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8]">Risk-Reward</span>
                <span className="text-[#F59E0B] font-bold">3.25 : 1</span>
              </div>
            </div>

            {/* Risk Sizing Calculator */}
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2 text-xs">
              <div className="text-[11px] font-bold text-[#F8FAFC] border-b border-[#1E293B] pb-1">
                Risk Sizing (1.5% Max Risk Rule)
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#94A3B8]">Risk Amount:</span>
                <span className="text-white font-bold">$750.00</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#94A3B8]">Position Contracts:</span>
                <span className="text-[#3B82F6] font-bold">0.5 BTCUSD.P</span>
              </div>
            </div>
          </div>

          {/* Action Order Button */}
          <button
            onClick={() => setShowPreTradeModal(true)}
            className="w-full py-3 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] font-bold text-xs rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT PRE-TRADE RISK CONFIRMATION</span>
          </button>
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                  <th className="py-2">Symbol</th>
                  <th className="py-2">Side</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Entry Price</th>
                  <th className="py-2">Mark Price</th>
                  <th className="py-2">PnL</th>
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
                    <td className="py-2.5 text-[#00C896] font-bold">+${pos.unrealizedPnL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MORNING CHECKLIST MODAL */}
      {showMorningChecklist && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-white uppercase">Daily Morning Trading Checklist</h3>
              </div>
              <button onClick={() => setShowMorningChecklist(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-[#0B0E14] p-2 rounded text-xs border border-[#1E293B]">
                  <span className="text-[#94A3B8]">{item.label}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowMorningChecklist(false);
                addToast('Morning Checklist Verified', 'All 10 prerequisites passed. Trading unlocked.', 'success');
              }}
              className="w-full py-2.5 bg-[#00C896] text-[#0B0E14] font-bold text-xs rounded-lg"
            >
              CONFIRM ALL CHECKLIST PREREQUISITES
            </button>
          </div>
        </div>
      )}

      {/* PRE-TRADE RISK CONFIRMATION MODAL */}
      {showPreTradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#00C896]" />
                <h3 className="text-sm font-bold text-white uppercase">Pre-Trade Risk Confirmation</h3>
              </div>
              <button onClick={() => setShowPreTradeModal(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between"><span>Pair / Side:</span><span className="text-white font-bold">{activeSymbol} (LONG)</span></div>
              <div className="flex justify-between"><span>Entry Price:</span><span className="text-white font-bold">$63,850.00</span></div>
              <div className="flex justify-between"><span>Take Profit:</span><span className="text-[#00C896] font-bold">$65,800.00</span></div>
              <div className="flex justify-between"><span>Stop Loss:</span><span className="text-[#F6465D] font-bold">$63,250.00</span></div>
              <div className="flex justify-between"><span>Risk-Reward:</span><span className="text-[#F59E0B] font-bold">3.25 : 1</span></div>
              <div className="flex justify-between"><span>Confidence:</span><span className="text-[#00C896] font-bold">94.5%</span></div>
              <div className="flex justify-between"><span>Est. Trading Fee:</span><span className="text-[#94A3B8]">$32.26</span></div>
              <div className="flex justify-between border-t border-[#1E293B] pt-1"><span>Est. Net Profit:</span><span className="text-[#00C896] font-bold">+$639.55</span></div>
            </div>

            <button
              onClick={() => {
                orderMutation.mutate({
                  symbol: activeSymbol,
                  side: 'BUY' as any,
                  orderType: 'MARKET' as any,
                  price: 63850,
                  quantity: 0.5,
                  leverage: 10,
                });
              }}
              className="w-full py-2.5 bg-[#00C896] text-[#0B0E14] font-bold text-xs rounded-lg"
            >
              CONFIRM AND SUBMIT ORDER
            </button>
          </div>
        </div>
      )}

      {/* END-OF-DAY CLOSING REPORT MODAL */}
      {showEodReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-white uppercase">Daily Closing Report — August 3, 2026</h3>
              </div>
              <button onClick={() => setShowEodReport(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between"><span>Trades Executed:</span><span className="text-white font-bold">4 Trades</span></div>
              <div className="flex justify-between"><span>Win Rate:</span><span className="text-[#00C896] font-bold">75.0% (3 W / 1 L)</span></div>
              <div className="flex justify-between"><span>Gross Profit:</span><span className="text-white font-bold">$675.00</span></div>
              <div className="flex justify-between"><span>Fees & Taxes:</span><span className="text-[#F59E0B] font-bold">$35.45</span></div>
              <div className="flex justify-between border-t border-[#1E293B] pt-1"><span>Net Realized Profit:</span><span className="text-[#00C896] font-bold">+$639.55</span></div>
              <div className="flex justify-between"><span>Challenge Progress:</span><span className="text-[#3B82F6] font-bold">1.28% / 10% Target</span></div>
            </div>

            <button
              onClick={() => setShowEodReport(false)}
              className="w-full py-2.5 bg-[#3B82F6] text-white font-bold text-xs rounded-lg"
            >
              CLOSE REPORT
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
