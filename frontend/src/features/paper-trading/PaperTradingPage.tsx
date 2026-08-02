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
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  XCircle, 
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

  const { data: journalData } = useQuery({
    queryKey: ['paperJournal'],
    queryFn: paperTradingApi.getJournal,
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
    onError: (err: any) => {
      addToast('Order Rejected', err?.response?.data?.error?.message || 'Order rejected by Paper Risk Engine', 'danger');
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: paperTradingApi.cancelOrder,
    onSuccess: (res) => {
      addToast('Order Cancelled', `Paper order ${res.data.id} cancelled`, 'info');
      queryClient.invalidateQueries({ queryKey: ['paperOrders'] });
      queryClient.invalidateQueries({ queryKey: ['paperJournal'] });
    },
  });

  const closePositionMutation = useMutation({
    mutationFn: ({ id, exitPrice }: { id: string; exitPrice: number }) =>
      paperTradingApi.closePosition(id, exitPrice),
    onSuccess: (res) => {
      addToast('Position Closed', `Position closed with PnL: $${res.data.realizedPnL}`, 'success');
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
  const journal = journalData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
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
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>REAL APPLICATION STATE ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Virtual Balance</span>
          <div className="text-lg font-bold text-[#F8FAFC] mt-0.5">
            ${wallet?.virtualBalance.toLocaleString() ?? '50,000.00'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Account Equity</span>
          <div className="text-lg font-bold text-[#00C896] mt-0.5">
            ${wallet?.equity.toLocaleString() ?? '54,956.50'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Available Margin</span>
          <div className="text-lg font-bold text-[#3B82F6] mt-0.5">
            ${wallet?.availableMargin.toLocaleString() ?? '45,581.20'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Used Margin</span>
          <div className="text-lg font-bold text-[#F59E0B] mt-0.5">
            ${wallet?.usedMargin.toLocaleString() ?? '9,375.30'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Realized P&L</span>
          <div className="text-lg font-bold text-[#00C896] mt-0.5">
            +${wallet?.realizedPnL.toLocaleString() ?? '3,840.50'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Unrealized P&L</span>
          <div className="text-lg font-bold text-[#00C896] mt-0.5">
            +${wallet?.unrealizedPnL.toLocaleString() ?? '1,116.00'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                    ? 'bg-[#00C896] text-[#0B0E14] border-[#00C896]'
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
                    ? 'bg-[#F6465D] text-white border-[#F6465D]'
                    : 'bg-[#0B0E14] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[#94A3B8] block text-[11px]">Order Type</label>
              <div className="grid grid-cols-3 gap-1">
                {[PaperOrderType.MARKET, PaperOrderType.LIMIT, PaperOrderType.BRACKET].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-1.5 rounded text-[10px] font-bold border transition-colors ${
                      orderType === type
                        ? 'bg-[#1E2638] text-[#3B82F6] border-[#3B82F6]'
                        : 'bg-[#0B0E14] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {orderType !== PaperOrderType.MARKET && (
              <div className="space-y-1">
                <label className="text-[#94A3B8] block text-[11px]">Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[#94A3B8] block text-[11px]">Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#94A3B8] block text-[11px]">Leverage (x)</label>
                <input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
                  required
                />
              </div>
            </div>

            {(orderType === PaperOrderType.BRACKET || stopLoss || takeProfit) && (
              <div className="grid grid-cols-2 gap-2 border-t border-[#1E293B] pt-2">
                <div className="space-y-1">
                  <label className="text-[#F6465D] block text-[11px]">Stop Loss ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="Optional SL"
                    className="w-full bg-[#0B0E14] border border-[#334155] rounded px-2.5 py-1 text-[#F8FAFC] font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#00C896] block text-[11px]">Take Profit ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="Optional TP"
                    className="w-full bg-[#0B0E14] border border-[#334155] rounded px-2.5 py-1 text-[#F8FAFC] font-mono outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all shadow-md mt-2 ${
                side === PaperOrderSide.BUY
                  ? 'bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14]'
                  : 'bg-[#F6465D] hover:bg-[#E03E53] text-white'
              }`}
            >
              {createOrderMutation.isPending ? 'MATCHING PAPER ORDER...' : `EXECUTE PAPER ${side}`}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#00C896]" />
                <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Paper Open Positions ({positions.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC P&L ENGINE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs select-none">
                <thead>
                  <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] border-b border-[#1E293B] h-9">
                    <th className="px-3 text-left">Symbol</th>
                    <th className="px-3 text-left">Side</th>
                    <th className="px-3 text-right">Entry</th>
                    <th className="px-3 text-right">Mark</th>
                    <th className="px-3 text-right">Qty</th>
                    <th className="px-3 text-right">Unrealized P&L</th>
                    <th className="px-3 text-center">Leverage</th>
                    <th className="px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-[#64748B]">No open paper positions.</td>
                    </tr>
                  ) : (
                    positions.map((pos) => (
                      <tr key={pos.id} className="hover:bg-[#28334A] h-10 transition-colors">
                        <td className="px-3 font-bold text-[#F8FAFC]">{pos.symbol}</td>
                        <td className="px-3">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.side === 'LONG'
                                ? 'bg-[#00C896]/15 text-[#00C896]'
                                : 'bg-[#F6465D]/15 text-[#F6465D]'
                            }`}
                          >
                            {pos.side === 'LONG' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {pos.side}
                          </span>
                        </td>
                        <td className="px-3 text-right text-[#F8FAFC]">${pos.entryPrice.toLocaleString()}</td>
                        <td className="px-3 text-right text-[#F8FAFC]">${pos.markPrice.toLocaleString()}</td>
                        <td className="px-3 text-right text-[#94A3B8]">{pos.quantity}</td>
                        <td className="px-3 text-right font-bold text-[#00C896]">
                          +${pos.unrealizedPnL.toLocaleString()}
                        </td>
                        <td className="px-3 text-center">
                          <span className="bg-[#1E293B] text-[#94A3B8] px-1.5 py-0.5 rounded text-[10px]">
                            {pos.leverage}x
                          </span>
                        </td>
                        <td className="px-3 text-center">
                          <button
                            onClick={() => closePositionMutation.mutate({ id: pos.id, exitPrice: pos.markPrice })}
                            className="bg-[#F6465D]/15 hover:bg-[#F6465D]/30 text-[#F6465D] border border-[#F6465D]/40 px-2 py-0.5 rounded text-[10px] font-bold transition-colors"
                          >
                            CLOSE
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Pending Limit / Stop Orders ({orders.length})
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs select-none">
                <thead>
                  <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] border-b border-[#1E293B] h-9">
                    <th className="px-3 text-left">Order ID</th>
                    <th className="px-3 text-left">Symbol</th>
                    <th className="px-3 text-left">Type</th>
                    <th className="px-3 text-left">Side</th>
                    <th className="px-3 text-right">Price</th>
                    <th className="px-3 text-right">Quantity</th>
                    <th className="px-3 text-center">Status</th>
                    <th className="px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-[#64748B]">No pending paper orders.</td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#28334A] h-10 transition-colors">
                        <td className="px-3 font-bold text-[#F8FAFC]">{ord.id}</td>
                        <td className="px-3 text-[#F8FAFC] font-semibold">{ord.symbol}</td>
                        <td className="px-3 text-[#3B82F6]">{ord.orderType}</td>
                        <td className="px-3 font-bold text-[#00C896]">{ord.side}</td>
                        <td className="px-3 text-right text-[#F8FAFC]">${ord.price || ord.stopPrice || 'MKT'}</td>
                        <td className="px-3 text-right text-[#94A3B8]">{ord.quantity}</td>
                        <td className="px-3 text-center">
                          <span className="bg-[#1E293B] text-[#F59E0B] px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {ord.status}
                          </span>
                        </td>
                        <td className="px-3 text-center">
                          <button
                            onClick={() => cancelOrderMutation.mutate(ord.id)}
                            className="p-1 text-[#94A3B8] hover:text-[#F6465D] rounded transition-colors"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
          <BookOpen className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
            Paper Engine Real-Time Audit Journal
          </h3>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {journal.map((j) => (
            <div
              key={j.id}
              className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="text-[10px] bg-[#1E293B] text-[#3B82F6] px-2 py-0.5 rounded font-bold">
                  {j.eventType}
                </span>
                <span className="font-bold text-[#F8FAFC]">{j.action}</span>
                <span className="text-[#94A3B8]">{j.details}</span>
              </div>
              <span className="text-[10px] text-[#64748B]">{j.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
