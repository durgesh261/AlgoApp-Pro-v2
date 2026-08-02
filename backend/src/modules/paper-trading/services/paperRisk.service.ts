import { PaperRiskConfigDto, UpdatePaperRiskConfigInput } from '@algoapp/shared';
import { PaperWalletService } from './paperWallet.service.js';

let currentRiskConfig: PaperRiskConfigDto = {
  id: 'default-paper-risk',
  maxDailyLoss: 1000.0,
  maxDrawdownPercent: 5.0,
  maxOpenPositions: 10,
  maxRiskPerTradePercent: 2.0,
  isEmergencyStopActive: false,
  updatedAt: new Date().toISOString(),
};

export interface RiskCheckResult {
  passed: boolean;
  reason?: string;
}

export class PaperRiskService {
  public static async getRiskConfig(): Promise<PaperRiskConfigDto> {
    return currentRiskConfig;
  }

  public static async updateRiskConfig(input: UpdatePaperRiskConfigInput): Promise<PaperRiskConfigDto> {
    currentRiskConfig = {
      id: currentRiskConfig.id,
      maxDailyLoss: input.maxDailyLoss ?? currentRiskConfig.maxDailyLoss,
      maxDrawdownPercent: input.maxDrawdownPercent ?? currentRiskConfig.maxDrawdownPercent,
      maxOpenPositions: input.maxOpenPositions ?? currentRiskConfig.maxOpenPositions,
      maxRiskPerTradePercent: input.maxRiskPerTradePercent ?? currentRiskConfig.maxRiskPerTradePercent,
      isEmergencyStopActive: input.isEmergencyStopActive ?? currentRiskConfig.isEmergencyStopActive,
      updatedAt: new Date().toISOString(),
    };
    return currentRiskConfig;
  }

  public static async validateOrderRisk(
    _symbol: string,
    orderNotional: number,
    openPositionsCount: number
  ): Promise<RiskCheckResult> {
    if (currentRiskConfig.isEmergencyStopActive) {
      return { passed: false, reason: 'EMERGENCY_STOP_ACTIVE: Order rejected due to active emergency stop.' };
    }

    if (openPositionsCount >= currentRiskConfig.maxOpenPositions) {
      return {
        passed: false,
        reason: `MAX_OPEN_POSITIONS_EXCEEDED: Maximum position limit (${currentRiskConfig.maxOpenPositions}) reached.`,
      };
    }

    const wallet = await PaperWalletService.getWallet();
    const maxRiskNotional = (wallet.equity * currentRiskConfig.maxRiskPerTradePercent) / 100;

    if (orderNotional > maxRiskNotional * 10) {
      return {
        passed: false,
        reason: `MAX_RISK_PER_TRADE_EXCEEDED: Order value exceeds risk policy limit (${currentRiskConfig.maxRiskPerTradePercent}% of equity).`,
      };
    }

    return { passed: true };
  }
}
