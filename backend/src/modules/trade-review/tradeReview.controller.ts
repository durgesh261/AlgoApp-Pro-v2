import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { TradeReviewEngineService } from './services/tradeReviewEngine.service.js';
import { TradeJournalService } from './services/tradeJournal.service.js';
import { TradeReviewExporterService } from './services/tradeReviewExporter.service.js';

const reviewEngine = new TradeReviewEngineService();
const journalService = new TradeJournalService();

export const getTradeReview = async (req: Request, res: Response): Promise<void> => {
  const { tradeId } = req.params;
  const review = await reviewEngine.getTradeReview(tradeId || 'SAMPLE-TRD-1');

  const response: ApiResponse<typeof review> = {
    success: true,
    data: review,
    meta: {
      requestId: (req as any).correlationId || 'req-trade-review',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const saveJournalNote = async (req: Request, res: Response): Promise<void> => {
  const { tradeId } = req.params;
  const updatedNote = await journalService.saveJournalNote(tradeId || 'SAMPLE-TRD-1', req.body);

  const response: ApiResponse<typeof updatedNote> = {
    success: true,
    data: updatedNote,
    meta: {
      requestId: (req as any).correlationId || 'req-save-journal',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getPerformanceSummary = async (req: Request, res: Response): Promise<void> => {
  const summary = await reviewEngine.getPerformanceSummary();

  const response: ApiResponse<typeof summary> = {
    success: true,
    data: summary,
    meta: {
      requestId: (req as any).correlationId || 'req-perf-summary',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const exportTradeReviewCsv = async (req: Request, res: Response): Promise<void> => {
  const { tradeId } = req.params;
  const review = await reviewEngine.getTradeReview(tradeId || 'SAMPLE-TRD-1');
  const csv = TradeReviewExporterService.exportCsv(review);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="trade_review_${tradeId}.csv"`);
  res.status(200).send(csv);
};

export const exportTradeReviewJson = async (req: Request, res: Response): Promise<void> => {
  const { tradeId } = req.params;
  const review = await reviewEngine.getTradeReview(tradeId || 'SAMPLE-TRD-1');
  const json = TradeReviewExporterService.exportJson(review);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="trade_review_${tradeId}.json"`);
  res.status(200).send(json);
};
