import { Router } from 'express';
import { ApiResponse, getIsoUtcTimestamp, LiveNewsItemDto, NewsCategory, NewsImportance } from '@algoapp/shared';
import { config } from '../../config/index.js';
import { LiveNewsService } from './services/LiveNewsService.js';
import { EconomicCalendarService } from './services/EconomicCalendarService.js';

export const newsRouter = Router();

newsRouter.get('/', async (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const { category, importance, symbol, limit, forceRefresh } = req.query;

  const news = await LiveNewsService.getNews({
    category: category as NewsCategory | undefined,
    importance: importance as NewsImportance | undefined,
    symbol: symbol as string | undefined,
    limit: limit ? parseInt(limit as string, 10) : 50,
    forceRefresh: forceRefresh === 'true',
  });

  const response: ApiResponse<LiveNewsItemDto[]> = {
    success: true,
    data: news,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

newsRouter.get('/calendar', async (req, res) => {
  const forceRefresh = req.query['forceRefresh'] === 'true';
  const events = await EconomicCalendarService.getCalendar(forceRefresh);
  res.status(200).json({
    success: true,
    data: events,
    meta: { timestamp: getIsoUtcTimestamp() },
  });
});
