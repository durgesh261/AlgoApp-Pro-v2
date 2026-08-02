import { describe, it, expect, beforeEach } from 'vitest';
import { DeltaEnvironment, DeltaConnectionState, ExecutionStatus } from '@algoapp/shared';
import { DeltaAdapter } from '../../backend/src/modules/execution/adapters/delta/deltaAdapter.js';
import { EmergencyKillSwitch } from '../../backend/src/modules/execution/adapters/delta/emergencyKillSwitch.js';
import { DeltaErrorClassifier } from '../../backend/src/modules/execution/adapters/delta/deltaErrorClassifier.js';
import { DeltaErrorCategory } from '@algoapp/shared';

describe('Delta Execution Adapter Mock Contract Tests', () => {
  let adapter: DeltaAdapter;

  beforeEach(() => {
    EmergencyKillSwitch.setKillSwitch(false);
    adapter = new DeltaAdapter(DeltaEnvironment.SANDBOX, true);
  });

  it('should connect and update connection state to CONNECTED', async () => {
    const success = await adapter.connect();
    expect(success).toBe(true);

    const health = await adapter.health();
    expect(health.connectionState).toBe(DeltaConnectionState.CONNECTED);
    expect(health.environment).toBe(DeltaEnvironment.SANDBOX);
  });

  it('should disconnect cleanly', async () => {
    await adapter.connect();
    const success = await adapter.disconnect();
    expect(success).toBe(true);

    const health = await adapter.health();
    expect(health.connectionState).toBe(DeltaConnectionState.DISCONNECTED);
  });

  it('should submit market order and create position in mock mode', async () => {
    await adapter.connect();
    const result = await adapter.submitOrder({
      decisionId: 'DEC-MOCK-1',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      quantity: 0.1,
      price: 64000.0,
    });

    expect(result.adapter).toBe('DELTA_ADAPTER');
    expect(result.status).toBe(ExecutionStatus.FILLED);
    expect(result.fillPrice).toBe(64000.0);

    const position = await adapter.getPosition('BTCUSD.P');
    expect(position).not.toBeNull();
    expect(position?.symbol).toBe('BTCUSD.P');
  });

  it('should modify an existing order', async () => {
    await adapter.connect();
    const modResult = await adapter.modifyOrder('DLT-ORD-101', { price: 64500.0 });
    expect(modResult.status).toBe(ExecutionStatus.SUBMITTED);
  });

  it('should cancel an existing order', async () => {
    await adapter.connect();
    const cancelResult = await adapter.cancelOrder('DLT-ORD-101');
    expect(cancelResult.status).toBe(ExecutionStatus.CANCELLED);
  });

  it('should close position for a symbol', async () => {
    await adapter.connect();
    const closeResult = await adapter.closePosition('BTCUSD.P');
    expect(closeResult.status).toBe(ExecutionStatus.FILLED);

    const position = await adapter.getPosition('BTCUSD.P');
    expect(position).toBeNull();
  });

  it('should reject order submission when Platform Emergency Kill Switch is ACTIVE', async () => {
    await adapter.connect();
    EmergencyKillSwitch.setKillSwitch(true);

    const result = await adapter.submitOrder({
      decisionId: 'DEC-KILL-1',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      quantity: 0.1,
    });

    expect(result.status).toBe(ExecutionStatus.REJECTED);
    expect(result.message).toContain('Emergency Kill Switch is ACTIVE');
  });

  it('should correctly classify errors', () => {
    const authErr = DeltaErrorClassifier.classify(new Error('401 Invalid HMAC signature'));
    expect(authErr.category).toBe(DeltaErrorCategory.AUTHENTICATION);

    const rateErr = DeltaErrorClassifier.classify(new Error('HTTP 429 Rate limit exceeded'));
    expect(rateErr.category).toBe(DeltaErrorCategory.RATE_LIMIT);

    const netErr = DeltaErrorClassifier.classify(new Error('ECONNRESET connection reset'));
    expect(netErr.category).toBe(DeltaErrorCategory.NETWORK);
  });
});
