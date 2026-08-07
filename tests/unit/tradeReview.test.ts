import { describe, it, expect, vi } from 'vitest';
import { TradeReviewEngineService } from '../../backend/src/modules/trade-review/services/tradeReviewEngine.service';
import { AiTradeReviewService } from '../../backend/src/modules/trade-review/services/aiTradeReview.service';
import { TradeJournalService } from '../../backend/src/modules/trade-review/services/tradeJournal.service';
import { ChartSnapshotService } from '../../backend/src/modules/trade-review/services/chartSnapshot.service';
import { TradeReviewExporterService } from '../../backend/src/modules/trade-review/services/tradeReviewExporter.service';

vi.mock('../../backend/src/modules/trade-accounting/services/tradeSync.service.js', () => {
  return {
    tradeSyncService: {
      getLedgerEntries: vi.fn().mockResolvedValue([
        {
          id: 'mock-uuid',
          tradeId: 'TRD-TEST-100',
          exchangeOrderId: 'mock-order-id',
          symbol: 'BTCUSD.P',
          timeframe: '1H',
          strategyProfileId: 'DEF-1H-PROF',
          side: 'LONG',
          entryPrice: 60000,
          exitPrice: 65000,
          quantity: 1,
          marginUsed: 100,
          leverage: 10,
          riskPercent: 1,
          rewardPercent: 2,
          stopLoss: 59000,
          takeProfit: 65000,
          grossPnL: 5000,
          tradingFee: 10,
          fundingFee: 2,
          tax: 50,
          netPnL: 4938,
          durationSeconds: 3600,
          executionLatencyMs: 120,
          decisionConfidence: 95,
          decisionExplanation: 'Test reason',
          resultStatus: 'WIN',
          syncStatus: 'SYNCED',
          executedAt: new Date(),
          closedAt: new Date(),
        }
      ])
    }
  }
});

describe('Professional Trade Review Center Test Suite', () => {
  const reviewEngine = new TradeReviewEngineService();
  const journalService = new TradeJournalService();

  it('1. TradeReviewEngineService - assembles complete TradeReviewDetailDto', async () => {
    const tradeId = 'TRD-TEST-100';
    const detail = await reviewEngine.getTradeReview(tradeId);

    expect(detail).toBeDefined();
    expect(detail.tradeId).toBe(tradeId);
    expect(detail.ledgerEntry).toBeDefined();
    expect(detail.aiReview).toBeDefined();
    expect(detail.chartSnapshot).toBeDefined();
  });

  it('2. AiTradeReviewService - generates deterministic trade summary and risk analysis', async () => {
    const detail = await reviewEngine.getTradeReview('TRD-TEST-100');
    const aiReview = AiTradeReviewService.generateAiReview(detail.ledgerEntry);

    expect(aiReview.tradeSummary).toContain('LONG trade on BTCUSD.P');
    expect(aiReview.strengths.length).toBeGreaterThan(0);
    expect(aiReview.improvementSuggestions.length).toBeGreaterThan(0);
  });

  it('3. TradeJournalService - saves and retrieves trader notes and tags', async () => {
    const tradeId = 'TRD-TEST-100';
    const updatedNote = await journalService.saveJournalNote(tradeId, {
      idea: 'Test Trade Idea',
      whyEntered: 'Test Entry',
      emotion: 'CONFIDENT',
      confidenceBefore: 9,
      tags: ['UNIT_TEST', 'WINNER'],
    });

    expect(updatedNote.idea).toBe('Test Trade Idea');
    expect(updatedNote.emotion).toBe('CONFIDENT');
    expect(updatedNote.tags).toContain('UNIT_TEST');

    const fetched = await journalService.getJournalNote(tradeId);
    expect(fetched?.idea).toBe('Test Trade Idea');
  });

  it('4. ChartSnapshotService - reconstructs PAT & SMC supply/demand zone ranges', () => {
    const snap = ChartSnapshotService.getSnapshot(63850, 65200, 63250, 65800);

    expect(snap.entryPrice).toBe(63850);
    expect(snap.exitPrice).toBe(65200);
    expect(snap.supplyZoneRange).toBeDefined();
    expect(snap.demandZoneRange).toBeDefined();
  });

  it('5. TradeReviewExporterService - formats CSV and JSON exports', async () => {
    const detail = await reviewEngine.getTradeReview('TRD-TEST-100');
    const csv = TradeReviewExporterService.exportCsv(detail);
    const json = TradeReviewExporterService.exportJson(detail);

    expect(csv).toContain('TradeID,Symbol,Timeframe');
    expect(csv).toContain('TRD-TEST-100');

    const parsed = JSON.parse(json);
    expect(parsed.tradeId).toBe('TRD-TEST-100');
  });
});
