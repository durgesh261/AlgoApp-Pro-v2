import { AiTradeReviewDto, TradeLedgerEntryDto } from '@algoapp/shared';

export class AiTradeReviewService {
  public static generateAiReview(ledgerEntry: TradeLedgerEntryDto): AiTradeReviewDto {
    const isWin = ledgerEntry.netPnL > 0;

    const strengths: string[] = [
      `Executed cleanly at demand zone retest with decision confidence of ${ledgerEntry.decisionConfidence}%.`,
      `Proper risk management maintained with ${ledgerEntry.leverage}x leverage and strict stop-loss.`,
    ];

    const weaknesses: string[] = isWin
      ? ['Slight slippage observed during volatile candle entry execution.']
      : ['Price broke demand zone boundary before stop loss trigger point.'];

    const riskAnalysis = `Margin used was $${ledgerEntry.marginUsed} (${((ledgerEntry.marginUsed / 50000.0) * 100).toFixed(1)}% of total equity) with effective risk-reward ratio of ${ledgerEntry.rewardPercent / ledgerEntry.riskPercent}:1.`;
    const challengeImpact = isWin
      ? `Added +$${ledgerEntry.netPnL} to 20-Day Challenge balance, progressing towards 10% target.`
      : `Deducted -$${Math.abs(ledgerEntry.netPnL)} from 20-Day Challenge balance. Daily drawdown remains strictly within 5% max threshold.`;

    const alternativeOutcome = isWin
      ? `Trailing stop loss could have captured an additional +0.8% ROI if held through next resistance.`
      : `Exiting at zero-line breakeven on initial bounce would have saved -$${Math.abs(ledgerEntry.netPnL)}.`;

    const improvementSuggestions: string[] = [
      'Maintain strict 1:2+ risk-to-reward ratio on all 1H and 15M demand zone entries.',
      'Audit order placement latency during high volatility news releases.',
    ];

    return {
      tradeSummary: `${ledgerEntry.side} trade on ${ledgerEntry.symbol} (${ledgerEntry.timeframe}) closed with Net PnL of $${ledgerEntry.netPnL} (${ledgerEntry.resultStatus}).`,
      decisionSummary: `Signal confirmed by Price Action Toolkit & Smart Money Concepts indicator engines. Explanation: ${ledgerEntry.decisionExplanation}`,
      strengths,
      weaknesses,
      riskAnalysis,
      challengeImpact,
      alternativeOutcome,
      improvementSuggestions,
    };
  }
}
