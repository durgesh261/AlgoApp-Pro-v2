import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';
import { usePortfolioSummary } from './usePortfolioSummary';
import { useMarketPairs } from './useMarketPairs';
import { useTerminalStore } from '../store/useTerminalStore';

export interface ExecutionInput {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  quantity: number;
  price?: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface ExecutionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedMargin: number;
  estimatedRiskPercent: number;
  estimatedRiskAmount: number;
  estimatedRewardPercent: number;
}

const ALLOWED_SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];
const MAX_LEVERAGE = 100;
const MAX_RISK_PERCENT = 35.5;
const TARGET_REWARD_PERCENT = 60;

export function useManualExecution() {
  const [isPlacing, setIsPlacing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);
  const { data: portfolio } = usePortfolioSummary();
  const { pairs } = useMarketPairs();
  const { activeSymbol } = useTerminalStore();

  const getAccountBalance = useCallback(() => portfolio?.wallet?.totalEquity || 0, [portfolio]);
  const getAvailableMargin = useCallback(() => portfolio?.wallet?.availableMargin || 0, [portfolio]);

  const validateExecution = useCallback(
    (input: ExecutionInput): ExecutionValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!ALLOWED_SYMBOLS.includes(input.symbol)) {
        errors.push(`Invalid symbol. Only ${ALLOWED_SYMBOLS.join(', ')} allowed.`);
      }

      const openPositions = portfolio?.positions?.items || [];
      if (openPositions.length > 0) {
        errors.push('Only one position allowed at a time. Close existing position first.');
      }

      if (input.leverage > MAX_LEVERAGE) {
        errors.push(`Leverage exceeds maximum ${MAX_LEVERAGE}x (Strategy §17).`);
      }
      if (input.leverage < 1) {
        errors.push('Leverage must be at least 1x.');
      }

      const accountBalance = getAccountBalance();
      const margin = getAvailableMargin();

      if (accountBalance <= 0) {
        errors.push('No account balance available. Connect Delta API in Settings.');
      }

      const pair: any = Object.values(pairs || {}).find((p: any) => p.symbol === input.symbol);
      const price = input.price || pair?.markPrice || 0;
      if (price <= 0) {
        errors.push('No valid price available. Check Delta connection.');
      }

      const notional = price * input.quantity;
      const marginRequired = notional / input.leverage;

      if (margin < marginRequired && margin > 0) {
        errors.push(
          `Insufficient margin. Need $${marginRequired.toFixed(2)}, have $${margin.toFixed(2)}.`
        );
      }

      if (input.quantity <= 0) {
        errors.push('Quantity must be greater than 0.');
      }

      let estimatedRiskPercent = 0;
      let estimatedRiskAmount = 0;
      let estimatedRewardPercent = 0;

      if (input.stopLoss && price > 0) {
        const slDistance = Math.abs(price - input.stopLoss);
        estimatedRiskAmount = slDistance * input.quantity;
        estimatedRiskPercent =
          accountBalance > 0 ? (estimatedRiskAmount / accountBalance) * 100 : 0;

        if (estimatedRiskPercent > MAX_RISK_PERCENT) {
          errors.push(
            `Risk ${estimatedRiskPercent.toFixed(2)}% exceeds 35% strategy limit (§17). Reduce size or tighten SL.`
          );
        }
        if (estimatedRiskPercent < 1) {
          warnings.push(`Risk ${estimatedRiskPercent.toFixed(2)}% is very low. Strategy uses 35%.`);
        }
      } else {
        warnings.push('No stop loss set. Strategy §18 requires SL at OB edge.');
      }

      if (input.takeProfit && price > 0) {
        const tpDistance = Math.abs(input.takeProfit - price);
        const rewardAmount = tpDistance * input.quantity;
        estimatedRewardPercent =
          accountBalance > 0 ? (rewardAmount / accountBalance) * 100 : 0;

        if (estimatedRewardPercent < TARGET_REWARD_PERCENT * 0.8) {
          warnings.push(
            `TP ${estimatedRewardPercent.toFixed(1)}% profit is below 60% strategy target (§19).`
          );
        }
      } else {
        warnings.push('No take profit set. Strategy §19 targets 60% account profit.');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        estimatedMargin: marginRequired,
        estimatedRiskPercent,
        estimatedRiskAmount,
        estimatedRewardPercent,
      };
    },
    [portfolio, pairs, getAccountBalance, getAvailableMargin]
  );

  const placeOrder = useCallback(
    async (input: ExecutionInput) => {
      setLastError(null);
      setLastSuccess(null);

      const validation = validateExecution(input);
      if (!validation.isValid) {
        setLastError(validation.errors.join(' | '));
        return { success: false, error: validation.errors.join(' | ') };
      }

      setIsPlacing(true);
      try {
        const response = await apiClient.post('/execution/place', {
          symbol: input.symbol,
          side: input.side,
          orderType: input.orderType,
          size: input.quantity,
          price: input.orderType === 'limit' ? input.price : undefined,
          leverage: input.leverage,
          stopLossPrice: input.stopLoss,
          takeProfitPrice: input.takeProfit,
          clientOrderId: `MANUAL-${input.symbol}-${Date.now()}`,
        });

        setLastSuccess(`Order placed: ${response.data?.data?.clientOrderId || 'OK'}`);
        return { success: true, data: response.data };
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.response?.data?.error || err.message || 'Execution failed';
        setLastError(msg);
        return { success: false, error: msg };
      } finally {
        setIsPlacing(false);
      }
    },
    [validateExecution]
  );

  return {
    isPlacing,
    lastError,
    lastSuccess,
    validateExecution,
    placeOrder,
    accountBalance: getAccountBalance(),
    availableMargin: getAvailableMargin(),
    currentPrice: (Object.values(pairs || {}) as any[]).find((p: any) => p.symbol === activeSymbol)?.markPrice || 0,
    hasOpenPosition: (portfolio?.positions?.items?.length || 0) > 0,
  };
}
