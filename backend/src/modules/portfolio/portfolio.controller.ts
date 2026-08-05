import { Request, Response } from 'express';
import { PortfolioAggregationService } from './PortfolioAggregationService.js';

export class PortfolioController {
  constructor(private portfolioService: PortfolioAggregationService) {}

  public getSummary = async (_req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.portfolioService.getSummary();
      res.json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getWallet = async (_req: Request, res: Response): Promise<void> => {
    try {
      const wallet = await this.portfolioService.getWallet();
      res.json({
        success: true,
        data: wallet,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getPositions = async (_req: Request, res: Response): Promise<void> => {
    try {
      const positions = await this.portfolioService.getPositions();
      res.json({
        success: true,
        data: positions,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.portfolioService.getOrders();
      res.json({
        success: true,
        data: orders,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getPnl = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pnl = await this.portfolioService.getPnl();
      res.json({
        success: true,
        data: pnl,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getAnalytics = async (_req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.portfolioService.getAnalytics();
      res.json({
        success: true,
        data: analytics,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getFunding = async (_req: Request, res: Response): Promise<void> => {
    try {
      const funding = await this.portfolioService.getFunding();
      res.json({
        success: true,
        data: funding,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
