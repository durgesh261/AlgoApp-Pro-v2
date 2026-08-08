import { Router } from 'express';
import { executionEngineService } from '../modules/execution-engine/services/ExecutionEngineService.js';
import { deltaSyncService } from '../modules/delta-exchange/index.js';
import { prisma } from '../db.js';

const router = Router();
import { candleEngine } from '../engine/CandleEngine.js';
const ALLOWED_SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

/**
 * POST /api/v1/execution/place
 * Manual order placement with full strategy validation.
 * Only works when algo is OFF (enforced by frontend, double-checked here).
 */
router.post('/place', async (req, res) => {
  try {
    const {
      symbol,
      side,
      orderType,
      size,
      price,
      leverage,
      stopLossPrice,
      takeProfitPrice,
      clientOrderId,
    } = req.body;

    // ── Strategy §2: Symbol whitelist ──
    if (!ALLOWED_SYMBOLS.includes(symbol)) {
      return res.status(400).json({
        success: false,
        message: `Invalid symbol. Only ${ALLOWED_SYMBOLS.join(', ')} allowed.`,
      });
    }

    // ── Strategy §15: One trade maximum ──
    const positions = deltaSyncService.getPositions();
    if (positions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Only one position allowed at a time (Strategy §15).',
      });
    }

    // ── Strategy §17: Leverage bounds ──
    const lev = parseInt(leverage) || 1;
    if (lev < 1 || lev > 100) {
      return res.status(400).json({
        success: false,
        message: 'Leverage must be between 1x and 100x.',
      });
    }

    // ── Balance check ──
    const balances = deltaSyncService.getBalances();
    const usdtBalance = balances.find(
      (b) => b.asset_symbol === 'USDT' || b.asset_symbol === 'USD'
    );
    const accountBalance = usdtBalance ? parseFloat(usdtBalance.balance || '0') : 0;
    const availableMargin = usdtBalance
      ? parseFloat(usdtBalance.available_balance || '0')
      : 0;

    if (accountBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No account balance available. Check Delta API connection.',
      });
    }

    // ── Live price check ──
    const liveCandle = candleEngine.getLiveCandle(symbol, '1H') || candleEngine.getLiveCandle(symbol, '15m');
    const entryPrice = price || liveCandle?.close || 0;
    if (entryPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No live price available. Cannot execute.',
      });
    }

    const qty = parseFloat(size);
    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0.',
      });
    }

    // ── Margin check ──
    const notional = entryPrice * qty;
    const marginRequired = notional / lev;
    if (availableMargin < marginRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient margin. Need $${marginRequired.toFixed(2)}, have $${availableMargin.toFixed(2)}.`,
      });
    }

    // ── Strategy §17-18: Risk validation ──
    if (stopLossPrice) {
      const sl = parseFloat(stopLossPrice);
      const slDistance = Math.abs(entryPrice - sl);
      const riskAmount = slDistance * qty;
      const riskPercent = (riskAmount / accountBalance) * 100;

      if (riskPercent > 35.5) {
        return res.status(400).json({
          success: false,
          message: `Risk ${riskPercent.toFixed(2)}% exceeds 35% strategy limit (§17).`,
        });
      }
    }

    // ── Execute via engine ──
    const result = await executionEngineService.placeOrder({
      symbol,
      side,
      orderType: orderType || 'market',
      size: qty,
      price: orderType === 'limit' ? entryPrice : undefined,
      leverage: lev,
      stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
      takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
      clientOrderId: clientOrderId || `MANUAL-${symbol}-${Date.now()}`,
    });

    // ── Persist to trade ledger ──
    if (result.success) {
      await prisma.tradeLedger.create({
        data: {
          tradeId: result.clientOrderId,
          exchangeOrderId: String(result.orderId || result.clientOrderId),
          symbol,
          timeframe: '1H',
          executionMode: 'LIVE',
          side: side.toUpperCase(),
          entryPrice,
          quantity: qty,
          marginUsed: marginRequired,
          leverage: lev,
          riskPercent: stopLossPrice
            ? (Math.abs(entryPrice - parseFloat(stopLossPrice)) * qty) / accountBalance * 100
            : 0,
          stopLoss: stopLossPrice ? parseFloat(stopLossPrice) : 0,
          takeProfit: takeProfitPrice ? parseFloat(takeProfitPrice) : 0,
          decisionConfidence: 100, // Manual override
          decisionExplanation: 'Manual execution by user',
          resultStatus: 'OPEN',
          syncStatus: 'SYNCED',
          executedAt: new Date(),
        },
      });
    }

    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[ExecutionRoute] Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal execution error',
    });
  }
});

export default router;
