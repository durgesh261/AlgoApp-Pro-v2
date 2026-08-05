import { Router } from 'express';
import { PortfolioController } from './portfolio.controller.js';
import { PortfolioAggregationService } from './PortfolioAggregationService.js';

export function createPortfolioRouter(portfolioService: PortfolioAggregationService): Router {
  const router = Router();
  const controller = new PortfolioController(portfolioService);

  router.get('/summary', controller.getSummary);
  router.get('/wallet', controller.getWallet);
  router.get('/positions', controller.getPositions);
  router.get('/orders', controller.getOrders);
  router.get('/pnl', controller.getPnl);
  router.get('/analytics', controller.getAnalytics);
  router.get('/funding', controller.getFunding);

  return router;
}
