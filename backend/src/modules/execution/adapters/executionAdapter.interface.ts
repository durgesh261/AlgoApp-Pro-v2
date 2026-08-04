import { ExecutionRequestDto, ExecutionResultDto, ExecutionMode, ExecutionStatus } from '@algoapp/shared';

export interface AdapterValidationResult {
  valid: boolean;
  reason?: string;
}

export interface IExecutionAdapter {
  readonly name: string;
  readonly mode: ExecutionMode;
  validate(request: ExecutionRequestDto): Promise<AdapterValidationResult>;
  submit(request: ExecutionRequestDto): Promise<ExecutionResultDto>;
  modify(orderId: string, input: Partial<ExecutionRequestDto>): Promise<ExecutionResultDto>;
  cancel(orderId: string): Promise<ExecutionResultDto>;
  closePosition(symbol: string, exitPrice: number): Promise<ExecutionResultDto>;
  synchronize(): Promise<void>;
  getExecutionStatus(orderId: string): Promise<ExecutionStatus>;
}
