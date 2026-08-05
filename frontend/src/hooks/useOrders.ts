import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deltaApi } from '../services/api.js';

export function useOrders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['delta', 'orders'],
    queryFn: async () => {
      const res = await deltaApi.getOrders();
      return res.data || [];
    },
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: number | string) => {
      return await deltaApi.cancelOrder(orderId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['delta', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['delta', 'portfolio'] });
    },
  });

  const placeMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await deltaApi.placeOrder(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['delta', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['delta', 'positions'] });
      void queryClient.invalidateQueries({ queryKey: ['delta', 'portfolio'] });
    },
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    cancelOrder: cancelMutation.mutateAsync,
    placeOrder: placeMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    isPlacing: placeMutation.isPending,
  };
}
