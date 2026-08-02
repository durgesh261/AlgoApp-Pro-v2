import { PipelineTraceDto } from '@algoapp/shared';

let traceStore: PipelineTraceDto[] = [];

export class PipelineTraceService {
  public static async recordTrace(trace: PipelineTraceDto): Promise<PipelineTraceDto> {
    traceStore.unshift(trace);
    return trace;
  }

  public static async getTraces(limit: number = 50): Promise<PipelineTraceDto[]> {
    return traceStore.slice(0, limit);
  }

  public static async getTraceById(id: string): Promise<PipelineTraceDto | null> {
    return traceStore.find((t) => t.id === id || t.traceId === id) || null;
  }

  public static async clearTraces(): Promise<void> {
    traceStore = [];
  }
}
