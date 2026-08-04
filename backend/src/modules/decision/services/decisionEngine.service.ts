import crypto from 'crypto';
import {
  DecisionDto,
  DecisionState,
  DecisionReasonCode,
  StrategySignalOutcome,
} from '@algoapp/shared';

import { ZoneDetectorService } from '../../strategy/services/zoneDetector.service.js';
import { StrategySignalService } from '../../strategy/services/strategySignal.service.js';

import { ZoneValidator } from '../validators/zoneValidator.js';
import { FreshZoneValidator } from '../validators/freshZoneValidator.js';
import { FirstTouchValidator } from '../validators/firstTouchValidator.js';
import { MomentumValidator } from '../validators/momentumValidator.js';
import { OpposingZoneValidator } from '../validators/opposingZoneValidator.js';
import { ZoneWidthValidator } from '../validators/zoneWidthValidator.js';
import { ArchivedZoneDetector } from '../validators/archivedZoneDetector.js';
import { ConfidenceEngine } from '../confidence/confidenceEngine.js';

let decisionLogs: DecisionDto[] = [
  {
    id: 'DEC-LOG-101',
    signalId: 'SIG-LOG-101',
    symbol: 'BTCUSD.P',
    timeframe: '1H',
    decisionState: DecisionState.EXECUTE,
    confidenceScore: 92.5,
    reasonCodes: [
      DecisionReasonCode.FRESH_ZONE_CONFIRMED,
      DecisionReasonCode.FIRST_TOUCH_VALIDATED,
      DecisionReasonCode.MOMENTUM_ALIGNED,
      DecisionReasonCode.CONFIDENCE_THRESHOLD_MET,
    ],
    inputSnapshotHash: 'a8f3b4c9e71234567890abcdef1234567890abcdef1234567890abcdef123456',
    timestamp: '2026-08-02T20:44:02Z',
  },
  {
    id: 'DEC-LOG-102',
    signalId: 'SIG-LOG-102',
    symbol: 'ETHUSD.P',
    timeframe: '1H',
    decisionState: DecisionState.WAIT,
    confidenceScore: 74.0,
    reasonCodes: [
      DecisionReasonCode.FRESH_ZONE_CONFIRMED,
      DecisionReasonCode.FIRST_TOUCH_VALIDATED,
    ],
    inputSnapshotHash: 'b9e4c5d0f82345678901bcdef2345678901bcdef2345678901bcdef234567',
    timestamp: '2026-08-02T20:30:02Z',
  },
];

export class DecisionEngineService {
  public static async getDecisionLogs(): Promise<DecisionDto[]> {
    return decisionLogs;
  }

  public static async evaluateDecision(
    signalId: string,
    symbol: string,
    currentPrice: number
  ): Promise<DecisionDto> {
    const signals = await StrategySignalService.getLatestSignals();
    const targetSignal = signals.find((s) => s.id === signalId || s.symbol === symbol) || {
      id: signalId,
      symbol,
      timeframe: '1H' as const,
      outcome: StrategySignalOutcome.BUY,
      price: currentPrice,
      rationale: 'Evaluated strategy signal',
      confidenceScore: 85,
      timestamp: new Date().toISOString(),
    };

    const allZones = await ZoneDetectorService.getZones(symbol);
    const activeZone = allZones.find((z) => z.id === targetSignal.activeZoneId) || allZones[0];

    // Build Reproducibility Hash
    const inputPayload = JSON.stringify({
      signal: targetSignal,
      activeZone,
      currentPrice,
    });
    const inputSnapshotHash = crypto.createHash('sha256').update(inputPayload).digest('hex');

    const reasonCodes: DecisionReasonCode[] = [];

    // Run Validator Pipeline
    const vZone = ZoneValidator.validate(activeZone);
    if (vZone.reasonCode) reasonCodes.push(vZone.reasonCode);

    const vFresh = FreshZoneValidator.validate(activeZone);
    if (vFresh.reasonCode && !reasonCodes.includes(vFresh.reasonCode)) reasonCodes.push(vFresh.reasonCode);

    const vFirst = FirstTouchValidator.validate(activeZone);
    if (vFirst.reasonCode && !reasonCodes.includes(vFirst.reasonCode)) reasonCodes.push(vFirst.reasonCode);

    const vMom = MomentumValidator.validate(targetSignal.outcome);
    if (vMom.reasonCode && !reasonCodes.includes(vMom.reasonCode)) reasonCodes.push(vMom.reasonCode);

    const vOpp = OpposingZoneValidator.validate(targetSignal.outcome, currentPrice, allZones);
    if (vOpp.reasonCode && !reasonCodes.includes(vOpp.reasonCode)) reasonCodes.push(vOpp.reasonCode);

    const vWidth = ZoneWidthValidator.validate(activeZone);
    if (vWidth.reasonCode && !reasonCodes.includes(vWidth.reasonCode)) reasonCodes.push(vWidth.reasonCode);

    const isArchived = activeZone ? ArchivedZoneDetector.isArchivedZone(activeZone) : false;

    // Compute Confidence
    const confidenceScore = ConfidenceEngine.calculateConfidence([
      vZone,
      vFresh,
      vFirst,
      vMom,
      vOpp,
      vWidth,
    ]);

    // Determine Decision State
    let decisionState = DecisionState.WAIT;

    if (!vZone.passed || isArchived) {
      decisionState = DecisionState.INVALID;
    } else if (!vOpp.passed || !vFresh.passed || !vWidth.passed) {
      decisionState = DecisionState.SKIP;
    } else if (confidenceScore >= 80.0 && vMom.passed) {
      decisionState = DecisionState.EXECUTE;
      if (!reasonCodes.includes(DecisionReasonCode.CONFIDENCE_THRESHOLD_MET)) {
        reasonCodes.push(DecisionReasonCode.CONFIDENCE_THRESHOLD_MET);
      }
    } else {
      decisionState = DecisionState.WAIT;
    }

    const decision: DecisionDto = {
      id: `DEC-LOG-${Date.now()}`,
      signalId: targetSignal.id,
      symbol,
      timeframe: '1H',
      decisionState,
      confidenceScore,
      reasonCodes,
      inputSnapshotHash,
      timestamp: new Date().toISOString(),
    };

    decisionLogs.unshift(decision);
    return decision;
  }
}
