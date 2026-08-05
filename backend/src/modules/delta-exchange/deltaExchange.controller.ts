import { Request, Response } from 'express';
import { DeltaSyncService } from './services/DeltaSyncService.js';
import { DeltaExecutionService } from './services/DeltaExecutionService.js';
import { DeltaPortfolioService } from './services/DeltaPortfolioService.js';

export class DeltaExchangeController {
  constructor(
    private syncService: DeltaSyncService,
    private executionService: DeltaExecutionService,
    private portfolioService: DeltaPortfolioService
  ) {}

  public getHealth = (_req: Request, res: Response): void => {
    const health = this.syncService.getHealth();
    res.json({
      success: true,
      data: health,
    });
  };

  public getPortfolio = (_req: Request, res: Response): void => {
    const portfolio = this.portfolioService.getPortfolio();
    res.json({
      success: true,
      data: portfolio,
    });
  };

  public getOrders = (_req: Request, res: Response): void => {
    const orders = this.syncService.getOrders();
    res.json({
      success: true,
      data: orders,
    });
  };

  public getPositions = (_req: Request, res: Response): void => {
    const positions = this.syncService.getPositions();
    res.json({
      success: true,
      data: positions,
    });
  };

  public getHistory = (_req: Request, res: Response): void => {
    const history = this.syncService.getHistory();
    res.json({
      success: true,
      data: history,
    });
  };

  public placeOrder = async (req: Request, res: Response): Promise<void> => {
    const { symbol, side, orderType, size, price, stopPrice, stopLoss, takeProfit, clientOrderId, reduceOnly } = req.body;

    if (!symbol || !side || !orderType || !size) {
      res.status(400).json({ success: false, message: 'symbol, side, orderType, size are required' });
      return;
    }

    const result = await this.executionService.placeOrder({
      symbol,
      side,
      orderType,
      size: Number(size),
      price: price !== undefined ? Number(price) : undefined,
      stopPrice: stopPrice !== undefined ? Number(stopPrice) : undefined,
      stopLoss: stopLoss !== undefined ? Number(stopLoss) : undefined,
      takeProfit: takeProfit !== undefined ? Number(takeProfit) : undefined,
      clientOrderId,
      reduceOnly,
    });

    if (result.success) {
      res.json({ success: true, data: result });
    } else {
      res.status(400).json({ success: false, error: result.error, latencyMs: result.latencyMs });
    }
  };

  public cancelOrder = async (req: Request, res: Response): Promise<void> => {
    const orderId = Number(req.params['id'] || req.body.id);
    const productId = req.body.productId !== undefined ? Number(req.body.productId) : undefined;

    if (!orderId) {
      res.status(400).json({ success: false, message: 'orderId is required' });
      return;
    }

    const result = await this.executionService.cancelOrder(orderId, productId);
    if (result.success) {
      res.json({ success: true, data: result });
    } else {
      res.status(400).json({ success: false, error: result.error, latencyMs: result.latencyMs });
    }
  };
}
