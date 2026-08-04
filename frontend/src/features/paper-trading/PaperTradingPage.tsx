import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperTradingApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { PaperOrderSide, PaperOrderType } from '@algoapp/shared';
import { 
  FileCode, 
  ShieldCheck, 
  PlusCircle, 
  Layers, 
  BookOpen
} from 'lucide-react';

export const PaperTradingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol } = useTerminalStore();
  const { addToast } = useToastStore();

  const [side, setSide] = useState<PaperOrderSide>(PaperOrderSide.BUY);
  const [orderType, setOrderType] = useState<PaperOrderType>(PaperOrderType.MARKET);
  const [price, setPrice] = useState('64250.00');
  const [quantity, setQuantity] = useState('0.10');
  const [leverage, setLeverage] = useState('10');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

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

  const createOrderMutation = useMutation({
    mutationFn: paperTradingApi.createOrder,
    onSuccess: (res) => {
      addToast('Paper Order Placed', `Order ${res.data.id} placed successfully`, 'success');
      queryClient.invalidateQueries({ queryKey: ['paperWallet'] });
      queryClient.invalidateQueries({ queryKey: ['paperOrders'] });
      queryClient.invalidateQueries({ queryKey: ['paperPositions'] });
      queryClient.invalidateQueries({ queryKey: ['paperJournal'] });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: string) => paperTradingApi.cancelOrder(id),
    onSuccess: (res) => {
      addToast('Paper Order Cancelled', `Order ${res.data.id} cancelled`, 'warning');
      queryClient.invalidateQueries({ queryKey: ['paperOrders'] });
      queryClient.invalidateQueries({ queryKey: ['paperJournal'] });
    },
  });

  const closePositionMutation = useMutation({
    mutationFn: ({ id, exitPrice }: { id: string; exitPrice: number }) =>
      paperTradingApi.closePosition(id, exitPrice),
    onSuccess: (res) => {
      addToast('Position Closed', `Closed position ${res.data.id} @ $${res.data.entryPrice}`, 'info');
      queryClient.invalidateQueries({ queryKey: ['paperWallet'] });
      queryClient.invalidateQueries({ queryKey: ['paperPositions'] });
      queryClient.invalidateQueries({ queryKey: ['paperJournal'] });
    },
  });

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate({
      symbol: activeSymbol,
      side,
      orderType,
      price: orderType !== PaperOrderType.MARKET ? parseFloat(price) : undefined,
      quantity: parseFloat(quantity),
      leverage: parseInt(leverage, 10),
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });
  };

  const wallet = walletData?.data;
  const positions = positionsData?.data || [];
  const orders = ordersData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#3B82F6]" />
            Paper Trading Engine Terminal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Modular simulation engine, margin calculation, bracket order matching, and risk safety limits.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>REAL APPLICATION STATE ONLINE</span>
        </div>
      </div>

      {/* Wallet Metrics Grid with Accent Borders */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Virtual Balance</span>
          <div className="text-lg font-bold text-[#F8FAFC] mt-0.5 font-mono-tabular">
            ${wallet?.virtualBalance !== undefined ? wallet.virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Account Equity</span>
          <div className="text-lg font-bold text-[#00C896] mt-0.5 font-mono-tabular">
            ${wallet?.equity !== undefined ? wallet.equity.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Available Margin</span>
          <div className="text-lg font-bold text-[#3B82F6] mt-0.5 font-mono-tabular">
            ${wallet?.availableMargin !== undefined ? wallet.availableMargin.toFixed(2) : '0.00'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Used Margin</span>
          <div className="text-lg font-bold text-[#F59E0B] mt-0.5 font-mono-tabular">
            ${wallet?.usedMargin !== undefined ? wallet.usedMargin.toFixed(2) : '0.00'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Realized P&L</span>
          <div className={`text-lg font-bold mt-0.5 font-mono-tabular ${wallet && wallet.realizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            {wallet?.realizedPnL !== undefined ? `${wallet.realizedPnL >= 0 ? '+' : ''}$${wallet.realizedPnL.toFixed(2)}` : '$0.00'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Unrealized P&L</span>
          <div className={`text-lg font-bold mt-0.5 font-mono-tabular ${wallet && wallet.unrealizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            {wallet?.unrealizedPnL !== undefined ? `${wallet.unrealizedPnL >= 0 ? '+' : ''}$${wallet.unrealizedPnL.toFixed(2)}` : '$0.00'}
          </div>
        </div>
      </div>

      {/* Main Order Form & Position Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Ticket Form */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#3B82F6]" />
              Place Virtual Order — {activeSymbol}
            </h2>
            <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
              PAPER ENGINE
            </span>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide(PaperOrderSide.BUY)}
                className={`py-2 rounded font-bold transition-all border ${
                  side === PaperOrderSide.BUY
                    ? 'bg-[#00C896] text-[#0B0E14] border-[#00C896] glow-buy'
                    : 'bg-[#0B0E14] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setSide(PaperOrderSide.SELL)}
                className={`py-2 rounded font-bold transition-all border ${
                  side === PaperOrderSide.SELL
                    ? 'bg-[#F6465D] text-white border-[#F6465D] glow-sell'
                    : 'bg-[#0B0E14] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#94A3B8] uppercase block">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as PaperOrderType)}
                className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono"
              >
                <option value={PaperOrderType.MARKET}>MARKET ORDER</option>
                <option value={PaperOrderType.LIMIT}>LIMIT ORDER</option>
                <option value={PaperOrderType.STOP_LIMIT}>STOP LIMIT ORDER</option>
                <option value={PaperOrderType.BRACKET}>BRACKET ORDER</option>
              </select>
            </div>

            {orderType !== PaperOrderType.MARKET && (
              <div className="space-y-1">
                <label className="text-[10px] text-[#94A3B8] uppercase block">Limit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono-tabular"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#94A3B8] uppercase block">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono-tabular"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#94A3B8] uppercase block">Leverage (x)</label>
                <input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#94A3B8] uppercase block">Stop Loss ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono-tabular"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#94A3B8] uppercase block">Take Profit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono-tabular"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className={`w-full py-2.5 rounded font-bold transition-all text-xs border ${
                side === PaperOrderSide.BUY
                  ? 'bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] border-[#00C896] glow-buy'
                  : 'bg-[#F6465D] hover:bg-[#E03A50] text-white border-[#F6465D] glow-sell'
              }`}
            >
              {createOrderMutation.isPending ? 'EXECUTING...' : `SUBMIT ${side} ORDER`}
            </button>
          </form>
        </div>

        {/* Positions & Orders Tabs / Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Positions Table */}
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#3B82F6]" />
                Open Positions ({positions.length})
              </h2>
              <span className="text-[10px] text-[#94A3B8]">REALTIME P&L TRACKING</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#1E2638] text-[#94A3B8] text-[11px] uppercase border-b border-[#1E293B]">
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Side</th>
                    <th className="p-2 text-right">Entry Price</th>
                    <th className="p-2 text-right">Mark Price</th>
                    <th className="p-2 text-right">Size</th>
                    <th className="p-2 text-right">Margin</th>
                    <th className="p-2 text-right">Unrealized P&L</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {positions.map((pos) => {
                    const isLong = pos.side === 'LONG';
                    const isProfit = pos.unrealizedPnL >= 0;

                    return (
                      <tr key={pos.id} className="hover:bg-[#1E2638] transition-colors">
                        <td className="p-2 font-bold text-[#F8FAFC]">{pos.symbol}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isLong ? 'bg-[#00C896]/15 text-[#00C896]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                            }`}
                          >
                            {pos.side}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono-tabular">${pos.entryPrice.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono-tabular">${pos.markPrice.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono-tabular">{pos.quantity}</td>
                        <td className="p-2 text-right font-mono-tabular">${pos.marginAllocated.toFixed(2)}</td>
                        <td
                          className={`p-2 text-right font-bold font-mono-tabular ${
                            isProfit ? 'text-[#00C896]' : 'text-[#F6465D]'
                          }`}
                        >
                          {isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() =>
                              closePositionMutation.mutate({ id: pos.id, exitPrice: pos.markPrice })
                            }
                            disabled={closePositionMutation.isPending}
                            className="px-2 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded text-[10px] font-bold border border-[#EF4444]/40"
                          >
                            CLOSE
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Orders Table */}
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                Pending Orders ({orders.length})
              </h2>
              <span className="text-[10px] text-[#94A3B8]">LIMIT & BRACKET ORDERS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#1E2638] text-[#94A3B8] text-[11px] uppercase border-b border-[#1E293B]">
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Side</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Quantity</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#1E2638] transition-colors">
                      <td className="p-2 text-[#94A3B8] text-[11px]">{ord.id}</td>
                      <td className="p-2 font-bold text-[#F8FAFC]">{ord.symbol}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ord.side === 'BUY' ? 'bg-[#00C896]/15 text-[#00C896]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                          }`}
                        >
                          {ord.side}
                        </span>
                      </td>
                      <td className="p-2 text-[#94A3B8]">{ord.orderType}</td>
                      <td className="p-2 text-right font-mono-tabular">${ord.price ? ord.price.toFixed(2) : 'MARKET'}</td>
                      <td className="p-2 text-right font-mono-tabular">{ord.quantity}</td>
                      <td className="p-2 font-bold text-[#3B82F6]">{ord.status}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => cancelOrderMutation.mutate(ord.id)}
                          disabled={cancelOrderMutation.isPending}
                          className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded text-[10px] font-bold"
                        >
                          CANCEL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
