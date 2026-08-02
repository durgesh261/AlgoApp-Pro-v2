import React from 'react';
import { motion } from 'framer-motion';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { AccountSummaryWidget } from '../../components/widgets/AccountSummaryWidget';
import { ChallengeSummaryWidget } from '../../components/widgets/ChallengeSummaryWidget';
import { OpportunityRadarWidget } from '../../components/widgets/OpportunityRadarWidget';
import { EquityCurveChart } from '../../components/charts/EquityCurveChart';
import { PnLBarChart } from '../../components/charts/PnLBarChart';
import { WinRateDonutChart } from '../../components/charts/WinRateDonutChart';
import { OpenTradesTable } from '../../components/tables/OpenTradesTable';
import { SignalsTable } from '../../components/tables/SignalsTable';

export const DashboardPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6"
    >
      {/* Active Symbol Header Widget */}
      <CurrentPairWidget />

      {/* Account & Challenge Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccountSummaryWidget />
        <ChallengeSummaryWidget />
      </div>

      {/* Opportunity Radar & Win Rate Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <OpportunityRadarWidget />
        </div>
        <div>
          <WinRateDonutChart />
        </div>
      </div>

      {/* Financial Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EquityCurveChart />
        <PnLBarChart />
      </div>

      {/* Data Tables Grid */}
      <div className="space-y-4">
        <OpenTradesTable />
        <SignalsTable />
      </div>
    </motion.div>
  );
};
