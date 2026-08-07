import {
  DecisionReasonCode,
  FairValueGapDto,
  LiquiditySweepDto,
  StrategySignalOutcome,
} from '@algoapp/shared';

export interface LiquidityValidationResult {
  passed: boolean;
  reasonCodes: DecisionReasonCode[];
  hasSweep: boolean;
  hasFvgConfluence: boolean;
}

export class LiquidityValidator {
  /**
   * Deterministically validates liquidity sweeps and fair value gap confluence.
   */
  public static validate(
    outcome: StrategySignalOutcome,
    sweeps: LiquiditySweepDto[],
    fvgs: FairValueGapDto[]
  ): LiquidityValidationResult {
    const reasonCodes: DecisionReasonCode[] = [];

    // 1. Check Sweep Alignment
    const targetSweepType =
      outcome === StrategySignalOutcome.BUY ? 'LOW_SWEEP' : 'HIGH_SWEEP';
    const activeSweeps = sweeps.filter((s) => s.sweepType === targetSweepType);
    const hasSweep = activeSweeps.length > 0;

    if (hasSweep) {
      reasonCodes.push(DecisionReasonCode.LIQUIDITY_SWEEP_CONFIRMED);
    }

    // 2. Check FVG Confluence
    const targetFvgType =
      outcome === StrategySignalOutcome.BUY ? 'BULLISH' : 'BEARISH';
    const activeFvgs = fvgs.filter((f) => f.type === targetFvgType && f.status !== 'FILLED');
    const hasFvgConfluence = activeFvgs.length > 0;

    if (hasFvgConfluence) {
      reasonCodes.push(DecisionReasonCode.FVG_CONFLUENCE_CONFIRMED);
    }

    return {
      passed: true, // Confluence increases score, not a hard barrier unless configured
      reasonCodes,
      hasSweep,
      hasFvgConfluence,
    };
  }
}
