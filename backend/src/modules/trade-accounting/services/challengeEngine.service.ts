import { ChallengeStateDto, ChallengeStatus, ResetChallengeInput } from '@algoapp/shared';
import { prisma } from '../../../db.js';
import { WalletEngineService } from './walletEngine.service.js';

const walletService = new WalletEngineService();

let memoryChallengeState: ChallengeStateDto = {
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
  /**
   * Retrieves current 20-Day institutional challenge evaluation state.
   */
  public async getChallengeState(): Promise<ChallengeStateDto> {
    try {
      if (prisma.challengeSession?.findUnique) {
        const dbState = await prisma.challengeSession.findUnique({
          where: { id: 'default-20day-challenge' },
        });
        if (dbState) {
          memoryChallengeState = {
            id: dbState.id,
            startDate: dbState.startDate.toISOString(),
            currentDay: dbState.currentDay,
            remainingDays: dbState.remainingDays,
            initialBalance: dbState.initialBalance,
            currentBalance: dbState.currentBalance,
            grossProfit: dbState.grossProfit,
            netProfit: dbState.netProfit,
            dailyTargetPercent: dbState.dailyTargetPercent,
            totalTargetPercent: dbState.totalTargetPercent,
            maxDailyDrawdownPercent: dbState.maxDailyDrawdownPercent,
            maxOverallDrawdownPercent: dbState.maxOverallDrawdownPercent,
            winningDays: dbState.winningDays,
            losingDays: dbState.losingDays,
            winStreak: dbState.winStreak,
            lossStreak: dbState.lossStreak,
            longestWinStreak: dbState.longestWinStreak,
            longestLossStreak: dbState.longestLossStreak,
            status: (dbState.status as ChallengeStatus) || 'RUNNING',
            updatedAt: dbState.updatedAt.toISOString(),
          };
        }
      }
    } catch {
      // Memory fallback active
    }

    return memoryChallengeState;
  }

  /**
   * Evaluates if a trade can be safely executed under challenge rules and risk parameters.
   */
  public async canExecuteTrade(
    marginRequired: number = 0,
    isKillSwitchActive: boolean = false
  ): Promise<SafetyCheckResult> {
    if (isKillSwitchActive) {
      return { allowed: false, reason: 'SAFETY_REJECTION: Emergency Kill Switch is ACTIVE.' };
    }

    const challenge = await this.getChallengeState();

    if (challenge.status === 'FAILED') {
      return { allowed: false, reason: 'SAFETY_REJECTION: Challenge has FAILED maximum drawdown limits.' };
    }

    if (challenge.status === 'EXPIRED') {
      return { allowed: false, reason: 'SAFETY_REJECTION: 20-Day Challenge timeframe has EXPIRED.' };
    }

    const wallet = await walletService.getWalletState();
    if (wallet.availableBalance < marginRequired) {
      return {
        allowed: false,
        reason: `SAFETY_REJECTION: Insufficient available margin ($${wallet.availableBalance.toFixed(2)} < $${marginRequired.toFixed(2)}).`,
      };
    }

    // Daily Drawdown Limit Check (5% of initial balance)
    const maxDailyLossAllowed = (challenge.maxDailyDrawdownPercent / 100) * challenge.initialBalance;
    if (wallet.dailyProfit < -maxDailyLossAllowed) {
      return {
        allowed: false,
        reason: `SAFETY_REJECTION: Maximum Daily Drawdown Limit (5.0% = -$${maxDailyLossAllowed.toFixed(2)}) breached today.`,
      };
    }

    // Overall Drawdown Limit Check (10% of initial balance)
    const maxOverallLossAllowed = (challenge.maxOverallDrawdownPercent / 100) * challenge.initialBalance;
    if (challenge.initialBalance - wallet.currentBalance > maxOverallLossAllowed) {
      return {
        allowed: false,
        reason: `SAFETY_REJECTION: Maximum Overall Drawdown Limit (10.0% = -$${maxOverallLossAllowed.toFixed(2)}) breached.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Records a completed trade result and updates streaks, drawdown, and pass/fail criteria.
   */
  public async recordTradeResult(netPnL: number, grossPnL: number): Promise<ChallengeStateDto> {
    const current = await this.getChallengeState();

    const currentBalance = Number((current.currentBalance + netPnL).toFixed(4));
    const grossProfit = Number((current.grossProfit + grossPnL).toFixed(4));
    const netProfit = Number((current.netProfit + netPnL).toFixed(4));

    let winStreak = current.winStreak;
    let lossStreak = current.lossStreak;
    let longestWinStreak = current.longestWinStreak;
    let longestLossStreak = current.longestLossStreak;
    let winningDays = current.winningDays;
    let losingDays = current.losingDays;

    if (netPnL > 0.0001) {
      winStreak += 1;
      lossStreak = 0;
      winningDays += 1;
      longestWinStreak = Math.max(longestWinStreak, winStreak);
    } else if (netPnL < -0.0001) {
      lossStreak += 1;
      winStreak = 0;
      losingDays += 1;
      longestLossStreak = Math.max(longestLossStreak, lossStreak);
    }

    let status: ChallengeStatus = current.status;

    // Check Profit Target (10% = $1.00 on $10.00 base)
    const profitTargetAmount = (current.totalTargetPercent / 100) * current.initialBalance;
    if (netProfit >= profitTargetAmount) {
      status = 'PASSED';
    }

    // Check Overall Drawdown Limit (10% = -$1.00 on $10.00 base)
    const maxOverallLossAllowed = (current.maxOverallDrawdownPercent / 100) * current.initialBalance;
    if (current.initialBalance - currentBalance >= maxOverallLossAllowed) {
      status = 'FAILED';
    }

    memoryChallengeState = {
      ...current,
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

    // Persist to Prisma
    try {
      if (prisma.challengeSession?.upsert) {
        await prisma.challengeSession.upsert({
          where: { id: 'default-20day-challenge' },
          create: {
            id: 'default-20day-challenge',
            startDate: new Date(current.startDate),
            currentDay: current.currentDay,
            remainingDays: current.remainingDays,
            initialBalance: current.initialBalance,
            currentBalance,
            grossProfit,
            netProfit,
            dailyTargetPercent: current.dailyTargetPercent,
            totalTargetPercent: current.totalTargetPercent,
            maxDailyDrawdownPercent: current.maxDailyDrawdownPercent,
            maxOverallDrawdownPercent: current.maxOverallDrawdownPercent,
            winningDays,
            losingDays,
            winStreak,
            lossStreak,
            longestWinStreak,
            longestLossStreak,
            status,
          },
          update: {
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
          },
        });
      }
    } catch {
      // Memory fallback active
    }

    return memoryChallengeState;
  }

  /**
   * Resets the 20-Day institutional challenge session.
   */
  public async resetChallenge(input: ResetChallengeInput = {}): Promise<ChallengeStateDto> {
    const initialBalance = input.initialBalance ?? 10.0;
    const totalTargetPercent = input.totalTargetPercent ?? 10.0;
    const maxDailyDrawdownPercent = input.maxDailyDrawdownPercent ?? 5.0;
    const maxOverallDrawdownPercent = input.maxOverallDrawdownPercent ?? 10.0;

    memoryChallengeState = {
      id: 'default-20day-challenge',
      startDate: new Date().toISOString(),
      currentDay: 1,
      remainingDays: input.minimumTradingDays ? input.minimumTradingDays * 4 : 20, // rough translation if minimum is tied to length, or we just keep 20 as max length. Let's default length to 20 or pass a parameter if we had one.
      initialBalance: initialBalance,
      currentBalance: initialBalance,
      grossProfit: 0.0,
      netProfit: 0.0,
      dailyTargetPercent: input.dailyTargetPercent ?? 0.5,
      totalTargetPercent: totalTargetPercent,
      maxDailyDrawdownPercent: maxDailyDrawdownPercent,
      maxOverallDrawdownPercent: maxOverallDrawdownPercent,
      winningDays: 0,
      losingDays: 0,
      winStreak: 0,
      lossStreak: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      status: 'RUNNING',
      updatedAt: new Date().toISOString(),
    };

    await walletService.resetWallet(initialBalance);

    try {
      if (prisma.challengeSession?.upsert) {
        await prisma.challengeSession.upsert({
          where: { id: 'default-20day-challenge' },
          create: {
            id: 'default-20day-challenge',
            startDate: new Date(),
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
          },
          update: {
            startDate: new Date(),
            currentDay: 1,
            remainingDays: 20,
            initialBalance: 10.0,
            currentBalance: 10.0,
            grossProfit: 0.0,
            netProfit: 0.0,
            winningDays: 0,
            losingDays: 0,
            winStreak: 0,
            lossStreak: 0,
            longestWinStreak: 0,
            longestLossStreak: 0,
            status: 'RUNNING',
          },
        });
      }
    } catch {
      // Memory fallback active
    }

    return memoryChallengeState;
  }
}
