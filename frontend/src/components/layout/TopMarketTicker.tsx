import React from 'react';
import { MarketTickerItem } from '@algoapp/shared';
import { TrendingUp, TrendingDown } from 'lucide-react';

const mockTickers: MarketTickerItem[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: '$64,250.00', change24h: '+2.45%', isPositive: true },
  { symbol: 'ETH/USD', name: 'Ethereum', price: '$3,480.25', change24h: '+1.82%', isPositive: true },
  { symbol: 'SOL/USD', name: 'Solana', price: '$142.10', change24h: '-0.95%', isPositive: false },
  { symbol: 'AVAX/USD', name: 'Avalanche', price: '$28.40', change24h: '+3.12%', isPositive: true },
  { symbol: 'LINK/USD', name: 'Chainlink', price: '$16.85', change24h: '-1.15%', isPositive: false },
];

export const TopMarketTicker: React.FC = () => {
  return (
    <div className="h-7 bg-[#0E121A] border-b border-[#1E293B] flex items-center px-4 overflow-hidden text-xs font-mono select-none">
      <div className="flex items-center space-x-6 whitespace-nowrap overflow-x-auto no-scrollbar w-full">
        <span className="text-[#64748B] text-[10px] uppercase font-sans tracking-wider font-semibold">
          MARKETS
        </span>
        {mockTickers.map((ticker) => (
          <div key={ticker.symbol} className="flex items-center space-x-2">
            <span className="text-[#F8FAFC] font-medium">{ticker.symbol}</span>
            <span className="text-[#94A3B8]">{ticker.price}</span>
            <span
              className={`flex items-center text-[11px] font-semibold ${
                ticker.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'
              }`}
            >
              {ticker.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {ticker.change24h}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
