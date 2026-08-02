import { ExecutionStatus } from '@algoapp/shared';

export class ExecutionStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<ExecutionStatus, Set<ExecutionStatus>> = {
    [ExecutionStatus.QUEUED]: new Set([ExecutionStatus.VALIDATED, ExecutionStatus.REJECTED, ExecutionStatus.FAILED]),
    [ExecutionStatus.VALIDATED]: new Set([ExecutionStatus.SUBMITTED, ExecutionStatus.REJECTED, ExecutionStatus.FAILED]),
    [ExecutionStatus.SUBMITTED]: new Set([
      ExecutionStatus.PARTIALLY_FILLED,
      ExecutionStatus.FILLED,
      ExecutionStatus.CANCELLED,
      ExecutionStatus.REJECTED,
      ExecutionStatus.FAILED,
    ]),
    [ExecutionStatus.PARTIALLY_FILLED]: new Set([
      ExecutionStatus.FILLED,
      ExecutionStatus.CANCELLED,
      ExecutionStatus.FAILED,
    ]),
    [ExecutionStatus.FILLED]: new Set([]),
    [ExecutionStatus.CANCELLED]: new Set([]),
    [ExecutionStatus.REJECTED]: new Set([]),
    [ExecutionStatus.FAILED]: new Set([]),
  };

  public static isValidTransition(from: ExecutionStatus, to: ExecutionStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[from];
    return allowed ? allowed.has(to) : false;
  }

  public static validateTransition(from: ExecutionStatus, to: ExecutionStatus): void {
    if (!this.isValidTransition(from, to)) {
      throw new Error(`INVALID_STATE_TRANSITION: Cannot transition execution state from '${from}' to '${to}'.`);
    }
  }
}
