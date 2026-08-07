import { Router } from 'express';
import { ApiResponse, getIsoUtcTimestamp, ScannerStateDto } from '@algoapp/shared';
import { config } from '../../config/index.js';
import { marketScanner as MarketScannerService } from './services/MarketScannerService.js';
import { DynamicRiskLeverageService } from './services/DynamicRiskLeverageService.js';

export const liveTradingRouter = Router();

liveTradingRouter.get('/status', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const response: ApiResponse<{ module: string; status: string }> = {
    success: true,
    data: {
      module: 'live-trading',
      status: 'initialized',
    },
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.get('/scanner/status', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const status = MarketScannerService.getStatus();
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/start', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const status = MarketScannerService.start();
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/pause', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const status = MarketScannerService.pause();
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/resume', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const status = MarketScannerService.resume();
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/stop', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const status = MarketScannerService.stop();
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/pair/pause', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const symbol = req.body?.symbol || req.query?.symbol;
  if (!symbol) {
    res.status(400).json({ success: false, error: 'Symbol is required' });
    return;
  }
  const status = MarketScannerService.pausePair(String(symbol));
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/pair/resume', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const symbol = req.body?.symbol || req.query?.symbol;
  if (!symbol) {
    res.status(400).json({ success: false, error: 'Symbol is required' });
    return;
  }
  const status = MarketScannerService.resumePair(String(symbol));
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/pair/stop', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const symbol = req.body?.symbol || req.query?.symbol;
  if (!symbol) {
    res.status(400).json({ success: false, error: 'Symbol is required' });
    return;
  }
  const status = MarketScannerService.stopPair(String(symbol));
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

liveTradingRouter.post('/scanner/pair/set-status', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const { symbol, status: pairStatus } = req.body || {};
  if (!symbol || !pairStatus) {
    res.status(400).json({ success: false, error: 'Symbol and status are required' });
    return;
  }
  const status = MarketScannerService.setPairStatus(String(symbol), pairStatus);
  const response: ApiResponse<ScannerStateDto> = {
    success: true,
    data: status,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

const handleCalculateRisk = (req: any, res: any) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const source = req.method === 'POST' ? req.body : req.query;
  const { accountBalance, entryPrice, stopLossPrice, direction, side } = source;
  const result = DynamicRiskLeverageService.calculateRiskAndLeverage({
    accountBalance: Number(accountBalance) || 1000,
    entryPrice: Number(entryPrice) || 60000,
    stopLossPrice: Number(stopLossPrice) || 59000,
    direction: direction === 'SELL' || side === 'SELL' ? 'SELL' : 'BUY',
  });
  const response: ApiResponse<any> = {
    success: true,
    data: result,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
};

liveTradingRouter.post('/calculate-risk', handleCalculateRisk);
liveTradingRouter.get('/calculate-risk', handleCalculateRisk);
liveTradingRouter.post('/risk/calculate', handleCalculateRisk);
liveTradingRouter.get('/risk/calculate', handleCalculateRisk);

