import { describe, it, expect } from 'vitest';
import { ExecutionMode, ExecutionStatus } from '@algoapp/shared';
import { ExecutionEngineService } from '../../backend/src/modules/execution/services/executionEngine.service.js';
import { ExecutionValidator } from '../../backend/src/modules/execution/services/executionValidator.js';

describe('Execution Engine Unit Tests', () => {
  it('should validate pair allowlist and non-zero quantity', () => {
    const valid = ExecutionValidator.validateExecutionRequest({
      decisionId: 'DEC-1',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      quantity: 0.1,
    }, new Set());
    expect(valid.valid).toBe(true);

    const invalidPair = ExecutionValidator.validateExecutionRequest({
      decisionId: 'DEC-1',
      symbol: 'INVALID_PAIR',
      side: 'LONG',
      quantity: 0.1,
    }, new Set());
    expect(invalidPair.valid).toBe(false);
    expect(invalidPair.reason).toContain('UNSUPPORTED_PAIR');
  });

  it('should route paper mode execution to PaperAdapter and generate execution journal', async () => {
    const outcome = await ExecutionEngineService.submitExecution({
      decisionId: 'DEC-101',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      mode: ExecutionMode.PAPER,
      quantity: 0.1,
    });

    expect(outcome.request.symbol).toBe('BTCUSD.P');
    expect(outcome.request.mode).toBe(ExecutionMode.PAPER);
    expect(outcome.result.adapter).toBe('PAPER_ADAPTER');
    expect(outcome.result.status).toBe(ExecutionStatus.FILLED);
    expect(outcome.journal.length).toBeGreaterThan(0);
  });

  it('should reject live mode execution via DeltaAdapter when in simulation mode', async () => {
    const outcome = await ExecutionEngineService.submitExecution({
      decisionId: 'DEC-102',
      symbol: 'ETHUSD.P',
      side: 'SHORT',
      mode: ExecutionMode.LIVE,
      quantity: 1.0,
    });

    expect(outcome.result.adapter).toBe('DELTA_ADAPTER');
    expect(outcome.result.status).toBe(ExecutionStatus.REJECTED);
    expect(outcome.result.message).toContain('Delta Live Exchange adapter is inactive');
  });
});
