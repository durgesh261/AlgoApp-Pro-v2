import React from 'react';
import { TopMarketTicker } from './TopMarketTicker';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { CommandPalette } from './CommandPalette';

interface DesktopTerminalLayoutProps {
  children: React.ReactNode;
}

export const DesktopTerminalLayout: React.FC<DesktopTerminalLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0E14] text-[#F8FAFC]">
      <TopMarketTicker />
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 bg-[#121722] overflow-y-auto p-4 relative">
          {children}
        </main>
      </div>

      <StatusBar />
      <CommandPalette />
    </div>
  );
};
