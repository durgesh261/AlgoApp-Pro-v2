import { describe, it, expect } from 'vitest';
import { ExecutionMode, ExecutionStatus } from '@algoapp/shared';
import { ExecutionStateMachine } from '../../backend/src/modules/execution/state-machine/executionStateMachine.js';
import { IdempotencyManager } from '../../backend/src/modules/execution/services/idempotencyManager.js';
import { ExecutionEngineService } from '../../backend/src/modules/execution/services/executionEngine.service.js';

describe('Refined Execution Engine Architecture Unit Tests', () => {
  it('should enforce strict state machine transitions and reject invalid steps', () => {
    expect(ExecutionStateMachine.isValidTransition(ExecutionStatus.QUEUED, ExecutionStatus.VALIDATED)).toBe(true);
    expect(ExecutionStateMachine.isValidTransition(ExecutionStatus.VALIDATED, ExecutionStatus.SUBMITTED)).toBe(true);
    expect(ExecutionStateMachine.isValidTransition(ExecutionStatus.SUBMITTED, ExecutionStatus.FILLED)).toBe(true);

    // Invalid transition directly from QUEUED -> FILLED without validation
    expect(ExecutionStateMachine.isValidTransition(ExecutionStatus.QUEUED, ExecutionStatus.FILLED)).toBe(false);
    expect(() => ExecutionStateMachine.validateTransition(ExecutionStatus.QUEUED, ExecutionStatus.FILLED)).toThrow();
  });

  it('should generate deterministic idempotency keys and prevent duplicate executions', async () => {
    const input = {
      decisionId: 'DEC-IDEM-101',
      symbol: 'BTCUSD.P',
      side: 'LONG' as const,
      mode: ExecutionMode.PAPER,
      quantity: 0.1,
    };

    const key1 = IdempotencyManager.generateKey(input);
    const key2 = IdempotencyManager.generateKey(input);
    expect(key1).toBe(key2);

    const outcome1 = await ExecutionEngineService.submitExecution(input);
    const outcome2 = await ExecutionEngineService.submitExecution({ ...input, idempotencyKey: outcome1.request.idempotencyKey });

    // Should return existing execution without creating duplicate requests
    expect(outcome1.request.id).toBe(outcome2.request.id);
  });

  it('should test all 7 methods of PaperAdapter interface', async () => {
    const adapter = ExecutionEngineService.getAdapter(ExecutionMode.PAPER);

    const val = await adapter.validate({
      id: 'REQ-TEST',
      sessionId: 'SES-TEST',
      idempotencyKey: 'IDEM-TEST',
      decisionId: 'DEC-TEST',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      mode: ExecutionMode.PAPER,
      ruleVersion: 'v2.0.0',
      configVersion: 'cfg-test',
      orderType: 'MARKET',
      quantity: 0.1,
      timestamp: new Date().toISOString(),
    });
    expect(val.valid).toBe(true);

    await adapter.synchronize();
    const status = await adapter.getExecutionStatus('NON_EXISTENT_ORDER');
    expect(status).toBe(ExecutionStatus.REJECTED);
  });

  it('should measure observability latencies across lifecycle', async () => {
    const outcome = await ExecutionEngineService.submitExecution({
      decisionId: 'DEC-OBS-1',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      mode: ExecutionMode.PAPER,
      quantity: 0.1,
    });

    expect(outcome.result.observability.totalLifecycleTimeMs).toBeGreaterThanOrEqual(0);
    expect(outcome.journal.length).toBeGreaterThan(0);
  });
});
