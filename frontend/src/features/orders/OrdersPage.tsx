import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperTradingApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { ListOrdered, Trash2, RefreshCw } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['paperOrders'],
    queryFn: paperTradingApi.getOrders,
  });

  const cancelMutation = useMutation({
    mutationFn: paperTradingApi.cancelOrder,
    onSuccess: (res) => {
      addToast('Order Cancelled', `Order ${res.data.id} cancelled successfully.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['paperOrders'] });
    },
  });

  const orders = ordersData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-[1600px] mx-auto pb-6 font-mono select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <ListOrdered className="w-6 h-6 text-[#3B82F6]" />
          <div>
            <h1 className="text-lg font-bold text-white uppercase">Live Orders Management</h1>
            <p className="text-xs text-[#94A3B8]">Active, pending limit, and stop orders synchronized with Delta Exchange.</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#28334A] text-white text-xs font-bold rounded-lg border border-[#334155] flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH ORDERS</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 text-xs">
          <span className="font-bold text-white">Pending & Open Orders ({orders.length})</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8] text-xs">
            No active or pending orders found.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px]">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Stop Loss / Take Profit</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14]">
                    <td className="py-3 px-3 text-white font-bold">{order.id}</td>
                    <td className="py-3 px-3 text-[#3B82F6] font-bold">{order.symbol}</td>
                    <td className={`py-3 px-3 font-bold ${order.side === 'BUY' ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                      {order.side}
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">{order.orderType}</td>
                    <td className="py-3 px-3 text-white">${order.price ? order.price.toFixed(2) : 'MARKET'}</td>
                    <td className="py-3 px-3 text-white">{order.quantity}</td>
                    <td className="py-3 px-3 text-[#94A3B8]">
                      SL: {order.stopLoss ? `$${order.stopLoss}` : '—'} | TP: {order.takeProfit ? `$${order.takeProfit}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded text-[10px] font-bold">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => cancelMutation.mutate(order.id)}
                        className="px-2.5 py-1 bg-[#F6465D]/20 hover:bg-[#F6465D]/30 text-[#F6465D] rounded text-[11px] font-bold inline-flex items-center space-x-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>CANCEL</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
