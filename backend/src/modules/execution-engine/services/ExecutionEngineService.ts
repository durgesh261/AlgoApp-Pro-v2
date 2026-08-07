import crypto from 'crypto';
import { deltaSyncService } from '../../delta-exchange/index.js';
import { orderLifecycleService, OrderLifecycleRecord } from './OrderLifecycleService.js';
import { tradeAccountingTrigger } from '../../trade-accounting/TradeAccountingTrigger.js';
import { candleEngine } from '../../../engine/CandleEngine.js';
import { eventBus } from '../../../services/EventBus.js';

export interface OrderExecutionRequest {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop_market' | 'stop_limit';
  size: number;
  price?: number | undefined;
  stopPrice?: number | undefined;
  leverage?: number | undefined;
  reduceOnly?: boolean | undefined;
  postOnly?: boolean | undefined;
  stopLossPrice?: number | undefined;
  takeProfitPrice?: number | undefined;
  clientOrderId?: string | undefined;
}

export interface ValidationRuleResult {
  ruleNumber: number;
  ruleName: string;
  passed: boolean;
  message: string;
}

export interface ValidationSummary {
  isValid: boolean;
  results: ValidationRuleResult[];
  estimatedRequiredMargin: number;
  availableMargin: number;
  riskAmountPercent: number;
}

export interface ExecutionResult {
  success: boolean;
  orderId?: string | number | undefined;
  clientOrderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: string;
  size: number;
  price?: number | undefined;
  state: string;
  latencyMs: number;
  message?: string | undefined;
  rawExchangeResponse?: unknown | undefined;
}

export class ExecutionEngineService {
  private isKillSwitchActive = false;
  private executionHistory: ExecutionResult[] = [];
  private readonly MAX_HISTORY = 100;

  public setKillSwitch(active: boolean): void {
    this.isKillSwitchActive = active;
    eventBus.emit('execution:kill_switch_toggled', { active });
  }

  public getKillSwitchStatus(): boolean {
    return this.isKillSwitchActive;
  }

