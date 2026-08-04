import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesktopTerminalLayout } from './components/layout/DesktopTerminalLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PortfolioDashboardPage } from './features/portfolio/PortfolioDashboardPage';
import { LiveTradingPage } from './features/live-trading/LiveTradingPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { PositionsPage } from './features/positions/PositionsPage';
import { TradeHistoryPage } from './features/history/TradeHistoryPage';
import { TradeJournalPage } from './features/journal/TradeJournalPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { StrategyProfilesPage } from './features/strategy-profiles/StrategyProfilesPage';
import { SettingsPage } from './features/settings/SettingsPage';

// Developer Mode Views
import { PaperTradingPage } from './features/paper-trading/PaperTradingPage';
import { ShadowLaboratoryPage } from './features/shadow/ShadowLaboratoryPage';
import { ReplayPage } from './features/replay/ReplayPage';
import { BacktestingPage } from './features/backtesting/BacktestingPage';
import { StrategyLaboratoryPage } from './features/laboratory/StrategyLaboratoryPage';
import { IndicatorValidationPage } from './features/validation/IndicatorValidationPage';
import { OperationsCenterPage } from './features/operations/OperationsCenterPage';
import { ProductionDashboardPage } from './features/production/ProductionDashboardPage';
import { SystemMonitorPage } from './features/system-monitor/SystemMonitorPage';
import { TradingViewSetupPage } from './features/tradingview/TradingViewSetupPage';
import { TradeAccountingPage } from './features/accounting/TradeAccountingPage';
import { TradeReviewPage } from './features/review/TradeReviewPage';
import { ChallengePage } from './features/challenge/ChallengePage';
import { AnalysisPage } from './features/analysis/AnalysisPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DesktopTerminalLayout>
        <Routes>
          {/* Primary Live Trading Routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioDashboardPage />} />
          <Route path="/live-trading" element={<LiveTradingPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/positions" element={<PositionsPage />} />
          <Route path="/history" element={<TradeHistoryPage />} />
          <Route path="/journal" element={<TradeJournalPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/strategy-profiles" element={<StrategyProfilesPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Developer Mode Routes */}
          <Route path="/paper-trading" element={<PaperTradingPage />} />
          <Route path="/shadow-laboratory" element={<ShadowLaboratoryPage />} />
          <Route path="/replay" element={<ReplayPage />} />
          <Route path="/backtest" element={<BacktestingPage />} />
          <Route path="/laboratory" element={<StrategyLaboratoryPage />} />
          <Route path="/indicator-validation" element={<IndicatorValidationPage />} />
          <Route path="/operations" element={<OperationsCenterPage />} />
          <Route path="/production-dashboard" element={<ProductionDashboardPage />} />
          <Route path="/system-monitor" element={<SystemMonitorPage />} />
          <Route path="/tradingview" element={<TradingViewSetupPage />} />
          <Route path="/trade-accounting" element={<TradeAccountingPage />} />
          <Route path="/trade-review" element={<TradeReviewPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
      </DesktopTerminalLayout>
    </BrowserRouter>
  );
};

export default App;
