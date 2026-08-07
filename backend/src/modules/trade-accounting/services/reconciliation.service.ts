import { ReconciliationReportDto, ReconciliationMismatch } from '@algoapp/shared';
import { prisma } from '../../../db.js';
import { deltaSyncService } from '../../delta-exchange/index.js';
import { tradeSyncService } from './tradeSync.service.js';

export class ReconciliationService {
  /**
   * Reconciles recorded immutable Trade Ledger against live Delta Exchange order history and fills.
   */
  public async reconcileLedger(): Promise<ReconciliationReportDto> {
    const timestamp = new Date().toISOString();
    const ledgerEntries = await tradeSyncService.getLedgerEntries();
    const deltaHistory = deltaSyncService.getHistory();

    const mismatches: ReconciliationMismatch[] = [];

    // Map delta history by order ID / client order ID
    const deltaOrderMap = new Map<string, any>();
    for (const order of deltaHistory) {
      if (order.id) deltaOrderMap.set(String(order.id), order);
      if (order.client_order_id) deltaOrderMap.set(order.client_order_id, order);
    }

    // Reconcile each ledger entry
    for (const entry of ledgerEntries) {
      if (entry.executionMode === 'PAPER') {
        // Paper trading is self-contained and mathematically verified
        continue;
      }

      const matchingOrder =
        deltaOrderMap.get(entry.exchangeOrderId) ||
        (entry.exchangeTradeId ? deltaOrderMap.get(entry.exchangeTradeId) : undefined);

      if (!matchingOrder) {
        continue;
      }

      // Check price mismatch
      const exchangePrice = parseFloat(matchingOrder.price || matchingOrder.average_fill_price || '0');
      if (exchangePrice > 0 && Math.abs(exchangePrice - entry.exitPrice) / exchangePrice > 0.005) {
        mismatches.push({
          component: 'ORDER',
          algoAppState: `$${entry.exitPrice.toFixed(2)} (${entry.symbol})`,
          exchangeState: `$${exchangePrice.toFixed(2)}`,
          difference: `Discrepancy: $${(Math.abs(exchangePrice - entry.exitPrice) * entry.quantity).toFixed(2)}`,
        });
      }

      // Check quantity mismatch
      const exchangeSize = parseFloat(matchingOrder.size || '0');
      if (exchangeSize > 0 && Math.abs(exchangeSize - entry.quantity) > 0.0001) {
        mismatches.push({
          component: 'POSITION',
          algoAppState: `${entry.quantity} (${entry.symbol})`,
          exchangeState: `${exchangeSize}`,
          difference: `Size Discrepancy: ${Math.abs(exchangeSize - entry.quantity)}`,
        });
      }
    }

    const isMatched = mismatches.length === 0;
    const status: 'MATCHED' | 'FAILED' | 'MISMATCH_RESOLVED' = isMatched ? 'MATCHED' : 'FAILED';
    const reportId = `REC-${Date.now()}`;

    const report: ReconciliationReportDto = {
      id: reportId,
      reconciledAt: timestamp,
      status,
      mismatchesCount: mismatches.length,
      mismatches,
    };

    // Persist to Prisma ReconciliationLog
    try {
      if (prisma.reconciliationLog?.create) {
        await prisma.reconciliationLog.create({
          data: {
            reconciledAt: new Date(timestamp),
            status,
            mismatchesCount: mismatches.length,
            mismatchesJson: JSON.stringify(mismatches),
          },
        });
      }
    } catch (err) {
      console.warn('[ReconciliationService] Prisma ReconciliationLog notice:', err instanceof Error ? err.message : err);
    }

    return report;
  }
}

export const reconciliationService = new ReconciliationService();
