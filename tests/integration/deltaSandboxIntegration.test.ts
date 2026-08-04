import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionStatus, DeltaEnvironment, DeltaConnectionState } from '@algoapp/shared';
import { DeltaAdapter } from '../../backend/src/modules/execution/adapters/delta/deltaAdapter.js';
import { DeltaSandboxClient } from '../../backend/src/modules/execution/adapters/delta/deltaSandboxClient.js';
import { DeltaStateReconciler } from '../../backend/src/modules/execution/adapters/delta/deltaStateReconciler.js';
import { DeltaRecoverySimulator } from '../../backend/src/modules/execution/adapters/delta/deltaRecoverySimulator.js';
import { PaperJournalService } from '../../backend/src/modules/paper-trading/services/paperJournal.service.js';

describe('Delta Sandbox Integration & End-to-End Validation Tests', () => {
  let adapter: DeltaAdapter;
  let sandboxClient: DeltaSandboxClient;

  beforeEach(() => {
    adapter = new DeltaAdapter(DeltaEnvironment.SANDBOX, true);
    sandboxClient = new DeltaSandboxClient();
  });

  it('should verify testnet URLs and generate valid HMAC signature', () => {
    const urls = sandboxClient.getUrls();
    expect(urls.restUrl).toBe('https://cdn.testnet.delta.exchange');
    expect(urls.wsUrl).toBe('wss://socket.testnet.delta.exchange');

    const sig = sandboxClient.generateSignature('POST', '1785700000', '/v2/orders', '{"symbol":"BTCUSD.P"}');
    expect(sig).toBeDefined();
    expect(sig.length).toBe(64); // SHA-256 hex string length
  });

  it('should connect to Sandbox testnet, verify heartbeat, and log to ExecutionJournal', async () => {
    const connected = await adapter.connect();
    expect(connected).toBe(true);

    const health = await adapter.health();
    expect(health.connectionState).toBe(DeltaConnectionState.CONNECTED);

    const journal = await PaperJournalService.getJournalEntries();
    const connectLog = journal.find((j) => j.action === 'DELTA_SANDBOX_CONNECT');
    expect(connectLog).toBeDefined();
  });

  it('should execute complete Sandbox order lifecycle: submit, modify, cancel, close position', async () => {
    await adapter.connect();

    // 1. Submit Order
    const submitRes = await adapter.submitOrder({
      decisionId: 'DEC-SND-1',
      symbol: 'BTCUSD.P',
      side: 'LONG',
      quantity: 0.2,
      price: 64200.0,
    });
    expect(submitRes.status).toBe(ExecutionStatus.FILLED);

    // 2. Modify Order
    const modifyRes = await adapter.modifyOrder('DLT-ORD-SND-1', { price: 64500.0 });
    expect(modifyRes.status).toBe(ExecutionStatus.SUBMITTED);

    // 3. Cancel Order
    const cancelRes = await adapter.cancelOrder('DLT-ORD-SND-1');
    expect(cancelRes.status).toBe(ExecutionStatus.CANCELLED);

    // 4. Close Position
    const closeRes = await adapter.closePosition('BTCUSD.P');
    expect(closeRes.status).toBe(ExecutionStatus.FILLED);
  });

  it('should synchronize state and run reconciliation check', async () => {
    const isSynced = await adapter.sync();
    expect(isSynced).toBe(true);

    const reconciliation = await DeltaStateReconciler.reconcileState();
    expect(reconciliation.matched).toBe(true);
    expect(reconciliation.mismatches.length).toBe(0);
  });

  it('should test recovery scenarios: WS disconnect & reconnect cycle', async () => {
    await adapter.connect();
    const result = await DeltaRecoverySimulator.simulateScenario(
      'WS_DISCONNECT',
      adapter.getConnectionManager()
    );

    expect(result.success).toBe(true);
    expect(result.recoveryTimeMs).toBeGreaterThanOrEqual(0);
  });
});
