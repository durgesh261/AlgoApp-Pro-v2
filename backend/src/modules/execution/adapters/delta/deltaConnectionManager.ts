import { DeltaConnectionState } from '@algoapp/shared';

export class DeltaConnectionManager {
  private state: DeltaConnectionState = DeltaConnectionState.DISCONNECTED;
  private reconnectCount = 0;

  public getState(): DeltaConnectionState {
    return this.state;
  }

  public getReconnectCount(): number {
    return this.reconnectCount;
  }

  public transitionTo(newState: DeltaConnectionState): void {
    if (newState === DeltaConnectionState.RECONNECTING) {
      this.reconnectCount += 1;
    }
    this.state = newState;
  }

  public reset(): void {
    this.state = DeltaConnectionState.DISCONNECTED;
    this.reconnectCount = 0;
  }
}
