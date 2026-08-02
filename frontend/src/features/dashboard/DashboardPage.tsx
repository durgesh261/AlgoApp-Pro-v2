import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTerminalStore, WidgetVisibilityState } from '../../store/useTerminalStore';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { AccountSummaryWidget } from '../../components/widgets/AccountSummaryWidget';
import { ChallengeSummaryWidget } from '../../components/widgets/ChallengeSummaryWidget';
import { OpportunityRadarWidget } from '../../components/widgets/OpportunityRadarWidget';
import { EquityCurveChart } from '../../components/charts/EquityCurveChart';
import { PnLBarChart } from '../../components/charts/PnLBarChart';
import { WinRateDonutChart } from '../../components/charts/WinRateDonutChart';
import { OpenTradesTable } from '../../components/tables/OpenTradesTable';
import { SignalsTable } from '../../components/tables/SignalsTable';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { widgets, toggleWidget, resetWidgetLayout } = useTerminalStore();
  const [showCustomizer, setShowCustomizer] = useState(false);

  const widgetLabels: { key: keyof WidgetVisibilityState; label: string }[] = [
    { key: 'showCurrentPair', label: 'Active Pair Summary' },
    { key: 'showAccountSummary', label: 'Account & Risk Metrics' },
    { key: 'showChallengeSummary', label: 'Trader Challenge Progress' },
    { key: 'showOpportunityRadar', label: 'Market Opportunity Radar' },
    { key: 'showEquityCurve', label: 'Equity Curve Chart' },
    { key: 'showPnLChart', label: 'Daily PnL Chart' },
    { key: 'showWinRate', label: 'Win Rate Donut' },
    { key: 'showOpenTrades', label: 'Active Open Positions Table' },
    { key: 'showSignals', label: 'Inbound Signals Table' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 select-none font-mono"
    >
      {/* Dashboard Personalization Toolbar Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-bold text-[#F8FAFC]">Institutional Trading Workspace</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="flex items-center space-x-2 bg-[#161D2A] hover:bg-[#1E2638] border border-[#334155] px-3 py-1.5 rounded-md text-xs text-[#F8FAFC] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Customize Widgets</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {/* Customization Dropdown Menu */}
          {showCustomizer && (
            <div className="absolute right-0 mt-2 w-64 bg-[#161D2A] border border-[#334155] rounded-xl shadow-2xl p-3 z-30 space-y-2">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="text-xs font-bold text-[#F8FAFC]">Visible Widgets</span>
                <button
                  onClick={resetWidgetLayout}
                  className="flex items-center text-[10px] text-[#3B82F6] hover:underline"
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset Layout
                </button>
              </div>

              <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
                {widgetLabels.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-1.5 hover:bg-[#1E2638] rounded cursor-pointer text-[#94A3B8] hover:text-[#F8FAFC]"
                  >
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={widgets[item.key]}
                      onChange={() => toggleWidget(item.key)}
                      className="accent-[#3B82F6] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Symbol Header Widget */}
      {widgets.showCurrentPair && <CurrentPairWidget />}

      {/* Account & Challenge Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {widgets.showAccountSummary && <AccountSummaryWidget />}
        {widgets.showChallengeSummary && <ChallengeSummaryWidget />}
      </div>

      {/* Opportunity Radar & Win Rate Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {widgets.showOpportunityRadar && (
          <div className={widgets.showWinRate ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <OpportunityRadarWidget />
          </div>
        )}
        {widgets.showWinRate && (
          <div className={!widgets.showOpportunityRadar ? 'lg:col-span-3' : ''}>
            <WinRateDonutChart />
          </div>
        )}
      </div>

      {/* Financial Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {widgets.showEquityCurve && <EquityCurveChart />}
        {widgets.showPnLChart && <PnLBarChart />}
      </div>

      {/* Data Tables Grid */}
      <div className="space-y-4">
        {widgets.showOpenTrades && <OpenTradesTable />}
        {widgets.showSignals && <SignalsTable />}
      </div>
    </motion.div>
  );
};
