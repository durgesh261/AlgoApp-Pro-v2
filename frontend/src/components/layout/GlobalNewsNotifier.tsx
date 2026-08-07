import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';

export const GlobalNewsNotifier: React.FC = () => {
  const { addToast } = useToastStore();
  const latestNewsIdRef = useRef<string | null>(null);

  const { data } = useQuery({
    queryKey: ['liveNewsPoll'],
    queryFn: () => newsApi.getNews({ limit: 5 }),
    refetchInterval: 30000, // Check every 30 seconds
  });

  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      const topNews = data.data[0];
      
      // If we don't have a ref yet, just set it to prevent firing on initial load
      if (!latestNewsIdRef.current) {
        latestNewsIdRef.current = topNews.id;
        return;
      }

      // If the top news ID is different than what we saw before, it's a new article
      if (topNews.id !== latestNewsIdRef.current) {
        addToast(
          topNews.importance === 'HIGH' ? '🚨 Breaking News' : '📰 New Update',
          topNews.headline,
          topNews.importance === 'HIGH' ? 'danger' : 'info'
        );
        latestNewsIdRef.current = topNews.id;
      }
    }
  }, [data, addToast]);

  return null; // This component is invisible
};
