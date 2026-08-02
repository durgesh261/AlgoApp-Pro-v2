import {
  ExecutionRequestDto,
  ExecutionResultDto,
  ExecutionMode,
  ExecutionStatus,
} from '@algoapp/shared';

import { IExecutionAdapter, AdapterValidationResult } from './executionAdapter.interface.js';

export class DeltaAdapter implements IExecutionAdapter {
  public readonly name = 'DELTA_ADAPTER';
  public readonly mode = ExecutionMode.LIVE;

  public async validate(_request: ExecutionRequestDto): Promise<AdapterValidationResult> {
    return { valid: false, reason: 'DELTA_LIVE_DISABLED: Delta Exchange live adapter is disabled in simulation mode.' };
  }

  public async submit(request: ExecutionRequestDto): Promise<ExecutionResultDto> {
    return {
      id: `RES-${Date.now()}`,
      requestId: request.id,
      sessionId: request.sessionId,
      adapter: this.name,
      status: ExecutionStatus.REJECTED,
      filledQuantity: 0,
      observability: {
        queueTimeMs: 1,
        validationLatencyMs: 1,
        adapterLatencyMs: 2,
        totalLifecycleTimeMs: 4,
      },
      message: 'Delta Live Exchange adapter is disabled in current simulation mode.',
      timestamp: new Date().toISOString(),
    };
  }

  public async modify(orderId: string, input: Partial<ExecutionRequestDto>): Promise<ExecutionResultDto> {
    return {
      id: `RES-${Date.now()}`,
      requestId: input.id || `REQ-MOD-${orderId}`,
      sessionId: input.sessionId || 'SESSION-DEFAULT',
      adapter: this.name,
      status: ExecutionStatus.REJECTED,
      filledQuantity: 0,
      observability: {
        queueTimeMs: 1,
        validationLatencyMs: 1,
        adapterLatencyMs: 2,
        totalLifecycleTimeMs: 4,
      },
      message: 'Delta Live Exchange adapter is disabled in current simulation mode.',
      timestamp: new Date().toISOString(),
    };
  }

  public async cancel(orderId: string): Promise<ExecutionResultDto> {
    return {
      id: `RES-${Date.now()}`,
      requestId: `REQ-CANCEL-${orderId}`,
      sessionId: 'SESSION-DEFAULT',
      adapter: this.name,
      status: ExecutionStatus.REJECTED,
      filledQuantity: 0,
      observability: {
        queueTimeMs: 1,
        validationLatencyMs: 1,
        adapterLatencyMs: 2,
        totalLifecycleTimeMs: 4,
      },
      message: 'Delta Live Exchange adapter is disabled in current simulation mode.',
      timestamp: new Date().toISOString(),
    };
  }

  public async closePosition(symbol: string, _exitPrice: number): Promise<ExecutionResultDto> {
    return {
      id: `RES-${Date.now()}`,
      requestId: `REQ-CLOSE-${symbol}`,
      sessionId: 'SESSION-DEFAULT',
      adapter: this.name,
      status: ExecutionStatus.REJECTED,
      filledQuantity: 0,
      observability: {
        queueTimeMs: 1,
        validationLatencyMs: 1,
        adapterLatencyMs: 2,
        totalLifecycleTimeMs: 4,
      },
      message: 'Delta Live Exchange adapter is disabled in current simulation mode.',
      timestamp: new Date().toISOString(),
    };
  }

  public async synchronize(): Promise<void> {
    return;
  }

  public async getExecutionStatus(_orderId: string): Promise<ExecutionStatus> {
    return ExecutionStatus.REJECTED;
  }
}
