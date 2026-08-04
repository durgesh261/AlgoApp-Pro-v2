import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { createPaperOrderSchema, modifyPaperOrderSchema, updatePaperRiskConfigSchema } from '@algoapp/shared';
import { PaperWalletService } from './services/paperWallet.service.js';
import { PaperOrderService } from './services/paperOrder.service.js';
import { PaperPositionService } from './services/paperPosition.service.js';
import { PaperRiskService } from './services/paperRisk.service.js';
import { PaperJournalService } from './services/paperJournal.service.js';
import { PaperAnalyticsService } from './services/paperAnalytics.service.js';

export const getPaperWallet = async (req: Request, res: Response): Promise<void> => {
  const wallet = await PaperWalletService.getWallet();
  const response: ApiResponse<typeof wallet> = {
    success: true,
    data: wallet,
    meta: {
      requestId: (req as any).correlationId || 'req-paper-wallet',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getPaperOrders = async (req: Request, res: Response): Promise<void> => {
  const orders = await PaperOrderService.getOrders();
  const response: ApiResponse<typeof orders> = {
    success: true,
    data: orders,
    meta: {
      requestId: (req as any).correlationId || 'req-paper-orders',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const createPaperOrder = async (req: Request, res: Response): Promise<void> => {
  const validated = createPaperOrderSchema.parse(req.body);
  const order = await PaperOrderService.createOrder(validated);
  const response: ApiResponse<typeof order> = {
    success: true,
    data: order,
    meta: {
      requestId: (req as any).correlationId || 'req-create-paper-order',
      timestamp: new Date().toISOString(),
    },
  };
  res.status(201).json(response);
};

export const cancelPaperOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const cancelled = await PaperOrderService.cancelOrder(id as string);
  if (!cancelled) {
    res.status(404).json({ success: false, error: { message: 'Order not found' } });
    return;
  }
  const response: ApiResponse<typeof cancelled> = {
    success: true,
    data: cancelled,
    meta: {
      requestId: (req as any).correlationId || 'req-cancel-paper-order',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const modifyPaperOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const validated = modifyPaperOrderSchema.parse(req.body);
  const modified = await PaperOrderService.modifyOrder(id as string, validated);
  if (!modified) {
    res.status(404).json({ success: false, error: { message: 'Order not found' } });
    return;
  }
  const response: ApiResponse<typeof modified> = {
    success: true,
    data: modified,
    meta: {
      requestId: (req as any).correlationId || 'req-modify-paper-order',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getPaperPositions = async (req: Request, res: Response): Promise<void> => {
  const positions = await PaperPositionService.getOpenPositions();
  const response: ApiResponse<typeof positions> = {
    success: true,
    data: positions,
    meta: {
      requestId: (req as any).correlationId || 'req-paper-positions',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getClosedPaperPositions = async (req: Request, res: Response): Promise<void> => {
  const closed = await PaperPositionService.getClosedPositions();
  const response: ApiResponse<typeof closed> = {
    success: true,
    data: closed,
    meta: {
      requestId: (req as any).correlationId || 'req-paper-positions-closed',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const closePaperPosition = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { exitPrice } = req.body;
  const closed = await PaperPositionService.closePosition(id as string, exitPrice || 64000.0);
  if (!closed) {
    res.status(404).json({ success: false, error: { message: 'Position not found' } });
    return;
  }
  const response: ApiResponse<typeof closed> = {
    success: true,
    data: closed,
    meta: {
      requestId: (req as any).correlationId || 'req-close-paper-position',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getPaperRiskConfig = async (req: Request, res: Response): Promise<void> => {
  const risk = await PaperRiskService.getRiskConfig();
  const response: ApiResponse<typeof risk> = {
    success: true,
    data: risk,
    meta: {
      requestId: (req as any).correlationId || 'req-paper-risk',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const updatePaperRiskConfig = async (req: Request, res: Response): Promise<void> => {
  const validated = updatePaperRiskConfigSchema.parse(req.body);
  const updated = await PaperRiskService.updateRiskConfig(validated);
  const response: ApiResponse<typeof updated> = {
    success: true,
    data: updated,
    meta: {
      requestId: (req as any).correlationId || 'req-update-paper-risk',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getPaperJournal = async (req: Request, res: Response): Promise<void> => {
  const journal = await PaperJournalService.getJournalEntries();
  const response: ApiResponse<typeof journal> = {
    success: true,
    data: journal,
    meta: {
      requestId: (req as any).correlationId || 'req-paper-journal',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getPaperAnalytics = async (req: Request, res: Response): Promise<void> => {
  const analytics = await PaperAnalyticsService.getAnalytics();
  const response: ApiResponse<typeof analytics> = {
    success: true,
    data: analytics,
    meta: {
      requestId: (req as any).correlationId || 'req-paper-analytics',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
