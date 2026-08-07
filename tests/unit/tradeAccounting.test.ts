import { describe, it, expect, beforeEach } from 'vitest';
import { TradeAccountingService } from '../../backend/src/modules/trade-accounting/services/tradeAccounting.service';
import { WalletEngineService } from '../../backend/src/modules/trade-accounting/services/walletEngine.service';
import { ChallengeEngineService } from '../../backend/src/modules/trade-accounting/services/challengeEngine.service';
import { PositionSizingEngineService } from '../../backend/src/modules/trade-accounting/services/positionSizingEngine.service';
import { TradeSyncService } from '../../backend/src/modules/trade-accounting/services/tradeSync.service';

describe('Trade Accounting & 20-Day Challenge Manager Test Suite (Delta Exchange India Guidelines)', () => {
  const walletService = new WalletEngineService();
  const challengeService = new ChallengeEngineService();
  const syncService = new TradeSyncService();

  beforeEach(async () => {
    await challengeService.resetChallenge();
  });

  it('1. TradeAccountingService - calculates exact Gross PnL, 18% GST on fees, 0% TDS for Futures, and Net PnL', () => {
    // Buy 1 BTC @ 60,000, Sell @ 61,000 (Taker fee 0.05%, 18% GST on fees, Funding 0.01%)
    // Gross PnL = +$1,000.00
    // Entry base fee = 60,000 * 0.0005 = $30.00
    // Exit base fee = 61,000 * 0.0005 = $30.50 -> Base Trading Fee = $60.50
    // 18% GST on fees = $60.50 * 0.18 = $10.89
    // Total Trading Fee (with GST) = $71.39
    // Funding Fee = 60,000 * 0.0001 = $6.00
    // Gross Taxable Gain (deducting fees + GST) = 1,000 - 71.39 - 6.00 = $922.61
    // STCG Tax (30%) = 922.61 * 0.30 = $276.783
    // TDS = $0 (0% TDS for Futures as per Delta Exchange India guidelines)
    // Net Take-Home PnL = 1000 - 71.39 - 6.00 - 276.783 = $645.827
    const calc = TradeAccountingService.calculateAccounting({
      tradeId: 'TRD-1',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      entryPrice: 60000,
      exitPrice: 61000,
      quantity: 1.0,
      leverage: 10,
      isEntryMaker: false,
      isExitMaker: false,
    });

    expect(calc.grossPnL).toBe(1000);
    expect(calc.feeBreakdown.baseTradingFee).toBe(60.5);
    expect(calc.gstOnFees).toBe(10.89);
    expect(calc.tradingFee).toBe(71.39);
    expect(calc.fundingFee).toBe(6);
    expect(calc.taxBreakdown.tdsAmount).toBe(0);
    expect(calc.taxBreakdown.isTdsApplicable).toBe(false);
    expect(calc.taxBreakdown.lossOffsettingAllowed).toBe(true);
    expect(calc.tax).toBeCloseTo(276.783, 2);
    expect(calc.netPnL).toBeCloseTo(645.827, 2);
    expect(calc.marginUsed).toBe(6000);
  });

  it('2. WalletEngineService - updates equity and balance strictly post-accounting', async () => {
    const initialWallet = await walletService.getWalletState();
    expect(initialWallet.equity).toBe(10);

    // Apply +$1,000 Net PnL
    const updatedWallet = await walletService.applyTradeResult(1000, 1100, 5000);

    expect(updatedWallet.currentBalance).toBe(1010);
    expect(updatedWallet.equity).toBe(1010);
    expect(updatedWallet.realizedPnL).toBe(1000);
    expect(updatedWallet.peakEquity).toBe(1010);
  });

  it('3. ChallengeEngineService - tracks 10% target ($5,000) and marks status PASSED when achieved', async () => {
    const state1 = await challengeService.getChallengeState();
    expect(state1.status).toBe('RUNNING');

    // Record trade result of +$5,100 Net PnL
    const updatedState = await challengeService.recordTradeResult(5100, 5200);

    expect(updatedState.netProfit).toBe(5100);
    expect(updatedState.status).toBe('PASSED');
    expect(updatedState.winStreak).toBe(1);
  });

  it('4. PositionSizingEngineService - computes quantity for all capital allocation modes', () => {
    // 100% Available
    const res1 = PositionSizingEngineService.calculatePositionQuantity(50000, 60000, 59000, 10, {
      mode: 'HUNDRED_PERCENT_AVAILABLE',
    });
    expect(res1.marginUsed).toBe(50000);
    expect(res1.notionalValue).toBe(500000);

    // Fixed Amount ($10,000)
    const res2 = PositionSizingEngineService.calculatePositionQuantity(50000, 60000, 59000, 10, {
      mode: 'FIXED_AMOUNT',
      fixedAmountUsd: 10000,
    });
    expect(res2.marginUsed).toBe(10000);
    expect(res2.notionalValue).toBe(100000);
  });

  it('5. ChallengeEngineService - enforces safety rejection rules', async () => {
    // Should allow normal trade (1.0 margin <= 10.0 available)
    const check1 = await challengeService.canExecuteTrade(1.0, false);
    expect(check1.allowed).toBe(true);

    // Should reject if Kill Switch active
    const check2 = await challengeService.canExecuteTrade(1.0, true);
    expect(check2.allowed).toBe(false);
    expect(check2.reason).toContain('Kill Switch');

    // Should reject if margin required > available balance (20.0 > 10.0)
    const check3 = await challengeService.canExecuteTrade(20.0, false);
    expect(check3.allowed).toBe(false);
    expect(check3.reason).toContain('Insufficient available margin');
  });

  it('6. TradeSyncService - logs institutional audit record to Trade Ledger with GST & Tax breakdown', async () => {
    const entry = await syncService.syncTradeFromExchange({
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      side: 'LONG',
      entryPrice: 60000,
      exitPrice: 62000,
      quantity: 0.5,
      leverage: 10,
      stopLoss: 59000,
      takeProfit: 63000,
    });

    expect(entry).toHaveProperty('id');
    expect(entry.tradeId).toBeDefined();
    expect(entry.symbol).toBe('BTCUSD.P');
    expect(entry.grossPnL).toBe(1000);
    expect(entry.gstOnFees).toBeGreaterThan(0);
    expect(entry.isTdsApplicable).toBe(false);
    expect(entry.resultStatus).toBe('WIN');

    const ledger = await syncService.getLedgerEntries();
    expect(ledger.length).toBeGreaterThan(0);
  });
});
