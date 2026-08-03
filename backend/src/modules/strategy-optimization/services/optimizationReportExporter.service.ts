import { OptimizationRunResult } from '@algoapp/shared';

export class OptimizationReportExporterService {
  public static exportCsv(runs: OptimizationRunResult[]): string {
    const header =
      'RunID,Symbol,Timeframe,ProfileName,ZigZagLen,LiqLen,MergeThreshold,MinConfidence,WinRate,NetPnL,ProfitFactor,SharpeRatio,MaxDrawdown,RobustnessScore,ProbOfRuin\n';

    const rows = runs.map((r) => {
      const p = r.parameters;
      const m = r.metrics;
      return `${r.id},${r.symbol},${r.timeframe},"${r.strategyProfileName}",${p.zigzagLen},${p.liquidityLen},${p.mergeThreshold},${p.minConfidence},${m.winRatePercent},${m.netPnL},${m.profitFactor},${m.sharpeRatio},${m.maxDrawdownPercent},${r.walkForward.robustnessScore},${r.monteCarlo.probabilityOfRuinPercent}`;
    });

    return header + rows.join('\n');
  }
}
