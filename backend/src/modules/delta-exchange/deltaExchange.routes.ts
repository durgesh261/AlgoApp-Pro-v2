import { Router } from 'express';
import { DeltaExchangeController } from './deltaExchange.controller.js';
import { DeltaSyncService } from './services/DeltaSyncService.js';
import { DeltaExecutionService } from './services/DeltaExecutionService.js';
import { DeltaPortfolioService } from './services/DeltaPortfolioService.js';

export function createDeltaExchangeRouter(
  syncService: DeltaSyncService,
  executionService: DeltaExecutionService,
  portfolioService: DeltaPortfolioService
): Router {
  const router = Router();
  const controller = new DeltaExchangeController(syncService, executionService, portfolioService);

  router.get('/health', controller.getHealth);
  router.get('/portfolio', controller.getPortfolio);
  router.get('/orders', controller.getOrders);
  router.get('/positions', controller.getPositions);
  router.get('/history', controller.getHistory);
  router.post('/orders', controller.placeOrder);
  router.post('/orders/place', controller.placeOrder);
  router.delete('/orders/:id', controller.cancelOrder);
  router.post('/orders/cancel', controller.cancelOrder);

  return router;
}
