import { ShadowDecisionRecordDto } from '@algoapp/shared';

let decisionRecordsStore: ShadowDecisionRecordDto[] = [
  {
    id: 'SHD-DEC-1',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    symbol: 'BTCUSD.P',
    timeframe: '1H',
    strategyProfileId: 'DEF-1H-PROF',
    supplyZoneRange: '[65800.0 - 66787.0]',
    demandZoneRange: '[63211.5 - 63850.0]',
    decision: 'BUY',
    confidence: 94.5,
    entryPrice: 63850.0,
    stopLossPrice: 63250.0,
    takeProfitPrice: 65800.0,
    positionSize: 0.5,
    reasonCodes: ['PAT_DEMAND_RETEST', 'SMC_LIQUIDITY_SWEEP', 'CONFIDENCE_GT_75'],
    expectedRR: 3.25,
    expectedProfitUsd: 975.0,
  },
  {
    id: 'SHD-DEC-2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    symbol: 'ETHUSD.P',
    timeframe: '15M',
    strategyProfileId: 'AGG-15M-PROF',
    supplyZoneRange: '[3480.0 - 3520.0]',
    demandZoneRange: '[3340.0 - 3380.0]',
    decision: 'BUY',
    confidence: 88.0,
    entryPrice: 3380.0,
    stopLossPrice: 3340.0,
    takeProfitPrice: 3500.0,
    positionSize: 2.5,
    reasonCodes: ['SMC_BOS_BREAKOUT', 'CONFIDENCE_GT_75'],
    expectedRR: 3.0,
    expectedProfitUsd: 300.0,
  },
];

export class DecisionRecorderService {
  public async recordDecision(input: Partial<ShadowDecisionRecordDto>): Promise<ShadowDecisionRecordDto> {
    const record: ShadowDecisionRecordDto = {
      id: `SHD-DEC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol: input.symbol || 'BTCUSD.P',
      timeframe: input.timeframe || '1H',
      strategyProfileId: input.strategyProfileId || 'DEF-1H-PROF',
      supplyZoneRange: input.supplyZoneRange || '[65800.0 - 66787.0]',
      demandZoneRange: input.demandZoneRange || '[63211.5 - 63850.0]',
      decision: input.decision || 'BUY',
      confidence: input.confidence || 90.0,
      entryPrice: input.entryPrice || 63850.0,
      stopLossPrice: input.stopLossPrice || 63250.0,
      takeProfitPrice: input.takeProfitPrice || 65800.0,
      positionSize: input.positionSize || 0.5,
      reasonCodes: input.reasonCodes || ['SHADOW_SIGNAL_REC'],
      expectedRR: input.expectedRR || 3.0,
      expectedProfitUsd: input.expectedProfitUsd || 500.0,
    };

    decisionRecordsStore.unshift(record);
    return record;
  }

  public async getRecentDecisions(): Promise<ShadowDecisionRecordDto[]> {
    return decisionRecordsStore;
  }
}