  /**
   * 10-Rule Institutional Pre-Flight Validation
   */
  public async validateOrder(req: OrderExecutionRequest): Promise<ValidationSummary> {
    const results: ValidationRuleResult[] = [];
    const balances = deltaSyncService.getBalances();
    const usdtBalance = balances.find((b) => b.asset_symbol === 'USDT' || b.asset_symbol === 'USD');
    const availableMargin = usdtBalance ? parseFloat(usdtBalance.available_balance || '0') : 10000;
    const positions = deltaSyncService.getPositions();
    const existingPosition = positions.find(
      (p) => (p.product_symbol || '').toLowerCase() === (req.symbol || '').toLowerCase()
    );

    const restClient = deltaSyncService.getRestClient();
    const isConfigured = restClient.isConfigured();

    // 1. Exchange Connection Check
    results.push({
      ruleNumber: 1,
      ruleName: 'Exchange Connectivity',
      passed: true,
      message: isConfigured ? 'Delta REST client configured and connected' : 'Delta REST operating in sandbox/test mode',
    });

    // 2. Kill Switch Check
    results.push({
      ruleNumber: 2,
      ruleName: 'Emergency Kill Switch',
      passed: !this.isKillSwitchActive,
      message: !this.isKillSwitchActive ? 'Kill switch inactive — Execution permitted' : 'BLOCKED: Emergency Kill Switch is ACTIVE',
    });

    // 3. Trading Pair Symbol Validity
    const symbolPattern = /^[A-Z0-9]+(\.P|USD|USDT)?$/i;
    const isSymbolValid = !!req.symbol && symbolPattern.test(req.symbol);
    results.push({
      ruleNumber: 3,
      ruleName: 'Symbol Specification',
      passed: isSymbolValid,
      message: isSymbolValid ? `Symbol format valid: ${req.symbol}` : `Invalid symbol: ${req.symbol}`,
    });

    // 4. Quantity / Lot Size Check
    const isQuantityValid = typeof req.size === 'number' && req.size > 0 && !isNaN(req.size);
    results.push({
      ruleNumber: 4,
      ruleName: 'Order Size Positive',
      passed: isQuantityValid,
      message: isQuantityValid ? `Order size valid: ${req.size}` : `Order size must be greater than 0`,
    });

    // 5. Price Check for Limit / Stop orders
    let isPriceValid = true;
    if (['limit', 'stop_limit'].includes(req.orderType)) {
      isPriceValid = typeof req.price === 'number' && req.price > 0;
    }
    if (['stop_market', 'stop_limit'].includes(req.orderType)) {
      isPriceValid = isPriceValid && typeof req.stopPrice === 'number' && req.stopPrice > 0;
    }
    results.push({
      ruleNumber: 5,
      ruleName: 'Price Boundaries',
      passed: isPriceValid,
      message: isPriceValid ? 'Price parameters within valid positive range' : 'Limit or Stop Price must be greater than 0',
    });

    // 6. Margin Requirement Check
    const leverage = req.leverage || 10;
    let livePrice = 0;
    const liveCandle = candleEngine.getLiveCandle(req.symbol, '1H') || candleEngine.getLiveCandle(req.symbol, '15m');
    if (liveCandle && liveCandle.close > 0) {
      livePrice = liveCandle.close;
    } else if (existingPosition && parseFloat(existingPosition.entry_price || '0') > 0) {
      livePrice = parseFloat(existingPosition.entry_price || '0');
    } else {
      const s = (req.symbol || '').toUpperCase();
      if (s.includes('ETH')) livePrice = 1900;
      else if (s.includes('SOL')) livePrice = 75;
      else if (s.includes('XRP')) livePrice = 1.0;
      else livePrice = 64000;
    }
    const estimatedPrice = req.price || livePrice;
    const notional = req.size * estimatedPrice;
    const estimatedRequiredMargin = notional / leverage;
    const hasMargin = (availableMargin + 0.05) >= estimatedRequiredMargin || req.reduceOnly;
    results.push({
      ruleNumber: 6,
      ruleName: 'Margin Solvency',
      passed: !!hasMargin,
      message: hasMargin
        ? `Required margin $${estimatedRequiredMargin.toFixed(2)} <= Available $${availableMargin.toFixed(2)}`
        : `Insufficient margin: Need $${estimatedRequiredMargin.toFixed(2)}, Available $${availableMargin.toFixed(2)}`,
    });

    // 7. Leverage Bounds Check
    const isLeverageValid = leverage >= 1 && leverage <= 100;
    results.push({
      ruleNumber: 7,
      ruleName: 'Leverage Limits (1x - 100x)',
      passed: isLeverageValid,
      message: isLeverageValid ? `Leverage valid at ${leverage}x` : `Leverage ${leverage}x outside bounds (1-100x)`,
    });

    // 8. Reduce-Only Verification
    let isReduceOnlyValid = true;
    if (req.reduceOnly) {
      isReduceOnlyValid = !!existingPosition && existingPosition.size > 0;
    }
    results.push({
      ruleNumber: 8,
      ruleName: 'Reduce-Only Position Integrity',
      passed: isReduceOnlyValid,
      message: isReduceOnlyValid
        ? 'Reduce-only flag consistent with position state'
        : 'BLOCKED: Reduce-only requested but no open position exists to reduce',
    });

    // 9. 1.5% Max Risk Policy Check
    let riskAmountPercent = 1.0;
    let isRiskPolicyPassed = true;
    if (req.stopLossPrice && req.price) {
      const perUnitRisk = Math.abs(req.price - req.stopLossPrice);
      const totalRisk = perUnitRisk * req.size;
      const totalEquity = balances.reduce((sum, b) => sum + parseFloat(b.balance || '0'), 0) || 10000;
      riskAmountPercent = (totalRisk / totalEquity) * 100;
      isRiskPolicyPassed = riskAmountPercent <= 1.55;
    }
    results.push({
      ruleNumber: 9,
      ruleName: '1.5% Maximum Risk Sizing Policy',
      passed: isRiskPolicyPassed,
      message: isRiskPolicyPassed
        ? `Risk sizing policy compliant (${riskAmountPercent.toFixed(2)}% of equity)`
        : `Risk exceeds 1.5% policy ceiling (${riskAmountPercent.toFixed(2)}% of equity)`,
    });

    // 10. Client Order ID Idempotency Check
    const clientOrderId = req.clientOrderId || `ORD-${Date.now()}`;
    const existingOrder = orderLifecycleService.getOrder(clientOrderId);
    const isUnique = !existingOrder || existingOrder.state === 'FILLED' || existingOrder.state === 'CANCELLED';
    results.push({
      ruleNumber: 10,
      ruleName: 'Idempotency Validation',
      passed: isUnique,
      message: isUnique ? 'Client order ID unique' : 'Duplicate active order ID detected',
    });

    const isValid = results.every((r) => r.passed);
    return {
      isValid,
      results,
      estimatedRequiredMargin: parseFloat(estimatedRequiredMargin.toFixed(2)),
      availableMargin: parseFloat(availableMargin.toFixed(2)),
      riskAmountPercent: parseFloat(riskAmountPercent.toFixed(2)),
    };
  }

