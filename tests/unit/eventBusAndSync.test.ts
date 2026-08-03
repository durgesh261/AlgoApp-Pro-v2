import { describe, it, expect, vi } from 'vitest';
import { AppEventBus } from '../../backend/src/modules/realtime-operations/services/appEventBus.service';
import { NotificationCenterService } from '../../backend/src/modules/realtime-operations/services/notificationCenter.service';
import { AuditTimelineService } from '../../backend/src/modules/realtime-operations/services/auditTimeline.service';
import { ExchangeSyncAndReconciliationService } from '../../backend/src/modules/realtime-operations/services/exchangeSyncAndReconciliation.service';

describe('Real-Time Event Bus & Operations Test Suite', () => {
  const notifService = new NotificationCenterService();
  const auditService = new AuditTimelineService();
  const syncService = new ExchangeSyncAndReconciliationService();

  it('1. AppEventBus - publishes and delivers events to active subscribers', async () => {
    const handler = vi.fn();
    AppEventBus.subscribe('MARKET_CANDLE_RECEIVED', handler);

    const candlePayload = { symbol: 'BTCUSD.P', timeframe: '1H', close: 65000 };
    AppEventBus.publish('MARKET_CANDLE_RECEIVED', candlePayload);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(candlePayload);

    AppEventBus.unsubscribe('MARKET_CANDLE_RECEIVED', handler);
  });

  it('2. NotificationCenterService - creates notifications and filters by severity', async () => {
    await NotificationCenterService.notify('TEST_ALERT', 'Test Title', 'Test Message', 'WARNING');

    const allNotifs = await notifService.getNotifications();
    expect(allNotifs.length).toBeGreaterThan(0);

    const warnings = await notifService.getNotifications('WARNING');
    expect(warnings.every((n) => n.severity === 'WARNING')).toBe(true);
  });

  it('3. AuditTimelineService - records and retrieves step-by-step execution timeline', async () => {
    const tradeId = `TEST-TRD-${Date.now()}`;
    const steps = [
      { stepName: 'TradingView Webhook Received', timestamp: new Date().toISOString(), durationMs: 5.0, details: '1H candle' },
      { stepName: 'Execution Filled', timestamp: new Date().toISOString(), durationMs: 12.0, details: 'Filled @ 65000' },
    ];

    await AuditTimelineService.recordTimeline(tradeId, 'BTCUSD.P', steps);
    const timeline = await auditService.getTimeline(tradeId);

    expect(timeline).toBeDefined();
    expect(timeline?.tradeId).toBe(tradeId);
    expect(timeline?.totalDurationMs).toBe(17.0);
    expect(timeline?.steps).toHaveLength(2);
  });

  it('4. ExchangeSyncAndReconciliationService - runs state reconciliation and returns status MATCHED', async () => {
    const report = await syncService.runReconciliation();

    expect(report).toHaveProperty('id');
    expect(report.status).toBe('MATCHED');
    expect(report.mismatchesCount).toBe(0);
  });

  it('5. ExchangeSyncAndReconciliationService - returns operational health for all 10 core subsystems', async () => {
    const health = await syncService.getSubsystemHealth();

    expect(health).toHaveLength(10);
    expect(health.every((h) => h.status === 'HEALTHY')).toBe(true);
    expect(health.some((h) => h.subsystem.includes('Indicator Engine'))).toBe(true);
  });
});
