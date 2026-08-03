import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesktopTerminalLayout } from './components/layout/DesktopTerminalLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PaperTradingPage } from './features/paper-trading/PaperTradingPage';
import { LiveTradingPage } from './features/live-trading/LiveTradingPage';
import { SystemMonitorPage } from './features/system-monitor/SystemMonitorPage';
import { ProductionDashboardPage } from './features/production/ProductionDashboardPage';
import { AnalysisPage } from './features/analysis/AnalysisPage';
import { TradeJournalPage } from './features/journal/TradeJournalPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { ChallengePage } from './features/challenge/ChallengePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ReplayPage } from './features/replay/ReplayPage';
import { BacktestingPage } from './features/backtesting/BacktestingPage';
import { TradingViewSetupPage } from './features/tradingview/TradingViewSetupPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DesktopTerminalLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/paper-trading" element={<PaperTradingPage />} />
          <Route path="/live-trading" element={<LiveTradingPage />} />
          <Route path="/tradingview" element={<TradingViewSetupPage />} />
          <Route path="/system-monitor" element={<SystemMonitorPage />} />
          <Route path="/production-dashboard" element={<ProductionDashboardPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/replay" element={<ReplayPage />} />
          <Route path="/backtest" element={<BacktestingPage />} />
          <Route path="/journal" element={<TradeJournalPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </DesktopTerminalLayout>
    </BrowserRouter>
  );
};

export default App;
