import { useQuery } from '@tanstack/react-query';
import { deltaApi } from '../services/api.js';

export function usePositions() {
  return useQuery({
    queryKey: ['delta', 'positions'],
    queryFn: async () => {
      const res = await deltaApi.getPositions();
      return res.data || [];
    },
    refetchInterval: 3000,
    staleTime: 2000,
  });
}
