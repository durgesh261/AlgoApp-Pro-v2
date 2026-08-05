import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { executionApi, OrderExecutionDto } from '../services/api';
import { useToastStore } from '../store/useToastStore';

export const useExecution = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  // Active Working Orders Query
  const activeOrdersQuery = useQuery({
    queryKey: ['execution', 'activeOrders'],
    queryFn: executionApi.getActiveOrders,
    refetchInterval: 3000,
  });

  // Execution History Query
  const executionHistoryQuery = useQuery({
    queryKey: ['execution', 'history'],
    queryFn: executionApi.getHistory,
    refetchInterval: 5000,
  });

  // Place Order Mutation
  const placeOrderMutation = useMutation({
    mutationFn: (order: OrderExecutionDto) => executionApi.placeOrder(order),
    onSuccess: (data: any) => {
      if (data?.data?.success) {
        addToast(
          'Order Executed',
          `${data.data.side?.toUpperCase()} ${data.data.size} ${data.data.symbol} (${data.data.orderType?.toUpperCase()}) — ${data.data.latencyMs}ms`,
          'success'
        );
      } else {
        addToast('Execution Rejected', data?.data?.message || 'Exchange rejected order', 'danger');
      }
      void queryClient.invalidateQueries({ queryKey: ['execution'] });
      void queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      void queryClient.invalidateQueries({ queryKey: ['delta'] });
    },
    onError: (err: any) => {
      addToast('Execution Error', err?.response?.data?.error || err?.message || 'Failed to place order', 'danger');
    },
  });

  // Validate Order Mutation
  const validateOrderMutation = useMutation({
    mutationFn: (order: OrderExecutionDto) => executionApi.validateOrder(order),
  });

  // Cancel Order Mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string | number) => executionApi.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      addToast('Order Cancelled', `Order #${orderId} was cancelled successfully.`, 'info');
      void queryClient.invalidateQueries({ queryKey: ['execution'] });
      void queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (err: any) => {
      addToast('Cancel Failed', err?.message || 'Failed to cancel order', 'danger');
    },
  });

  // Cancel All Orders Mutation
  const cancelAllOrdersMutation = useMutation({
    mutationFn: () => executionApi.cancelAllOrders(),
    onSuccess: (data: any) => {
      addToast('All Orders Cancelled', `Cancelled ${data?.data?.cancelledCount || 0} active orders.`, 'info');
      void queryClient.invalidateQueries({ queryKey: ['execution'] });
      void queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (err: any) => {
      addToast('Cancel All Failed', err?.message || 'Failed to cancel orders', 'danger');
    },
  });

  // Close Position Mutation
  const closePositionMutation = useMutation({
    mutationFn: (symbol: string) => executionApi.closePosition(symbol),
    onSuccess: (_, symbol) => {
      addToast('Position Closed', `Market reduce-only close submitted for ${symbol}. Trade accounting triggered.`, 'success');
      void queryClient.invalidateQueries({ queryKey: ['execution'] });
      void queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      void queryClient.invalidateQueries({ queryKey: ['tradeLedger'] });
    },
    onError: (err: any) => {
      addToast('Close Position Failed', err?.response?.data?.error || err?.message || 'Failed to close position', 'danger');
    },
  });

  const activeOrders = Array.isArray(activeOrdersQuery.data?.data) ? activeOrdersQuery.data.data : [];
  const executionHistory = Array.isArray(executionHistoryQuery.data?.data) ? executionHistoryQuery.data.data : [];

  return {
    activeOrders,
    executionHistory,
    isLoadingOrders: activeOrdersQuery.isLoading,
    isLoadingHistory: executionHistoryQuery.isLoading,
    placeOrder: placeOrderMutation.mutateAsync,
    isPlacing: placeOrderMutation.isPending,
    validateOrder: validateOrderMutation.mutateAsync,
    isValidating: validateOrderMutation.isPending,
    validationResult: (validateOrderMutation.data as any)?.data,
    cancelOrder: cancelOrderMutation.mutateAsync,
    isCancelling: cancelOrderMutation.isPending,
    cancelAllOrders: cancelAllOrdersMutation.mutateAsync,
    isCancellingAll: cancelAllOrdersMutation.isPending,
    closePosition: closePositionMutation.mutateAsync,
    isClosingPosition: closePositionMutation.isPending,
    refetchAll: () => {
      void activeOrdersQuery.refetch();
      void executionHistoryQuery.refetch();
    },
  };
};
