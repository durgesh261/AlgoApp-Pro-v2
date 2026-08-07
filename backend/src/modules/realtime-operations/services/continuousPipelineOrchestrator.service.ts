import { AppEventBus } from './appEventBus.service.js';
import { NotificationCenterService } from './notificationCenter.service.js';
import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';
import { PaperJournalService } from '../../paper-trading/services/paperJournal.service.js';

const indicatorService = new IndicatorEngineService();

export class ContinuousPipelineOrchestratorService {
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    // 1. Market Data Tick Pipeline
    AppEventBus.subscribe('MARKET_CANDLE_RECEIVED', async (payload: any) => {
      try {
        const symbol = payload?.symbol || 'BTCUSD.P';
        const timeframe = payload?.timeframe || '1H';

        const indicatorOutput = await indicatorService.evaluateSymbol(symbol, timeframe);
        AppEventBus.publish('INDICATOR_UPDATED', indicatorOutput);

        await NotificationCenterService.notify(
          'PIPELINE_PROCESSED',
          `Automated Pipeline Processed (${symbol} ${timeframe})`,
          `Updated ${indicatorOutput.supplyZones.length} supply & ${indicatorOutput.demandZones.length} demand zones.`,
          'INFO'
        );
      } catch (err: any) {
        await NotificationCenterService.notify(
          'PIPELINE_ERROR',
          'Pipeline Processing Error',
          err.message || 'Error processing continuous pipeline',
          'WARNING'
        );
      }
    });

    // 2. Order Execution & Fills
    AppEventBus.subscribe('ORDER_FILLED', async (payload: any) => {
      const symbol = payload?.symbol || 'BTCUSD.P';
      const side = payload?.side || 'BUY';
      const qty = payload?.size || payload?.quantity || 1;
      const price = payload?.price || payload?.fillPrice || 0;

      await NotificationCenterService.notify(
        'ORDER_FILLED',
        `Order Filled: ${side} ${qty} ${symbol}`,
        `Executed on Delta Exchange India at $${price}`,
        'SUCCESS'
      );

      try {
        await PaperJournalService.logAction(
          'ORDER_FILLED',
          `Order ${payload?.id ?? 'N/A'} filled for ${qty} ${symbol} @ ${price}`,
          symbol
        );
      } catch {
        // ignore journal non-fatal errors
      }
    });

    // 3. Order Cancellations
    AppEventBus.subscribe('ORDER_CANCELLED', async (payload: any) => {
      const orderId = payload?.id || payload?.orderId || 'N/A';
      await NotificationCenterService.notify(
        'ORDER_CANCELLED',
        `Order #${orderId} Cancelled`,
        `Order cancelled successfully on Delta Exchange.`,
        'INFO'
      );
    });

    // 4. Position Opened
    AppEventBus.subscribe('POSITION_OPENED', async (payload: any) => {
      const symbol = payload?.symbol || 'BTCUSD.P';
      const side = payload?.side || 'LONG';
      const entry = payload?.entryPrice || 0;
      await NotificationCenterService.notify(
        'POSITION_OPENED',
        `Position Opened: ${side} ${symbol}`,
        `Entry price: $${entry}. Dynamic stop-loss and take-profit active.`,
        'SUCCESS'
      );
    });

    // 5. Position Closed
    AppEventBus.subscribe('POSITION_CLOSED', async (payload: any) => {
      const symbol = payload?.symbol || 'BTCUSD.P';
      const pnl = payload?.realizedPnl ?? payload?.netPnL ?? 0;
      const severity = pnl >= 0 ? 'SUCCESS' : 'WARNING';
      await NotificationCenterService.notify(
        'POSITION_CLOSED',
        `Position Closed: ${symbol}`,
        `Realized PnL: ${pnl >= 0 ? '+' : ''}$${Number(pnl).toFixed(2)}. Trade accounting recorded.`,
        severity
      );
    });

    // 6. Trade Accounting Recorded
    AppEventBus.subscribe('TRADE_ACCOUNTING_RECORDED', async (payload: any) => {
      const symbol = payload?.symbol || 'BTCUSD.P';
      const net = payload?.netPnL ?? 0;
      const gst = payload?.gstOnFees ?? 0;
      const fees = payload?.totalFees ?? 0;
      await NotificationCenterService.notify(
        'ACCOUNTING_RECORDED',
        `Accounting Audit: ${symbol}`,
        `Net PnL: $${Number(net).toFixed(2)} | Total Fees: $${Number(fees).toFixed(2)} (incl 18% GST: $${Number(gst).toFixed(2)}) | 0% TDS`,
        'INFO'
      );
    });

    // 7. Connection State Transitions
    AppEventBus.subscribe('CONNECTION_STATE_CHANGED', async (payload: any) => {
      const state = payload?.state || 'CONNECTED';
      const isOk = state === 'CONNECTED';
      await NotificationCenterService.notify(
        'CONNECTION_ALERT',
        `Delta Exchange Feed: ${state}`,
        isOk ? 'Realtime WebSocket & REST feeds operational.' : 'Warning: WebSocket feed disconnected or reconnecting.',
        isOk ? 'SUCCESS' : 'CRITICAL'
      );
    });

    // 8. Risk Limit Breaches
    AppEventBus.subscribe('RISK_LIMIT_BREACHED', async (payload: any) => {
      const reason = payload?.reason || 'Risk threshold exceeded';
      await NotificationCenterService.notify(
        'RISK_ALERT',
        'Risk Limit Enforcement Triggered',
        reason,
        'CRITICAL'
      );
    });

    this.isInitialized = true;
  }
}

// Auto-initialize on import
ContinuousPipelineOrchestratorService.initialize();

