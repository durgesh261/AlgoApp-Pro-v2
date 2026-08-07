import {
  DecisionState,
  IndicatorEngineOutput,
  StrategyPipelineResultDto,
  TradingTimeframe,
  CandleDto,
} from '@algoapp/shared';

import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';
import { DecisionEngineService } from '../../decision/services/decisionEngine.service.js';
import { executionEngineService, OrderExecutionRequest } from '../../execution-engine/services/ExecutionEngineService.js';
import { deltaSyncService } from '../../delta-exchange/index.js';
import { eventBus } from '../../../services/EventBus.js';

export interface RunPipelineOptions {
  symbol: string;
  timeframe: TradingTimeframe;
  candles: CandleDto[];
  autoExecute?: boolean | undefined;
}

export class StrategyPipelineService {
  /**
   * Deterministically executes the end-to-end Strategy Pipeline from Market Data to Execution.
   */
  public static async runPipeline(options: RunPipelineOptions): Promise<StrategyPipelineResultDto> {
    const { symbol, timeframe, candles, autoExecute = true } = options;

    if (!candles || candles.length === 0) {
      throw new Error(`Cannot run strategy pipeline for ${symbol}: empty candles array.`);
    }

    const latestCandle = candles[candles.length - 1]!;
    const currentPrice = latestCandle.close;
    const candleTimestamp = latestCandle.timestamp;

    // 1. Run Deterministic Indicator Engine (Module 7)
    const indicators: IndicatorEngineOutput = IndicatorEngineService.computeIndicators(
      candles,
      timeframe
    );

    // 2. Fetch Live Delta Account and Position Context
    const balances = deltaSyncService.getBalances();
    const usdtBalance = balances.find((b) => b.asset_symbol === 'USDT' || b.asset_symbol === 'USD');
    const accountBalance = usdtBalance ? parseFloat(usdtBalance.balance || '50000') : 50000;
    const availableMargin = usdtBalance ? parseFloat(usdtBalance.available_balance || '50000') : 50000;

    const positions = deltaSyncService.getPositions();
    const existingPosition = positions.find(
      (p) => (p.product_symbol || '').toLowerCase() === (symbol || '').toLowerCase()
    );
    const hasOpenPosition = !!existingPosition && parseFloat(String(existingPosition.size || '0')) !== 0;

    // Find nearest active zone from indicators
    const allZones = [...indicators.demandZones, ...indicators.supplyZones];
    const activeZone = allZones.find(
      (z) => currentPrice >= z.lowerPrice * 0.995 && currentPrice <= z.upperPrice * 1.005
    ) || allZones[0];

    // 3. Evaluate Deterministic Decision Pipeline (10 Steps)
    const decision = await DecisionEngineService.evaluateDecision({
      symbol,
      timeframe,
      currentPrice,
      indicators,
      activeZone,
      accountBalance,
      availableMargin,
      openPositionCount: positions.length,
      hasOpenPosition,
      candleTimestamp,
    });

    let executionRequested = false;
    let executionOrderId: string | undefined = undefined;
    let rejectionReason: string | undefined = undefined;

    // 4. Dispatch to Execution Engine if state is EXECUTE
    if (decision.decisionState === DecisionState.EXECUTE && autoExecute && decision.positionSizing) {
      const side = indicators.marketStructure.trend === 'BULLISH' ? 'buy' : 'sell';
      const orderReq: OrderExecutionRequest = {
        symbol,
        side,
        orderType: 'market',
        size: Number(decision.positionSizing.contractQuantity),
        price: decision.positionSizing.entryPrice,
        leverage: decision.positionSizing.leverage,
        stopLossPrice: decision.positionSizing.stopLossPrice,
        takeProfitPrice: decision.positionSizing.takeProfitPrice,
        clientOrderId: `algo-${symbol.toLowerCase()}-${Date.now()}`,
      };

      try {
        const execResult = await executionEngineService.placeOrder(orderReq);
        executionRequested = true;
        executionOrderId = execResult.orderId ? String(execResult.orderId) : execResult.clientOrderId;
      } catch (err: unknown) {
        rejectionReason = err instanceof Error ? err.message : 'Execution failed';
      }
    } else if (decision.decisionState !== DecisionState.EXECUTE) {
      rejectionReason = `Strategy state '${decision.decisionState}' - Reasons: ${decision.reasonCodes.join(', ')}`;
    }

    const result: StrategyPipelineResultDto = {
      decision,
      indicatorSnapshot: indicators,
      executionRequested,
      executionOrderId,
      rejectionReason,
      timestamp: new Date().toISOString(),
    };

    // Emit live events for workstation synchronization
    eventBus.emit('strategy:decision_evaluated', decision);
    eventBus.emit('strategy:pipeline_completed', result);

    return result;
  }
}