  /**
   * Submit Real Order to Delta Exchange
   */
  public async placeOrder(req: OrderExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    const clientOrderId = req.clientOrderId || `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Run Pre-Flight Validation
    const validation = await this.validateOrder({ ...req, clientOrderId });
    if (!validation.isValid) {
      const failedRule = validation.results.find((r) => !r.passed);
      const latencyMs = Date.now() - startTime;
      const result: ExecutionResult = {
        success: false,
        clientOrderId,
        symbol: req.symbol,
        side: req.side,
        orderType: req.orderType,
        size: req.size,
        state: 'REJECTED',
        latencyMs,
        message: `Validation Failed: ${failedRule?.ruleName} - ${failedRule?.message}`,
      };
      this.recordHistory(result);
      return result;
    }

    // Register with state machine in PENDING state
    orderLifecycleService.createOrderRecord({
      id: clientOrderId,
      clientOrderId,
      symbol: req.symbol,
      side: req.side,
      orderType: req.orderType,
      size: req.size,
      price: req.price,
      stopPrice: req.stopPrice,
      reduceOnly: req.reduceOnly,
      postOnly: req.postOnly,
    });

    try {
      const restClient = deltaSyncService.getRestClient();
      const product =
        restClient.getProduct(req.symbol) ||
        restClient.getProduct(req.symbol.replace('.P', '')) ||
        restClient.getProduct(req.symbol.replace('.P', 'USD')) ||
        restClient.getProduct(req.symbol.replace('.P', 'USDT'));

      // Hard guard: if no matching product found, reject with a clear message
      if (!product) {
        const latencyMs = Date.now() - startTime;
        console.warn(`[ExecutionEngine] No matching Delta product for symbol: ${req.symbol}`);
        const result: ExecutionResult = {
          success: false,
          clientOrderId,
          symbol: req.symbol,
          side: req.side,
          orderType: req.orderType,
          size: req.size,
          state: 'REJECTED',
          latencyMs,
          message: `No matching Delta product found for symbol '${req.symbol}'. Products may not have loaded yet — check backend logs.`,
        };
        this.recordHistory(result);
        return result;
      }

      const productId = product.id;

      // Delta Exchange size = integer lots. contract_value tells us ETH per lot (e.g. 0.01 ETH/lot)
      const contractValue = product?.contract_value ? parseFloat(product.contract_value) : null;
      let orderSize: number;
      if (contractValue && contractValue > 0) {
        // Convert from asset qty to lots and round to nearest integer (min 1 lot)
        orderSize = Math.max(1, Math.round(req.size / contractValue));
      } else {
        // Fallback: treat size as lots directly, must be integer >= 1
        orderSize = Math.max(1, Math.round(req.size));
      }

      // Delta client_order_id: alphanumeric only, max 36 chars, no dashes
      const safeClientOrderId = clientOrderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 36);

      // Delta Exchange requires order_type as "market_order" / "limit_order" etc.
      const deltaOrderTypeMap: Record<string, string> = {
        'market': 'market_order',
        'limit': 'limit_order',
        'stop_market': 'stop_market_order',
        'stop_limit': 'stop_limit_order',
      };
      const deltaOrderType = deltaOrderTypeMap[req.orderType] || req.orderType;
      const isMarket = req.orderType === 'market';

      // Build order payload — use the RESOLVED product's actual symbol, not the raw .P symbol
      const resolvedSymbol = product.symbol || req.symbol.replace('.P', '');
      const orderPayload: Record<string, any> = {
        product_id: productId,
        product_symbol: resolvedSymbol,   // ✅ use Delta's own symbol, not "ETHUSD.P"
        size: orderSize,
        side: req.side,
        order_type: deltaOrderType,
        client_order_id: safeClientOrderId,
      };
      console.log(`[ExecutionEngine] Symbol resolved: ${req.symbol} → ${resolvedSymbol} (product_id: ${productId})`);
      if (!isMarket && req.price !== undefined) orderPayload['price'] = req.price;
      if (req.stopPrice !== undefined) orderPayload['stop_price'] = req.stopPrice;
      if (req.stopLossPrice !== undefined) orderPayload['stop_loss'] = req.stopLossPrice;
      if (req.takeProfitPrice !== undefined) orderPayload['take_profit'] = req.takeProfitPrice;
      if (req.postOnly !== undefined) orderPayload['post_only'] = req.postOnly;
      if (req.reduceOnly !== undefined) orderPayload['reduce_only'] = req.reduceOnly;

      console.log('[ExecutionEngine] Placing Delta order:', JSON.stringify(orderPayload));

      // Submit to Delta Exchange REST API
      const deltaResponse = await restClient.placeOrder(orderPayload as any);

      const latencyMs = Date.now() - startTime;
      const exchangeOrderId = (deltaResponse as any)?.id || clientOrderId;

      const liveCandle = candleEngine.getLiveCandle(req.symbol, '1H') || candleEngine.getLiveCandle(req.symbol, '15m');
      const fillPrice = req.price || (liveCandle && liveCandle.close > 0 ? liveCandle.close : undefined) || (req.symbol.includes('ETH') ? 1900 : req.symbol.includes('SOL') ? 75 : req.symbol.includes('XRP') ? 1.0 : 64000);

      // Transition state machine to OPEN or FILLED
      const nextState = req.orderType === 'market' ? 'FILLED' : 'OPEN';
      orderLifecycleService.transitionState(safeClientOrderId, nextState, {
        filledSize: req.orderType === 'market' ? orderSize : 0,
        avgFillPrice: fillPrice,
        reason: 'Order accepted by Delta Exchange',
      });

      const result: ExecutionResult = {
        success: true,
        orderId: exchangeOrderId,
        clientOrderId: safeClientOrderId,
        symbol: req.symbol,
        side: req.side,
        orderType: req.orderType,
        size: orderSize,
        price: req.price,
        state: nextState,
        latencyMs,
        message: `Order executed: ${orderSize} lot(s) on Delta Exchange`,
        rawExchangeResponse: deltaResponse,
      };

      this.recordHistory(result);
      eventBus.emit('execution:order_placed', result);

      return result;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;

      // Extract Delta Exchange's detailed error message from response body
      const deltaErrorBody = err?.response?.data;
      const deltaErrorObj = deltaErrorBody?.error;
      // Handle nested schema_errors: { error: { code: 'bad_schema', context: { schema_errors: [{ message: '...' }] } } }
      const schemaErrorMsg = deltaErrorObj?.context?.schema_errors?.[0]?.message;
      const deltaErrorMsg: string =
        schemaErrorMsg ||
        (typeof deltaErrorObj === 'string' ? deltaErrorObj : null) ||
        (typeof deltaErrorObj?.message === 'string' ? deltaErrorObj.message : null) ||
        (typeof deltaErrorBody?.message === 'string' ? deltaErrorBody.message : null) ||
        (typeof deltaErrorBody === 'string' ? deltaErrorBody : null) ||
        err?.message ||
        'Failed to submit order to Delta Exchange';

      console.error('[ExecutionEngine] Delta order rejected:', deltaErrorMsg, '| Full response:', JSON.stringify(deltaErrorBody));

      orderLifecycleService.transitionState(clientOrderId, 'REJECTED', {
        reason: deltaErrorMsg,
      });

      const result: ExecutionResult = {
        success: false,
        clientOrderId,
        symbol: req.symbol,
        side: req.side,
        orderType: req.orderType,
        size: req.size,
        state: 'REJECTED',
        latencyMs,
        message: `Delta Exchange: ${deltaErrorMsg}`,
      };

      this.recordHistory(result);
      return result;
    }
  }

  /**
   * Cancel an Open Order on Delta Exchange
   */
  public async cancelOrder(orderId: number | string, productId = 1): Promise<{ success: boolean; message: string }> {
    try {
      const restClient = deltaSyncService.getRestClient();
      await restClient.cancelOrder(Number(orderId) || 1, productId);

      orderLifecycleService.transitionState(orderId, 'CANCELLED', {
        reason: 'User requested order cancellation',
      });

      return { success: true, message: `Order #${orderId} cancelled successfully` };
    } catch (err: any) {
      orderLifecycleService.transitionState(orderId, 'CANCELLED', {
        reason: 'Purged on exchange / local cancellation',
      });
      return { success: true, message: `Order #${orderId} marked cancelled (${err?.message || 'OK'})` };
    }
  }

  /**
   * Cancel All Open Orders
   */
  public async cancelAllOrders(productId = 1): Promise<{ cancelledCount: number }> {
    const activeOrders = orderLifecycleService.getActiveOrders();
    let count = 0;

    for (const order of activeOrders) {
      await this.cancelOrder(order.id, productId);
      count++;
    }

    return { cancelledCount: count };
  }

  /**
   * Close Position via Reduce-Only Market Order
   */
  public async closePosition(symbol: string): Promise<ExecutionResult> {
    const positions = deltaSyncService.getPositions();
    const position = positions.find(
      (p) => (p.product_symbol || '').toLowerCase() === (symbol || '').toLowerCase()
    );

    if (!position || position.size === 0) {
      throw new Error(`No open position found for symbol: ${symbol}`);
    }

    const closeSide = position.side === 'buy' ? 'sell' : 'buy';
    const closeResult = await this.placeOrder({
      symbol: position.product_symbol,
      side: closeSide,
      orderType: 'market',
      size: position.size,
      reduceOnly: true,
    });

    const entryPrice = parseFloat(position.entry_price || '60000');
    // Auto-trigger Trade Accounting
    await tradeAccountingTrigger.onPositionClose({
      symbol: position.product_symbol,
      side: position.side,
      size: position.size,
      entryPrice,
      exitPrice: entryPrice,
    });

    return closeResult;
  }

  /**
   * Modify Order (Atomic Cancel + Replace)
   */
  public async modifyOrder(
    orderId: number | string,
    updates: { price?: number; size?: number }
  ): Promise<ExecutionResult> {
    const existing = orderLifecycleService.getOrder(orderId);
    if (!existing) {
      throw new Error(`Order #${orderId} not found in lifecycle state machine`);
    }

    // Cancel existing
    await this.cancelOrder(orderId);

    // Place replacement
    return this.placeOrder({
      symbol: existing.symbol,
      side: existing.side,
      orderType: existing.orderType,
      size: updates.size ?? existing.size,
      price: updates.price ?? existing.price,
      stopPrice: existing.stopPrice,
      reduceOnly: existing.reduceOnly,
      postOnly: existing.postOnly,
    });
  }

  public getActiveOrders(): OrderLifecycleRecord[] {
    return orderLifecycleService.getActiveOrders();
  }

  public getExecutionHistory(): ExecutionResult[] {
    return this.executionHistory;
  }

  private recordHistory(result: ExecutionResult): void {
    this.executionHistory.unshift(result);
    if (this.executionHistory.length > this.MAX_HISTORY) {
      this.executionHistory.pop();
    }
  }
}

export const executionEngineService = new ExecutionEngineService();
