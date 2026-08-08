import { Router } from 'express';
import { NewsAggregatorService } from './services/newsAggregator.service.js';
import { EconomicCalendarService } from '../macro/services/economicCalendar.service.js';
import { MacroDataService } from '../macro/services/macroData.service.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// NEWS ENDPOINTS
// ═══════════════════════════════════════════════════════════════

router.get('/live', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const articles = await NewsAggregatorService.getRecentArticles(category, limit);
    res.json({ success: true, data: articles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/ticker/:ticker', async (req, res) => {
  try {
    const articles = await NewsAggregatorService.getArticlesByTicker(req.params.ticker.toUpperCase(), 20);
    res.json({ success: true, data: articles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.status(400).json({ success: false, error: 'Query required' });
      return;
    }
    const articles = await NewsAggregatorService.searchArticles(q, 20);
    res.json({ success: true, data: articles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// MACRO / ECONOMIC CALENDAR
// ═══════════════════════════════════════════════════════════════

router.get('/calendar', async (_req, res) => {
  try {
    const events = await EconomicCalendarService.fetchCalendar();
    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/calendar/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const events = EconomicCalendarService.getUpcomingMajorEvents(limit);
    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/macro/data', async (_req, res) => {
  try {
    const data = await MacroDataService.getLatestMacroData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export const newsRouter = router;
