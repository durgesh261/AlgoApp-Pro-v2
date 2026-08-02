import { DeltaStateReconciliationDto } from '@algoapp/shared';
import { PaperOrderService } from '../../../paper-trading/services/paperOrder.service.js';
import { PaperPositionService } from '../../../paper-trading/services/paperPosition.service.js';

export class DeltaStateReconciler {
  public static async reconcileState(): Promise<DeltaStateReconciliationDto> {
    const localOrders = await PaperOrderService.getOrders();
    const localPositions = await PaperPositionService.getOpenPositions();

    // Remote sandbox state simulation
    const remoteOrdersCount = localOrders.length;
    const remotePositionsCount = localPositions.length;

    const mismatches: Array<{ id: string; type: string; details: string }> = [];

    const isMatched = mismatches.length === 0;

    return {
      matched: isMatched,
      localOrdersCount: localOrders.length,
      remoteOrdersCount,
      localPositionsCount: localPositions.length,
      remotePositionsCount,
      mismatches,
      timestamp: new Date().toISOString(),
    };
  }
}
