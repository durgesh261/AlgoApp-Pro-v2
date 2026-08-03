import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { TradeSyncService } from './services/tradeSync.service.js';
import { WalletEngineService } from './services/walletEngine.service.js';
import { ChallengeEngineService } from './services/challengeEngine.service.js';

const syncService = new TradeSyncService();
const walletService = new WalletEngineService();
const challengeService = new ChallengeEngineService();

export const getWalletState = async (req: Request, res: Response): Promise<void> => {
  const wallet = await walletService.getWalletState();

  const response: ApiResponse<typeof wallet> = {
    success: true,
    data: wallet,
    meta: {
      requestId: (req as any).correlationId || 'req-wallet-state',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getChallengeState = async (req: Request, res: Response): Promise<void> => {
  const challenge = await challengeService.getChallengeState();

  const response: ApiResponse<typeof challenge> = {
    success: true,
    data: challenge,
    meta: {
      requestId: (req as any).correlationId || 'req-challenge-state',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getLedger = async (req: Request, res: Response): Promise<void> => {
  const ledger = await syncService.getLedgerEntries();

  const response: ApiResponse<typeof ledger> = {
    success: true,
    data: ledger,
    meta: {
      requestId: (req as any).correlationId || 'req-trade-ledger',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const syncTrade = async (req: Request, res: Response): Promise<void> => {
  const entry = await syncService.syncTradeFromExchange(req.body);

  const response: ApiResponse<typeof entry> = {
    success: true,
    data: entry,
    meta: {
      requestId: (req as any).correlationId || 'req-sync-trade',
      timestamp: new Date().toISOString(),
    },
  };

  res.status(201).json(response);
};

export const resetChallenge = async (req: Request, res: Response): Promise<void> => {
  const challenge = await challengeService.resetChallenge();

  const response: ApiResponse<typeof challenge> = {
    success: true,
    data: challenge,
    meta: {
      requestId: (req as any).correlationId || 'req-reset-challenge',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const exportLedgerCsv = async (_req: Request, res: Response): Promise<void> => {
  const csv = await syncService.exportLedgerCsv();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="trade_ledger.csv"');
  res.status(200).send(csv);
};
