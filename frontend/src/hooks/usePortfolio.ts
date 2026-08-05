import { useQuery } from '@tanstack/react-query';
import { deltaApi } from '../services/api.js';

export function usePortfolio() {
  return useQuery({
    queryKey: ['delta', 'portfolio'],
    queryFn: async () => {
      const res = await deltaApi.getPortfolio();
      return res.data;
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });
}
