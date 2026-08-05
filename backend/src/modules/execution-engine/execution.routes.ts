import { Router } from 'express';
import { ExecutionController } from './execution.controller.js';
import { ExecutionEngineService } from './services/ExecutionEngineService.js';

export function createExecutionRouter(executionService: ExecutionEngineService): Router {
  const router = Router();
  const controller = new ExecutionController(executionService);

  router.post('/orders', controller.placeOrder);
  router.post('/orders/:id/cancel', controller.cancelOrder);
  router.post('/orders/cancel-all', controller.cancelAllOrders);
  router.post('/positions/:symbol/close', controller.closePosition);
  router.post('/orders/:id/modify', controller.modifyOrder);
  router.post('/validate', controller.validateOrder);
  router.get('/active', controller.getActiveOrders);
  router.get('/history', controller.getExecutionHistory);
  router.post('/kill-switch', controller.toggleKillSwitch);

  return router;
}
