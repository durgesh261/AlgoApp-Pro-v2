import { useEffect, useState } from 'react';
import { chartWebSocketService, LiveTicker } from '../services/ChartWebSocketService';

export function useChartWebSocket(symbol: string) {
  const [state, setState] = useState(chartWebSocketService['state'] || 'DISCONNECTED');
  const [ticker, setTicker] = useState<LiveTicker | null>(null);

  useEffect(() => {
    chartWebSocketService.connect(symbol);

    const handleStateChange = (newState: string) => setState(newState as any);
    const handleTicker = (data: LiveTicker) => setTicker(data);

    chartWebSocketService.on('stateChange', handleStateChange);
    chartWebSocketService.on('ticker', handleTicker);

    return () => {
      chartWebSocketService.off('stateChange', handleStateChange);
      chartWebSocketService.off('ticker', handleTicker);
    };
  }, [symbol]);

  return { state, ticker };
}
