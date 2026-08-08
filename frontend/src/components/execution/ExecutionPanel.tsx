import React, { useState, useEffect } from 'react';
import { Send, Lock, Bot, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { usePortfolioSummary } from '../../hooks/usePortfolioSummary';
import { useMarketPairs } from '../../hooks/useMarketPairs';
import { executionApi } from '../../services/api';

const ALLOWED_SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];
const MAX_LEVERAGE = 100;
const MAX_RISK_PERCENT = 35;

interface ExecutionValidation {
  isValid: boolean;
  errors: string[];
  marginRequired: number;
  riskPercent: number;
  notional: number;
}

export const ExecutionPanel: React.FC = () => {
  const { activeSymbol, isAlgoRunning, toggleAlgo } = useTerminalStore();
  const { data: portfolioSummary } = usePortfolioSummary();
  const { pairs } = useMarketPairs();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const wallet = portfolioSummary?.wallet;
  const accountBalance = wallet?.walletBalance || 0;
  const availableMargin = wallet?.availableMargin || 0;
  const positionsCount = portfolioSummary?.positions?.count || 0;
  const currentPrice = pairs[activeSymbol]?.price || 0;

  // Auto-clear messages
  useEffect(() => {
    if (submitSuccess || submitError) {
      const timer = setTimeout(() => {
        setSubmitSuccess(null);
        setSubmitError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [submitSuccess, submitError]);

  const validation: ExecutionValidation | null = (() => {
    if (!quantity || parseFloat(quantity) <= 0) return null;
    const qty = parseFloat(quantity);
    const price = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice;
    if (price <= 0) return null;

    const notional = price * qty;
    const marginRequired = notional / leverage;

    let riskPercent = 0;
    if (stopLoss && parseFloat(stopLoss) > 0) {
      const sl = parseFloat(stopLoss);
      const slDistance = Math.abs(price - sl);
      const riskAmount = slDistance * qty;
      riskPercent = accountBalance > 0 ? (riskAmount / accountBalance) * 100 : 0;
    }

    const errors: string[] = [];
    if (!ALLOWED_SYMBOLS.includes(activeSymbol)) {
      errors.push(`Invalid symbol: ${activeSymbol}`);
    }
    if (positionsCount > 0) {
      errors.push('Close existing position first (Strategy §15: One trade max)');
    }
    if (leverage > MAX_LEVERAGE) {
      errors.push(`Leverage ${leverage}x exceeds max ${MAX_LEVERAGE}x`);
    }
    if (leverage < 1) {
      errors.push('Leverage must be ≥ 1x');
    }
    if (marginRequired > availableMargin) {
      errors.push(`Insufficient margin: need $${marginRequired.toFixed(2)}, have $${availableMargin.toFixed(2)}`);
    }
    if (riskPercent > MAX_RISK_PERCENT) {
      errors.push(`Risk ${riskPercent.toFixed(1)}% exceeds ${MAX_RISK_PERCENT}% strategy limit`);
    }
    if (accountBalance <= 0) {
      errors.push('No account balance. Connect Delta API in Settings.');
    }

    return { isValid: errors.length === 0, errors, marginRequired, riskPercent, notional };
  })();

  const handleSetPercent = (pct: number) => {
    if (accountBalance <= 0 || currentPrice <= 0) return;
    // Calculate quantity to use X% of balance as margin at selected leverage
    const targetMargin = accountBalance * (pct / 100);
    const notional = targetMargin * leverage;
    const qty = notional / currentPrice;
    setQuantity(qty.toFixed(4));
  };

  const handleAutoSL = () => {
    if (currentPrice <= 0) return;
    // Approximate 35% risk at selected leverage = price move %
    const priceMovePct = 0.35 / leverage;
    const slDistance = currentPrice * priceMovePct;
    const sl = side === 'buy' ? currentPrice - slDistance : currentPrice + slDistance;
    setStopLoss(sl.toFixed(2));
  };

  const handleAutoTP = () => {
    if (currentPrice <= 0) return;
    // Approximate 60% profit at selected leverage
    const priceMovePct = 0.60 / leverage;
    const tpDistance = currentPrice * priceMovePct;
    const tp = side === 'buy' ? currentPrice + tpDistance : currentPrice - tpDistance;
    setTakeProfit(tp.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlgoRunning) {
      setSubmitError('Algorithm is running. Disable ALGO TRADING to execute manually.');
      return;
    }
    if (!validation?.isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const price = orderType === 'limit' ? parseFloat(limitPrice) : undefined;
      
      const payload = {
        symbol: activeSymbol,
        side,
        orderType,
        size: parseFloat(quantity),
        price,
        leverage,
        stopLossPrice: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfitPrice: takeProfit ? parseFloat(takeProfit) : undefined,
        clientOrderId: `MANUAL-${activeSymbol}-${Date.now()}`,
      };

      // REAL API CALL TO DELTA EXCHANGE VIA BACKEND
      const response = await executionApi.placeOrder(payload as any);
      
      if (response.data?.success) {
        setSubmitSuccess(`Order placed! ID: ${response.data.data?.orderId || response.data.data?.clientOrderId}`);
        // Clear form
        setQuantity('');
        setLimitPrice('');
        setStopLoss('');
        setTakeProfit('');
      } else {
        setSubmitError(response.data?.message || 'Order rejected by backend');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Network error';
      setSubmitError(`Execution failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#0E121A] border-l border-[#1E293B] flex flex-col overflow-y-auto">
      
      {/* Algo Mode Header */}
      <div className="p-3 border-b border-[#1E293B]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Trading Mode</span>
          <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
            isAlgoRunning 
              ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30' 
              : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
          }`}>
            <Bot className="w-3 h-3" />
            <span>{isAlgoRunning ? 'ALGO ON' : 'ALGO OFF'}</span>
          </div>
        </div>
        <button
          onClick={toggleAlgo}
          className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${
            isAlgoRunning
              ? 'bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/40 hover:bg-[#F6465D]/30'
              : 'bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40 hover:bg-[#00C896]/30'
          }`}
        >
          {isAlgoRunning ? 'STOP ALGORITHM' : 'START ALGORITHM'}
        </button>
        <p className="text-[9px] text-[#64748B] mt-1.5 leading-relaxed">
          {isAlgoRunning 
            ? 'Scanner running 24/7. Manual execution locked. Strategy: 1H, 4 pairs, 35% risk, 85% AI confidence.'
            : 'Manual trading active. All orders validated against strategy rules before Delta execution.'}
        </p>
      </div>

      {/* Symbol Selector */}
      <div className="p-3 border-b border-[#1E293B]">
        <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-2">Symbol</span>
        <div className="grid grid-cols-2 gap-1.5">
          {ALLOWED_SYMBOLS.map(sym => (
            <button
              key={sym}
              onClick={() => useTerminalStore.getState().setActiveSymbol(sym)}
              className={`py-1.5 rounded text-[10px] font-bold border transition-colors ${
                activeSymbol === sym
                  ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                  : 'bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-white'
              }`}
            >
              {sym.replace('.P', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Form */}
      <div className="p-3 flex-1 relative">
        {isAlgoRunning && (
          <div className="absolute inset-0 bg-[#0E121A]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4 rounded-lg m-3">
            <div className="w-12 h-12 rounded-full bg-[#00C896]/20 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-[#00C896]" />
            </div>
            <p className="text-sm font-bold text-[#00C896] mb-1">Algorithm Active</p>
            <p className="text-[10px] text-[#94A3B8] max-w-[220px] mb-3">
              QuantEdge AI is scanning BTC, ETH, SOL, XRP on 1H timeframe. Manual execution disabled.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-[#64748B]">
              <Lock className="w-3 h-3" />
              <span>Locked by strategy</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Side */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors ${
                side === 'buy'
                  ? 'bg-[#00C896] text-[#0B0E14]'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>BUY / LONG</span>
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors ${
                side === 'sell'
                  ? 'bg-[#F6465D] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>SELL / SHORT</span>
            </button>
          </div>

          {/* Order Type */}
          <div className="flex items-center space-x-2">
            {(['market', 'limit'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                  orderType === type
                    ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40'
                    : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8]">Quantity</span>
              <div className="flex space-x-1">
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSetPercent(pct)}
                    className="px-1.5 py-0.5 bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] rounded text-[9px] font-bold transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] placeholder-[#64748B]"
                placeholder="0.000"
                required
              />
              <span className="absolute right-3 top-2 text-[10px] text-[#64748B]">Lots</span>
            </div>
          </div>

          {/* Limit Price */}
          {orderType === 'limit' && (
            <div className="space-y-1">
              <span className="text-[10px] text-[#94A3B8]">Limit Price</span>
              <input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] placeholder-[#64748B]"
                placeholder={currentPrice > 0 ? currentPrice.toFixed(2) : '0.00'}
                required
              />
            </div>
          )}

          {/* Leverage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8]">Leverage</span>
              <span className="text-[10px] font-bold text-[#F59E0B]">{leverage}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[9px] text-[#64748B]">
              <span>1x</span>
              <span className="text-[#F59E0B] font-bold">MAX 100x (§17)</span>
              <span>100x</span>
            </div>
          </div>

          {/* Stop Loss */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8]">Stop Loss</span>
              <button type="button" onClick={handleAutoSL} className="text-[9px] text-[#F59E0B] hover:text-[#F59E0B]/80 font-bold">
                Auto (35% Risk)
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#F6465D] placeholder-[#64748B]"
              placeholder="SL Price"
            />
          </div>

          {/* Take Profit */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8]">Take Profit</span>
              <button type="button" onClick={handleAutoTP} className="text-[9px] text-[#00C896] hover:text-[#00C896]/80 font-bold">
                Auto (60% Profit)
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#00C896] placeholder-[#64748B]"
              placeholder="TP Price"
            />
          </div>

          {/* Risk Preview */}
          {validation && (
            <div className={`rounded-lg border p-2.5 space-y-1.5 ${
              validation.isValid ? 'bg-[#00C896]/5 border-[#00C896]/20' : 'bg-[#F6465D]/5 border-[#F6465D]/20'
            }`}>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#94A3B8]">Margin Required:</span>
              <span className="text-white font-mono">${validation.marginRequired.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#94A3B8]">Est. Risk:</span>
              <span className={`font-mono ${validation.riskPercent > 35 ? 'text-[#F6465D]' : 'text-[#F59E0B]'}`}>
                {validation.riskPercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#94A3B8]">Notional:</span>
              <span className="text-white font-mono">${validation.notional.toFixed(2)}</span>
            </div>
            {validation.errors.length > 0 && (
              <div className="pt-1 border-t border-[#F6465D]/20 space-y-1">
                {validation.errors.map((err, i) => (
                  <div key={i} className="flex items-start space-x-1 text-[9px] text-[#F6465D]">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Messages */}
          {submitError && (
            <div className="bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg p-2 text-[10px] text-[#F6465D] flex items-start space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
          {submitSuccess && (
            <div className="bg-[#00C896]/10 border border-[#00C896]/30 rounded-lg p-2 text-[10px] text-[#00C896] font-bold">
              {submitSuccess}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isAlgoRunning || (validation ? !validation.isValid : true)}
            className={`w-full py-3 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all ${
              side === 'buy'
                ? 'bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14]'
                : 'bg-[#F6465D] hover:bg-[#DC2626] text-white'
            } ${
              isSubmitting || isAlgoRunning || (validation ? !validation.isValid : true)
                ? 'opacity-40 cursor-not-allowed'
                : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>EXECUTING ON DELTA...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>EXECUTE {side.toUpperCase()} ORDER</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
