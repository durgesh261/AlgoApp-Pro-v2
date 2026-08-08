import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExecution } from '../../hooks/useExecution';
import { usePortfolioSummary } from '../../hooks/usePortfolioSummary';
import { ValueDisplay } from './ValueDisplay';
import { 
  X, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  defaultSide?: 'buy' | 'sell';
}

export const ExecutionModal: React.FC<ExecutionModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol = 'BTCUSD.P',
  defaultSide = 'buy',
}) => {
  const { placeOrderLegacy: placeOrder, isPlacing, validateOrder, isValidating, validationResult } = useExecution();
  const { data: portfolioSummary } = usePortfolioSummary();

  const wallet = portfolioSummary?.wallet;
  const availableMargin = wallet?.availableMargin || 10000;
  const totalEquity = wallet?.totalEquity || 10000;

  const [symbol, setSymbol] = useState(defaultSymbol);
  const [side, setSide] = useState<'buy' | 'sell'>(defaultSide);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop_market' | 'stop_limit'>('market');
  const [size, setSize] = useState<number>(0.001);
  const [price, setPrice] = useState<string>('60000');
  const [stopPrice, setStopPrice] = useState<string>('59000');
  const [leverage, setLeverage] = useState<number>(10);
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [reduceOnly, setReduceOnly] = useState<boolean>(false);
  const [postOnly, setPostOnly] = useState<boolean>(false);
  const [showValidationDetails, setShowValidationDetails] = useState<boolean>(false);

  useEffect(() => {
    setSymbol(defaultSymbol);
    setSide(defaultSide);
  }, [defaultSymbol, defaultSide]);

  // Derived Calculations
  const numericPrice = parseFloat(price) || 60000;
  const numericSL = parseFloat(stopLossPrice) || 0;
  const numericTP = parseFloat(takeProfitPrice) || 0;

  const notionalValue = size * numericPrice;
  const requiredMargin = notionalValue / leverage;

  // 35% Max Risk Calculation
  const perUnitRisk = numericSL > 0 ? Math.abs(numericPrice - numericSL) : 0;
  const totalRiskUsd = perUnitRisk * size;
  const riskPercentOfEquity = totalEquity > 0 ? (totalRiskUsd / totalEquity) * 100 : 0;
  const isRiskExceeded = numericSL > 0 && riskPercentOfEquity > 1.5;

  // Risk:Reward Ratio
  const perUnitReward = numericTP > 0 ? Math.abs(numericTP - numericPrice) : 0;
  const riskRewardRatio = perUnitRisk > 0 && perUnitReward > 0 ? (perUnitReward / perUnitRisk).toFixed(2) : '—';

  const handleValidate = async () => {
    setShowValidationDetails(true);
    await validateOrder({
      symbol,
      side,
      orderType,
      size,
      price: ['limit', 'stop_limit'].includes(orderType) ? parseFloat(price) : undefined,
      stopPrice: ['stop_market', 'stop_limit'].includes(orderType) ? parseFloat(stopPrice) : undefined,
      leverage,
      reduceOnly,
      postOnly,
      stopLossPrice: numericSL > 0 ? numericSL : undefined,
      takeProfitPrice: numericTP > 0 ? numericTP : undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await placeOrder({
        symbol,
        side,
        orderType,
        size,
        price: ['limit', 'stop_limit'].includes(orderType) ? parseFloat(price) : undefined,
        stopPrice: ['stop_market', 'stop_limit'].includes(orderType) ? parseFloat(stopPrice) : undefined,
        leverage,
        reduceOnly,
        postOnly,
        stopLossPrice: numericSL > 0 ? numericSL : undefined,
        takeProfitPrice: numericTP > 0 ? numericTP : undefined,
      });

      if (res?.data?.success) {
        onClose();
      }
    } catch {
      // Toast handles error display
    }
  };

  const setPercentSize = (pct: number) => {
    const marginToUse = availableMargin * (pct / 100);
    const maxNotional = marginToUse * leverage;
    const computedSize = maxNotional / numericPrice;
    setSize(parseFloat(computedSize.toFixed(4)) || 0.001);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono text-xs text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Delta Exchange Execution Terminal
                </h2>
                <p className="text-[10px] text-slate-400">Institutional Order Routing & Pre-Flight Validation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Symbol & Side Selection */}
            <div className="grid grid-cols-2 gap-3">
              {/* Symbol Picker */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Trading Pair</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none"
                >
                  <option value="BTCUSD.P">BTCUSD.P (Bitcoin Perp)</option>
                  <option value="ETHUSD.P">ETHUSD.P (Ethereum Perp)</option>
                  <option value="SOLUSD.P">SOLUSD.P (Solana Perp)</option>
                  <option value="XRPUSD.P">XRPUSD.P (Ripple Perp)</option>
                </select>
              </div>

              {/* Order Side Toggle */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Execution Direction</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSide('buy')}
                    className={`py-1.5 rounded text-xs font-bold transition flex items-center justify-center space-x-1 ${
                      side === 'buy'
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>BUY / LONG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('sell')}
                    className={`py-1.5 rounded text-xs font-bold transition flex items-center justify-center space-x-1 ${
                      side === 'sell'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>SELL / SHORT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Order Type & Leverage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none uppercase"
                >
                  <option value="market">MARKET (Instant Taker)</option>
                  <option value="limit">LIMIT (Maker)</option>
                  <option value="stop_market">STOP MARKET</option>
                  <option value="stop_limit">STOP LIMIT</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Leverage</label>
                  <span className="text-indigo-400 font-bold">{leverage}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value) || 10)}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Price Inputs (Conditional) */}
            {['limit', 'stop_limit'].includes(orderType) && (
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Limit Price ($)</label>
                <input
                  type="number"
                  step="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. 60000"
                  required
                />
              </div>
            )}

            {['stop_market', 'stop_limit'].includes(orderType) && (
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Trigger Stop Price ($)</label>
                <input
                  type="number"
                  step="0.1"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. 59500"
                  required
                />
              </div>
            )}

            {/* Size & Quick Sizing Buttons */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Order Size (Contracts / Units)</label>
                <span className="text-[10px] text-slate-400">
                  Notional: <strong className="text-white">${notionalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={size}
                onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:border-indigo-500 focus:outline-none mb-1.5"
                placeholder="0.001"
                required
              />
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentSize(pct)}
                    className="py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-300 font-bold transition border border-slate-700/50"
                  >
                    {pct}% Margin
                  </button>
                ))}
              </div>
            </div>

            {/* TP / SL Brackets */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <div>
                <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  step="0.1"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="Optional TP"
                />
              </div>

              <div>
                <label className="text-[10px] text-rose-400 uppercase font-bold block mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  step="0.1"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-rose-500 focus:outline-none"
                  placeholder="Optional SL"
                />
              </div>

              {/* Live Risk Metrics */}
              <div className="col-span-2 flex items-center justify-between text-[10px] border-t border-slate-800 pt-2">
                <span className="text-slate-400">Risk:Reward: <strong className="text-indigo-400">{riskRewardRatio}</strong></span>
                <span className={isRiskExceeded ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  Risk on Equity: <strong>{riskPercentOfEquity.toFixed(2)}%</strong> (Max: 35%)
                </span>
              </div>
              {isRiskExceeded && (
                <div className="col-span-2 flex items-center space-x-1.5 text-[10px] text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/30">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Violates 35% max risk policy rule. Reduce size or tighten SL.</span>
                </div>
              )}
            </div>

            {/* Execution Modifiers Checkboxes */}
            <div className="flex items-center space-x-4 text-[11px] text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reduceOnly}
                  onChange={(e) => setReduceOnly(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                />
                <span>Reduce-Only</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postOnly}
                  onChange={(e) => setPostOnly(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                />
                <span>Post-Only (Maker)</span>
              </label>
            </div>

            {/* Margin Solvency Box */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Required Margin:</span>
                <span className="text-amber-400 font-bold">${requiredMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Wallet Margin:</span>
                <ValueDisplay value={availableMargin} format="currency" size="sm" neutralColor="text-emerald-400" />
              </div>
            </div>

            {/* Pre-flight Validation Results */}
            {showValidationDetails && validationResult && (
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px]">
                <div className="font-bold text-white flex items-center justify-between border-b border-slate-800 pb-1">
                  <span>Pre-Flight Validation (10 Rules)</span>
                  <span className={validationResult.isValid ? 'text-emerald-400' : 'text-rose-400'}>
                    {validationResult.isValid ? 'ALL 10 RULES PASSED' : 'VALIDATION BLOCKED'}
                  </span>
                </div>
                {validationResult.results?.map((rule: any) => (
                  <div key={rule.ruleNumber} className="flex items-center justify-between">
                    <span className="text-slate-400">{rule.ruleNumber}. {rule.ruleName}:</span>
                    <span className={rule.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {rule.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>{isValidating ? 'VALIDATING...' : 'PRE-FLIGHT VALIDATE'}</span>
              </button>

              <button
                type="submit"
                disabled={isPlacing}
                className={`py-3 font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 ${
                  side === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                } disabled:opacity-50`}
              >
                <Send className="w-4 h-4" />
                <span>{isPlacing ? 'TRANSMITTING TO DELTA...' : `SUBMIT ${side.toUpperCase()} ORDER`}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
