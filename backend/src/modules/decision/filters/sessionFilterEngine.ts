import { DecisionReasonCode, SessionFilterResultDto } from '@algoapp/shared';

export interface SessionFilterOptions {
  allowedSessions?: Array<'ASIA' | 'LONDON' | 'NEW_YORK'> | undefined;
  allowWeekend?: boolean | undefined;
}

export class SessionFilterEngine {
  /**
   * Deterministically evaluates trading session from UTC timestamp.
   */
  public static evaluateSession(
    timestampIso?: string,
    options: SessionFilterOptions = {
      allowedSessions: ['ASIA', 'LONDON', 'NEW_YORK'],
      allowWeekend: true,
    }
  ): SessionFilterResultDto {
    const date = timestampIso ? new Date(timestampIso) : new Date();
    const utcHours = date.getUTCHours();
    const utcDay = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

    const isWeekend = utcDay === 0 || utcDay === 6;

    // Detect active market session
    let activeSession: 'ASIA' | 'LONDON' | 'NEW_YORK' | 'OFF_HOURS' = 'OFF_HOURS';

    if (utcHours >= 0 && utcHours < 8) {
      activeSession = 'ASIA';
    } else if (utcHours >= 8 && utcHours < 13) {
      activeSession = 'LONDON';
    } else if (utcHours >= 13 && utcHours < 21) {
      activeSession = 'NEW_YORK';
    }

    // Check weekend filter
    if (isWeekend && options.allowWeekend === false) {
      return {
        allowed: false,
        activeSession,
        isWeekend,
        reasonCode: DecisionReasonCode.WEEKEND_TRADING_BLOCKED,
      };
    }

    // Check session hours filter
    const allowedSessions = options.allowedSessions ?? ['ASIA', 'LONDON', 'NEW_YORK'];
    if (activeSession !== 'OFF_HOURS' && allowedSessions.includes(activeSession)) {
      return {
        allowed: true,
        activeSession,
        isWeekend,
      };
    }

    // If active session is OFF_HOURS and not in allowed sessions
    if (activeSession === 'OFF_HOURS' && allowedSessions.length < 3) {
      return {
        allowed: false,
        activeSession,
        isWeekend,
        reasonCode: DecisionReasonCode.SESSION_OUTSIDE_ALLOWED_HOURS,
      };
    }

    return {
      allowed: true,
      activeSession,
      isWeekend,
    };
  }
}
