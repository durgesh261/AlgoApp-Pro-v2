import { Router } from 'express';
import { ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';

import { TradeIntelligenceService } from './services/tradeIntelligence.service.js';
import { StrategyPerformanceMonitor } from './services/strategyPerformanceMonitor.service.js';
import { MarketRegimeDetectorService } from './services/marketRegimeDetector.service.js';
import { PatternDiscoveryService } from './services/patternDiscovery.service.js';
import { TraderAnalyticsService } from './services/traderAnalytics.service.js';
import { StrategyRecommendationEngineService } from './services/strategyRecommendation.service.js';
import { JournalIntelligenceService } from './services/journalIntelligence.service.js';
import { RiskIntelligenceService } from './services/riskIntelligence.service.js';

export const analysisRouter = Router();

analysisRouter.get('/status', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const response: ApiResponse<{ module: string; status: string }> = {
    success: true,
    data: {
      module: 'analysis',
      status: 'initialized',
    },
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

analysisRouter.get('/intelligence-score', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const sampleTrade = {
    id: 'TRD-1785756576484',
    symbol: 'BTCUSD.P',
    netPnL: 639.55,
    marginUsed: 3192.50,
    riskRewardRatio: 3.25,
    confidence: 94.5,
    executionLatencyMs: 18,
  };
  const data = TradeIntelligenceService.calculateIntelligenceScore(sampleTrade);

  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});

analysisRouter.get('/strategy-metrics', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const data = StrategyPerformanceMonitor.calculateStrategyMetrics();
  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});

analysisRouter.get('/market-regime', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const symbol = (req.query.symbol as string) || 'BTCUSD.P';
  const timeframe = (req.query.timeframe as string) || '1H';
  const data = MarketRegimeDetectorService.detectRegime(symbol, timeframe);
  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});

analysisRouter.get('/patterns', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const data = PatternDiscoveryService.discoverPatterns();
  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});

analysisRouter.get('/trader-analytics', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const data = TraderAnalyticsService.getTraderAnalytics();
  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});

analysisRouter.get('/recommendations', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const data = StrategyRecommendationEngineService.getRecommendations();
  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});

analysisRouter.get('/journal-intelligence', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const data = JournalIntelligenceService.getJournalIntelligence();
  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});

analysisRouter.get('/risk-intelligence', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const data = RiskIntelligenceService.getRiskIntelligence();
  res.status(200).json({
    success: true,
    data,
    meta: { requestId, timestamp: getIsoUtcTimestamp() },
  });
});
