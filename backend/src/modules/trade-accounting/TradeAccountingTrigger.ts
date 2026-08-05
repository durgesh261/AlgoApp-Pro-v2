import { prisma } from '../../db.js';
import { eventBus } from '../../services/EventBus.js';

export interface PositionCloseEventData {
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  exitPrice: number;
  leverage?: number | undefined;
  openedAt?: string | undefined;
  closedAt?: string | undefined;
  clientOrderId?: string | undefined;
}

export interface TradeAccountedResult {
  tradeId: string;
  symbol: string;
  grossPnL: number;
  tradingFees: number;
  fundingFees: number;
  taxObligationSTCG: number; // 30% flat tax on profit
  netPnL: number;
  durationSeconds: number;
  riskRewardRatio: number;
  journalNoteId?: string | undefined;
  reviewId?: string | undefined;
}

export class TradeAccountingTrigger {
  public async onPositionClose(data: PositionCloseEventData): Promise<TradeAccountedResult> {
    const notional = data.size * data.entryPrice;
    const exitNotional = data.size * data.exitPrice;

    // Gross PnL
    let grossPnL = 0;
    if (data.side === 'buy') {
      grossPnL = exitNotional - notional;
    } else {
      grossPnL = notional - exitNotional;
    }

    // Trading fees (Taker fee approx 0.05% each leg = 0.10% total)
    const tradingFees = (notional + exitNotional) * 0.0005;
    const fundingFees = 0; // Settled continuously in Delta wallet balance

    // Indian VDA STCG 30% Flat Tax on positive gross gains
    const taxObligationSTCG = grossPnL > 0 ? grossPnL * 0.3 : 0;

    // Net PnL after fees and taxes
    const netPnL = grossPnL - tradingFees - fundingFees - taxObligationSTCG;

    // Duration calculation
    const openTime = data.openedAt ? new Date(data.openedAt).getTime() : Date.now() - 3600 * 1000;
    const closeTime = data.closedAt ? new Date(data.closedAt).getTime() : Date.now();
    const durationSeconds = Math.max(1, Math.round((closeTime - openTime) / 1000));

    // Risk-to-reward estimate
    const riskRewardRatio = grossPnL > 0 ? parseFloat((grossPnL / Math.max(1, tradingFees * 5)).toFixed(2)) : 0;

    const tradeId = `TRD-${Date.now()}-${data.symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

    let journalNoteId: string | undefined;
    let reviewId: string | undefined;

    // 1. Attempt to persist into Prisma TradeLedgerEntry
    try {
      if ((prisma as any).tradeLedgerEntry?.create) {
        await (prisma as any).tradeLedgerEntry.create({
          data: {
            tradeId,
            symbol: data.symbol,
            side: data.side.toUpperCase(),
            size: data.size,
            entryPrice: data.entryPrice,
            exitPrice: data.exitPrice,
            grossPnL,
            tradingFee: tradingFees,
            netPnL,
            closedAt: new Date(closeTime),
          },
        });
      }
    } catch (err) {
      console.warn('[TradeAccountingTrigger] Prisma TradeLedgerEntry fallback:', err);
    }

    // 2. Auto-create Journal Note
    try {
      if ((prisma as any).tradeJournalNote?.create) {
        const note = await (prisma as any).tradeJournalNote.create({
          data: {
            tradeId,
            symbol: data.symbol,
            content: `Auto-recorded trade: ${data.side.toUpperCase()} ${data.size} ${data.symbol} closed @ $${data.exitPrice}. Net PnL: $${netPnL.toFixed(2)}.`,
            tags: ['AUTO_EXECUTION', grossPnL >= 0 ? 'WIN' : 'LOSS', data.symbol],
          },
        });
        journalNoteId = note?.id;
      }
    } catch {
      // Non-blocking fallback
    }

    // 3. Auto-create Trade Review
    try {
      if ((prisma as any).tradeReview?.create) {
        const review = await (prisma as any).tradeReview.create({
          data: {
            tradeId,
            symbol: data.symbol,
            executionScore: grossPnL >= 0 ? 95 : 75,
            reviewText: `Automated post-trade risk review for ${data.symbol}. Gross PnL: $${grossPnL.toFixed(2)}, Tax: $${taxObligationSTCG.toFixed(2)}, Net PnL: $${netPnL.toFixed(2)}.`,
            status: 'COMPLETED',
          },
        });
        reviewId = review?.id;
      }
    } catch {
      // Non-blocking fallback
    }

    const result: TradeAccountedResult = {
      tradeId,
      symbol: data.symbol,
      grossPnL: parseFloat(grossPnL.toFixed(4)),
      tradingFees: parseFloat(tradingFees.toFixed(4)),
      fundingFees: parseFloat(fundingFees.toFixed(4)),
      taxObligationSTCG: parseFloat(taxObligationSTCG.toFixed(4)),
      netPnL: parseFloat(netPnL.toFixed(4)),
      durationSeconds,
      riskRewardRatio,
      journalNoteId,
      reviewId,
    };

    eventBus.emit('trade:accounted', result);
    return result;
  }
}

export const tradeAccountingTrigger = new TradeAccountingTrigger();
