import { AppEventBus } from './appEventBus.service.js';
import { NotificationCenterService } from './notificationCenter.service.js';
import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';

const indicatorService = new IndicatorEngineService();

export class ContinuousPipelineOrchestratorService {
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    AppEventBus.subscribe('MARKET_CANDLE_RECEIVED', async (payload: any) => {
      try {
        const symbol = payload?.symbol || 'BTCUSD.P';
        const timeframe = payload?.timeframe || '1H';

        // 1. Trigger Indicator Engine
        const indicatorOutput = await indicatorService.evaluateSymbol(symbol, timeframe);
        AppEventBus.publish('INDICATOR_UPDATED', indicatorOutput);

        // 2. Broadcast notification
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

    this.isInitialized = true;
  }
}

// Auto-initialize on import
ContinuousPipelineOrchestratorService.initialize();
