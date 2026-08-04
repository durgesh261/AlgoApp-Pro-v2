import { describe, it, expect } from 'vitest';
import {
  DecisionState,
  DecisionReasonCode,
  ZoneDto,
  ZoneType,
  ZoneStatus,
  ZoneSource,
} from '@algoapp/shared';

import { ZoneValidator } from '../../backend/src/modules/decision/validators/zoneValidator.js';
import { FreshZoneValidator } from '../../backend/src/modules/decision/validators/freshZoneValidator.js';
import { FirstTouchValidator } from '../../backend/src/modules/decision/validators/firstTouchValidator.js';
import { ConfidenceEngine } from '../../backend/src/modules/decision/confidence/confidenceEngine.js';

describe('Decision Engine Unit Tests', () => {
  const sampleFreshDemandZone: ZoneDto = {
    id: 'ZON-TEST-DEMAND-1',
    symbol: 'BTCUSD.P',
    type: ZoneType.DEMAND,
    timeframe: '1H',
    upperPrice: 63800.0,
    lowerPrice: 63200.0,
    source: ZoneSource.MERGED,
    strength: 95.0,
    width: 600.0,
    freshness: 100.0,
    touchCount: 0,
    status: ZoneStatus.FRESH,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should validate active fresh zone successfully', () => {
    const res = ZoneValidator.validate(sampleFreshDemandZone);
    expect(res.passed).toBe(true);
    expect(res.score).toBe(100);
    expect(res.reasonCode).toBe(DecisionReasonCode.FRESH_ZONE_CONFIRMED);
  });

  it('should invalidate broken zones', () => {
    const brokenZone: ZoneDto = { ...sampleFreshDemandZone, status: ZoneStatus.BROKEN };
    const res = ZoneValidator.validate(brokenZone);
    expect(res.passed).toBe(false);
    expect(res.score).toBe(0);
    expect(res.reasonCode).toBe(DecisionReasonCode.ZONE_BROKEN_INVALIDATED);
  });

  it('should validate first-touch preference', () => {
    const res = FirstTouchValidator.validate(sampleFreshDemandZone);
    expect(res.passed).toBe(true);
    expect(res.score).toBe(100);
    expect(res.reasonCode).toBe(DecisionReasonCode.FIRST_TOUCH_VALIDATED);
  });

  it('should calculate deterministic confidence score reproducibly', () => {
    const v1 = ZoneValidator.validate(sampleFreshDemandZone);
    const v2 = FreshZoneValidator.validate(sampleFreshDemandZone);
    const v3 = FirstTouchValidator.validate(sampleFreshDemandZone);

    const score1 = ConfidenceEngine.calculateConfidence([v1, v2, v3]);
    const score2 = ConfidenceEngine.calculateConfidence([v1, v2, v3]);

    expect(score1).toBe(100);
    expect(score1).toEqual(score2); // Reproducible determinism
  });
});
