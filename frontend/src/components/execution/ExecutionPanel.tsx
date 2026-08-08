import React, { useState, useEffect } from 'react';
import {
  Send,
  Lock,
  Bot,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Wallet,
  Gauge,
  Target,
  Shield,
} from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useManualExecution } from '../../hooks/useManualExecution';

const ALLOWED_SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

export const ExecutionPanel: React.FC = () => {
  const { activeSymbol, setActiveSymbol, isAlgoRunning } = useTerminalStore();
  const {
    isPlacing,
    lastError,
    lastSuccess,
    validateExecution,
    placeOrder,
    accountBalance,
    availableMargin,
    currentPrice,
    hasOpenPosition,
  } = useManualExecution();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  // Auto-clear success/error after 5s
  useEffect(() => {
    if (lastSuccess || lastError) {
      const t = setTimeout(() => {
        // Parent handles clearing via state reset on next action
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [lastSuccess, lastError]);

  const price = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice;

  const preview = (() => {
    if (!quantity || parseFloat(quantity) <= 0 || price <= 0) return null;
    return validateExecution({
      symbol: activeSymbol,
      side,
      orderType,
      quantity: parseFloat(quantity),
      price: price > 0 ? price : undefined,
      leverage,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlgoRunning || isPlacing) return;

    const result = await placeOrder({
      symbol: activeSymbol,
      side,
      orderType,
      quantity: parseFloat(quantity),
      price: price > 0 ? price : undefined,
      leverage,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });

    if (result.success) {
      setQuantity('');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
    }
  };

  const setPercentQuantity = (pct: number) => {
    if (accountBalance <= 0 || currentPrice <= 0) return;
    const notional = accountBalance * (pct / 100);
    const qty = notional / currentPrice;
    setQuantity(qty.toFixed(4));
  };

  const autoSL = () => {
    if (currentPrice <= 0) return;
    const dist = currentPrice * 0.0035;
    setStopLoss((side === 'buy' ? currentPrice - dist : currentPrice + dist).toFixed(2));
  };

  const autoTP = () => {
    if (currentPrice <= 0) return;
    const dist = currentPrice * 0.006;
    setTakeProfit((side === 'buy' ? currentPrice + dist : currentPrice - dist).toFixed(2));
  };

  return (
    <div className="w-full bg-[#0E121A] border border-[#1E293B] rounded-xl overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-[#3B82F6]" />
          <span className="text-xs font-bold text-[#F8FAFC]">Manual Execution</span>
        </div>
        <div
          className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
            isAlgoRunning
              ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30'
              : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
          }`}
        >
          <Bot className="w-3 h-3" />
          <span>{isAlgoRunning ? 'ALGO ON' : 'ALGO OFF'}</span>
        </div>
      </div>

      {/* Body */}
      {isAlgoRunning ? (
        <div className="flex flex-col items-center justify-center text-center p-6 min-h-[400px]">
          <div className="w-14 h-14 rounded-full bg-[#00C896]/20 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-[#00C896]" />
          </div>
          <p className="text-sm font-bold text-[#00C896] mb-1">Algorithm Active</p>
          <p className="text-[11px] text-[#94A3B8] max-w-[240px] mb-2">
            QuantEdge AI is scanning 4 pairs on 1H timeframe. Manual execution is locked.
          </p>
          <p className="text-[10px] text-[#64748B]">
            Turn OFF &quot;ALGO TRADING&quot; in the top header to unlock manual mode.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
        {/* Symbol Selector */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Symbol</span>
          <div className="grid grid-cols-2 gap-2">
            {ALLOWED_SYMBOLS.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setActiveSymbol(sym)}
                className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
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

        {/* Balance Display */}
        <div className="bg-[#121722] border border-[#1E293B] rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Wallet className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[10px] text-[#94A3B8]">Balance</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#F8FAFC]">
            ${accountBalance.toFixed(2)}
          </span>
        </div>

        {/* Side Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              side === 'buy'
                ? 'bg-[#00C896] text-[#0B0E14] shadow-lg shadow-[#00C896]/20'
                : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>BUY</span>
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              side === 'sell'
                ? 'bg-[#F6465D] text-white shadow-lg shadow-[#F6465D]/20'
                : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>SELL</span>
          </button>
        </div>

        {/* Order Type */}
        <div className="flex items-center space-x-2">
          {(['market', 'limit'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-bold border transition-colors ${
                orderType === type
                  ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40'
                  : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Quantity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8]">Quantity</span>
              <div className="flex space-x-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentQuantity(pct)}
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
                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] placeholder-[#334155]"
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
                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] placeholder-[#334155]"
                placeholder={currentPrice > 0 ? currentPrice.toFixed(2) : '0.00'}
                required
              />
            </div>
          )}

          {/* Leverage */}
          <div className="space-y-1.5">
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

          {/* SL / TP */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#94A3B8]">Stop Loss</span>
                <button
                  type="button"
                  onClick={autoSL}
                  className="text-[9px] text-[#F59E0B] hover:text-[#F59E0B]/80 font-bold"
                >
                  Auto
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#F6465D] placeholder-[#334155]"
                placeholder="SL Price"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#94A3B8]">Take Profit</span>
                <button
                  type="button"
                  onClick={autoTP}
                  className="text-[9px] text-[#00C896] hover:text-[#00C896]/80 font-bold"
                >
                  Auto
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#00C896] placeholder-[#334155]"
                placeholder="TP Price"
              />
            </div>
          </div>

          {/* Risk Preview */}
          {preview && (
            <div
              className={`rounded-lg border p-3 space-y-1.5 ${
                preview.isValid && preview.estimatedRiskPercent <= 35
                  ? 'bg-[#00C896]/5 border-[#00C896]/20'
                  : 'bg-[#F6465D]/5 border-[#F6465D]/20'
              }`}
            >
              <div className="flex justify-between text-[10px]">
                <span className="text-[#94A3B8]">Margin:</span>
                <span className="text-white font-mono">${preview.estimatedMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#94A3B8]">Risk:</span>
                <span
                  className={`font-mono font-bold ${
                    preview.estimatedRiskPercent > 35 ? 'text-[#F6465D]' : 'text-[#F59E0B]'
                  }`}
                >
                  ${preview.estimatedRiskAmount.toFixed(2)} ({preview.estimatedRiskPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#94A3B8]">Reward:</span>
                <span className="text-[#00C896] font-mono">
                  {preview.estimatedRewardPercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#94A3B8]">Strategy Limit:</span>
                <span className="text-[#F6465D] font-bold">35% Risk / 60% Profit</span>
              </div>

              {preview.errors.length > 0 && (
                <div className="pt-1.5 border-t border-[#F6465D]/20 space-y-1">
                  {preview.errors.map((err, i) => (
                    <div key={i} className="flex items-start space-x-1 text-[9px] text-[#F6465D]">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {preview.warnings.length > 0 && preview.errors.length === 0 && (
                <div className="pt-1.5 space-y-1">
                  {preview.warnings.map((warn, i) => (
                    <div key={i} className="text-[9px] text-[#F59E0B]">{warn}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Position Block Warning */}
          {hasOpenPosition && (
            <div className="bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg p-2.5 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-[#F6465D] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-[#F6465D]">One Trade Maximum (§15)</p>
                <p className="text-[9px] text-[#94A3B8]">
                  You have an open position. Close it before placing a new order.
                </p>
              </div>
            </div>
          )}

          {/* Alerts */}
          {lastError && (
            <div className="bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg p-2.5 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#F6465D] shrink-0 mt-0.5" />
              <span className="text-[10px] text-[#F6465D]">{lastError}</span>
            </div>
          )}

          {lastSuccess && (
            <div className="bg-[#00C896]/10 border border-[#00C896]/30 rounded-lg p-2.5 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C896] shrink-0 mt-0.5" />
              <span className="text-[10px] text-[#00C896]">{lastSuccess}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPlacing || isAlgoRunning || hasOpenPosition || (preview ? !preview.isValid : false)}
            className={`w-full py-3 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all ${
              side === 'buy'
                ? 'bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14]'
                : 'bg-[#F6465D] hover:bg-[#DC2626] text-white'
            } ${
              isPlacing || isAlgoRunning || hasOpenPosition || (preview ? !preview.isValid : false)
                ? 'opacity-40 cursor-not-allowed'
                : ''
            }`}
          >
            {isPlacing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>EXECUTING...</span>
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
      )}
    </div>
  );
};
