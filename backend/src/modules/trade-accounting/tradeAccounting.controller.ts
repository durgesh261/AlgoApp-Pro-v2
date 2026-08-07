import { Request, Response } from 'express';
import { ApiResponse, TradeLedgerFilterDto } from '@algoapp/shared';
import { tradeSyncService } from './services/tradeSync.service.js';
import { WalletEngineService } from './services/walletEngine.service.js';
import { ChallengeEngineService } from './services/challengeEngine.service.js';
import { ResetChallengeInput } from '@algoapp/shared';
import { deltaPortfolioService } from '../delta-exchange/index.js';
import { reconciliationService } from './services/reconciliation.service.js';

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
  const filters: TradeLedgerFilterDto = {
    symbol: req.query['symbol'] ? String(req.query['symbol']) : undefined,
    timeframe: req.query['timeframe'] ? String(req.query['timeframe']) : undefined,
    executionMode: req.query['executionMode'] ? (req.query['executionMode'] as any) : undefined,
    side: req.query['side'] ? (req.query['side'] as any) : undefined,
    resultStatus: req.query['resultStatus'] ? (req.query['resultStatus'] as any) : undefined,
    startDate: req.query['startDate'] ? String(req.query['startDate']) : undefined,
    endDate: req.query['endDate'] ? String(req.query['endDate']) : undefined,
    strategyProfileId: req.query['strategyProfileId'] ? String(req.query['strategyProfileId']) : undefined,
    minPnL: req.query['minPnL'] ? parseFloat(String(req.query['minPnL'])) : undefined,
    maxPnL: req.query['maxPnL'] ? parseFloat(String(req.query['maxPnL'])) : undefined,
    limit: req.query['limit'] ? parseInt(String(req.query['limit']), 10) : 100,
    offset: req.query['offset'] ? parseInt(String(req.query['offset']), 10) : 0,
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined);
  const ledger = hasFilters
    ? await tradeSyncService.getFilteredLedgerEntries(filters)
    : await tradeSyncService.getLedgerEntries();

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

export const getAccountingSummary = async (req: Request, res: Response): Promise<void> => {
  const filters: TradeLedgerFilterDto = {
    symbol: req.query['symbol'] ? String(req.query['symbol']) : undefined,
    timeframe: req.query['timeframe'] ? String(req.query['timeframe']) : undefined,
    executionMode: req.query['executionMode'] ? (req.query['executionMode'] as any) : undefined,
    side: req.query['side'] ? (req.query['side'] as any) : undefined,
    resultStatus: req.query['resultStatus'] ? (req.query['resultStatus'] as any) : undefined,
    startDate: req.query['startDate'] ? String(req.query['startDate']) : undefined,
    endDate: req.query['endDate'] ? String(req.query['endDate']) : undefined,
  };

  const summary = await tradeSyncService.getAccountingSummary(filters);

  const response: ApiResponse<typeof summary> = {
    success: true,
    data: summary,
    meta: {
      requestId: (req as any).correlationId || 'req-accounting-summary',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const syncTrade = async (req: Request, res: Response): Promise<void> => {
  const entry = await tradeSyncService.syncTradeFromExchange(req.body);

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
  const input: ResetChallengeInput = req.body || {};
  let startingBalance = input.initialBalance ?? 10.0;
  
  // If not explicitly provided in request, attempt to fetch from Delta portfolio
  if (input.initialBalance === undefined) {
    try {
      const portfolio = deltaPortfolioService.getPortfolio();
      if (portfolio && portfolio.totalEquity > 0) {
        startingBalance = portfolio.totalEquity;
      }
    } catch (err) {
      // Delta service might not be initialized or connected, fallback to 10.0
    }
  }

  const challenge = await challengeService.resetChallenge({
    ...input,
    initialBalance: startingBalance
  });

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

export const exportLedgerCsv = async (req: Request, res: Response): Promise<void> => {
  const filters: TradeLedgerFilterDto = {
    symbol: req.query['symbol'] ? String(req.query['symbol']) : undefined,
    timeframe: req.query['timeframe'] ? String(req.query['timeframe']) : undefined,
    executionMode: req.query['executionMode'] ? (req.query['executionMode'] as any) : undefined,
    side: req.query['side'] ? (req.query['side'] as any) : undefined,
    resultStatus: req.query['resultStatus'] ? (req.query['resultStatus'] as any) : undefined,
    startDate: req.query['startDate'] ? String(req.query['startDate']) : undefined,
    endDate: req.query['endDate'] ? String(req.query['endDate']) : undefined,
  };

  const csv = await tradeSyncService.exportLedgerCsv(filters);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="trade_ledger_${Date.now()}.csv"`);
  res.status(200).send(csv);
};

export const exportLedgerJson = async (req: Request, res: Response): Promise<void> => {
  const filters: TradeLedgerFilterDto = {
    symbol: req.query['symbol'] ? String(req.query['symbol']) : undefined,
    timeframe: req.query['timeframe'] ? String(req.query['timeframe']) : undefined,
    executionMode: req.query['executionMode'] ? (req.query['executionMode'] as any) : undefined,
    side: req.query['side'] ? (req.query['side'] as any) : undefined,
    resultStatus: req.query['resultStatus'] ? (req.query['resultStatus'] as any) : undefined,
  };

  const json = await tradeSyncService.exportLedgerJson(filters);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="trade_ledger_${Date.now()}.json"`);
  res.status(200).send(json);
};

export const runReconciliation = async (req: Request, res: Response): Promise<void> => {
  const report = await reconciliationService.reconcileLedger();

  const response: ApiResponse<typeof report> = {
    success: true,
    data: report,
    meta: {
      requestId: (req as any).correlationId || 'req-reconciliation',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};
