import React from 'react';
import { TradingViewChartWorkspace } from './TradingViewChartWorkspace';

export const InteractiveTradingChart: React.FC<{
  initialSymbol?: string;
  initialTimeframe?: '15M' | '1H';
  isReplayActive?: boolean;
  onSelectTrade?: (tradeId: string) => void;
}> = (props) => {
  return <TradingViewChartWorkspace {...props} />;
};
