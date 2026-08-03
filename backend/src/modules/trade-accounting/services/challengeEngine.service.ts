import { ChallengeStateDto, ChallengeStatus } from '@algoapp/shared';
import { WalletEngineService } from './walletEngine.service.js';

const walletService = new WalletEngineService();

let challengeState: ChallengeStateDto = {
  id: 'default-20day-challenge',
  startDate: new Date().toISOString(),
  currentDay: 1,
  remainingDays: 20,
  initialBalance: 10.0,
  currentBalance: 10.0,
  grossProfit: 0.0,
  netProfit: 0.0,
  dailyTargetPercent: 0.5,
  totalTargetPercent: 10.0,
  maxDailyDrawdownPercent: 5.0,
  maxOverallDrawdownPercent: 10.0,
  winningDays: 0,
  losingDays: 0,
  winStreak: 0,
  lossStreak: 0,
  longestWinStreak: 0,
  longestLossStreak: 0,
  status: 'RUNNING',
  updatedAt: new Date().toISOString(),
};

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
}

export class ChallengeEngineService {
  public async getChallengeState(): Promise<ChallengeStateDto> {
    return challengeState;
  }

  public async canExecuteTrade(marginRequired: number = 0, isKillSwitchActive: boolean = false): Promise<SafetyCheckResult> {
    if (isKillSwitchActive) {
      return { allowed: false, reason: 'SAFETY_REJECTION: Emergency Kill Switch is ACTIVE.' };
    }

    if (challengeState.status === 'FAILED') {
      return { allowed: false, reason: 'SAFETY_REJECTION: Challenge has FAILED drawdown limits.' };
    }

    if (challengeState.status === 'EXPIRED') {
      return { allowed: false, reason: 'SAFETY_REJECTION: 20-Day Challenge timeframe has EXPIRED.' };
    }

    const wallet = await walletService.getWalletState();
    if (wallet.availableBalance < marginRequired) {
      return { allowed: false, reason: `SAFETY_REJECTION: Insufficient available balance ($${wallet.availableBalance} < $${marginRequired}).` };
    }

    // Daily Drawdown Limit Check (5% = $2,500)
    const maxDailyLossAllowed = (challengeState.maxDailyDrawdownPercent / 100) * challengeState.initialBalance;
    if (wallet.dailyProfit < -maxDailyLossAllowed) {
      return { allowed: false, reason: `SAFETY_REJECTION: Maximum Daily Drawdown Limit (5.0% = $${maxDailyLossAllowed}) exceeded.` };
    }

    // Overall Drawdown Limit Check (10% = $5,000)
    const maxOverallLossAllowed = (challengeState.maxOverallDrawdownPercent / 100) * challengeState.initialBalance;
    if (challengeState.initialBalance - wallet.currentBalance > maxOverallLossAllowed) {
      return { allowed: false, reason: `SAFETY_REJECTION: Maximum Overall Drawdown Limit (10.0% = $${maxOverallLossAllowed}) exceeded.` };
    }

    return { allowed: true };
  }

  public async recordTradeResult(netPnL: number, grossPnL: number): Promise<ChallengeStateDto> {
    const currentBalance = Number((challengeState.currentBalance + netPnL).toFixed(2));
    const grossProfit = Number((challengeState.grossProfit + grossPnL).toFixed(2));
    const netProfit = Number((challengeState.netProfit + netPnL).toFixed(2));

    let winStreak = challengeState.winStreak;
    let lossStreak = challengeState.lossStreak;
    let longestWinStreak = challengeState.longestWinStreak;
    let longestLossStreak = challengeState.longestLossStreak;
    let winningDays = challengeState.winningDays;
    let losingDays = challengeState.losingDays;

    if (netPnL > 0) {
      winStreak += 1;
      lossStreak = 0;
      winningDays += 1;
      longestWinStreak = Math.max(longestWinStreak, winStreak);
    } else if (netPnL < 0) {
      lossStreak += 1;
      winStreak = 0;
      losingDays += 1;
      longestLossStreak = Math.max(longestLossStreak, lossStreak);
    }

    let status: ChallengeStatus = challengeState.status;

    // Check Profit Target (10% = $5,000 profit)
    const profitTargetAmount = (challengeState.totalTargetPercent / 100) * challengeState.initialBalance;
    if (netProfit >= profitTargetAmount) {
      status = 'PASSED';
    }

    // Check Overall Drawdown Limit (10% = $5,000 loss)
    const maxOverallLossAllowed = (challengeState.maxOverallDrawdownPercent / 100) * challengeState.initialBalance;
    if (challengeState.initialBalance - currentBalance >= maxOverallLossAllowed) {
      status = 'FAILED';
    }

    challengeState = {
      ...challengeState,
      currentBalance,
      grossProfit,
      netProfit,
      winningDays,
      losingDays,
      winStreak,
      lossStreak,
      longestWinStreak,
      longestLossStreak,
      status,
      updatedAt: new Date().toISOString(),
    };

    return challengeState;
  }

  public async resetChallenge(): Promise<ChallengeStateDto> {
    challengeState = {
      id: 'default-20day-challenge',
      startDate: new Date().toISOString(),
      currentDay: 1,
      remainingDays: 20,
      initialBalance: 10.0,
      currentBalance: 10.0,
      grossProfit: 0.0,
      netProfit: 0.0,
      dailyTargetPercent: 0.5,
      totalTargetPercent: 10.0,
      maxDailyDrawdownPercent: 5.0,
      maxOverallDrawdownPercent: 10.0,
      winningDays: 0,
      losingDays: 0,
      winStreak: 0,
      lossStreak: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      status: 'RUNNING',
      updatedAt: new Date().toISOString(),
    };

    await walletService.resetWallet(10.0);
    return challengeState;
  }
}
