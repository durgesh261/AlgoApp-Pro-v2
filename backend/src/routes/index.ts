import { Router } from 'express';
import { systemRouter } from '../modules/system/system.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { paperTradingRouter } from '../modules/paper-trading/paper-trading.routes.js';
import { liveTradingRouter } from '../modules/live-trading/live-trading.routes.js';
import { analysisRouter } from '../modules/analysis/analysis.routes.js';
import { journalRouter } from '../modules/journal/journal.routes.js';
import { analyticsRouter } from '../modules/analytics/analytics.routes.js';
import { challengeRouter } from '../modules/challenge/challenge.routes.js';
import { settingsRouter } from '../modules/settings/settings.routes.js';
import { strategyRouter } from '../modules/strategy/strategy.routes.js';
import { decisionRouter } from '../modules/decision/decision.routes.js';

export const apiRouter = Router();

apiRouter.use('/system', systemRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/paper-trading', paperTradingRouter);
apiRouter.use('/live-trading', liveTradingRouter);
apiRouter.use('/analysis', analysisRouter);
apiRouter.use('/journal', journalRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/challenge', challengeRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/strategy', strategyRouter);
apiRouter.use('/decision', decisionRouter);
