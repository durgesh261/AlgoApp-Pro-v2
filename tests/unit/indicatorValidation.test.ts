import { describe, it, expect } from 'vitest';
import { IndicatorValidationService } from '../../backend/src/modules/indicator-validation/services/indicatorValidation.service';

describe('IndicatorValidation - Unit Test Suite', () => {
  const service = new IndicatorValidationService();

  it('1. calculateOverlapPercentage - calculates exact zone overlap percentage', () => {
    // 100% overlap
    const ov1 = IndicatorValidationService.calculateOverlapPercentage(65000, 64000, 65000, 64000);
    expect(ov1).toBe(100);

    // Partial overlap (64500 to 65000 = 500 overlap out of 1000 min width = 50%)
    const ov2 = IndicatorValidationService.calculateOverlapPercentage(65000, 64000, 65500, 64500);
    expect(ov2).toBe(50);

    // No overlap
    const ov3 = IndicatorValidationService.calculateOverlapPercentage(65000, 64000, 63500, 63000);
    expect(ov3).toBe(0);
  });

  it('2. runValidation - evaluates accuracy metrics across allowlist pairs', async () => {
    const report = await service.runValidation();

    expect(report).toHaveProperty('id');
    expect(report.overallAccuracy).toBeGreaterThanOrEqual(0);
    expect(report.overallAccuracy).toBeLessThanOrEqual(100);
    expect(report.totalCompared).toBeGreaterThan(0);
    expect(report.pairAccuracy).toHaveProperty('BTCUSD.P');
    expect(report.bestPair).toBeDefined();
    expect(report.worstPair).toBeDefined();
  });

  it('3. exportValidationCsv - generates formatted CSV header and rows', async () => {
    const report = await service.runValidation();
    const csv = await service.exportValidationCsv(report.id);

    expect(typeof csv).toBe('string');
    expect(csv).toContain('Symbol,ZoneType,TVUpper,TVLower,AlgoUpper,AlgoLower,OverlapPct,UpperDiff,LowerDiff,Status');
    expect(csv.split('\n').length).toBeGreaterThan(1);
  });
});
