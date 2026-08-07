import { OrderBlockDto } from '@algoapp/shared';

// ============================================================================
// Order Block Merge Engine — Q2
//
// Merges overlapping Order Blocks from two independent sources:
//   - LuxAlgo SMC engine  (source = 'SMC')
//   - UAlgo PAT engine    (source = 'PAT')
//
// Rules:
//   1. Only merge OBs of the same direction (both BULLISH or both BEARISH).
//   2. Two OBs overlap when their price ranges intersect:
//        overlap = max(lower1, lower2) < min(upper1, upper2)
//   3. Merged OB:
//        upper = max(upper1, upper2)
//        lower = min(lower1, lower2)
//        source = 'SMC'  (SMC takes precedence; PAT reinforces)
//        isMitigated = either is mitigated
//        touchCount  = sum of both
//   4. Non-overlapping OBs are kept individually under their original source.
//   5. Greedy O(n²) merge is sufficient for the expected OB count per symbol.
//
// The merged list is the sole input to the AI Decision Engine.
// Individual (pre-merge) OBs are preserved in the analytics debug payload.
// ============================================================================

export interface OrderBlockWithMeta extends OrderBlockDto {
  /** Original source before merging — 'PAT', 'SMC', or 'MERGED' */
  mergeSource: 'PAT' | 'SMC' | 'MERGED';
  /** IDs of OBs that were merged to produce this record (empty if not merged) */
  mergedFromIds: string[];
}

export class OrderBlockMergeEngine {

  // ============================================================
  // Main entry point
  // ============================================================
  public static merge(
    smcBlocks: OrderBlockDto[], // from SmcLegEngine (LuxAlgo)
    patBlocks: OrderBlockDto[]  // from PatLegEngine  (UAlgo)
  ): {
    merged:    OrderBlockWithMeta[]; // unified list for AI decisions
    analytics: OrderBlockWithMeta[]; // full detail list for debugging
  } {
    // Tag each block with its origin before merging
    const tagged: OrderBlockWithMeta[] = [
      ...smcBlocks.map(ob => ({ ...ob, mergeSource: 'SMC' as const, mergedFromIds: [] })),
      ...patBlocks.map(ob => ({ ...ob, mergeSource: 'PAT' as const, mergedFromIds: [] })),
    ];

    // Build analytics list (all individual OBs before any merging)
    const analytics: OrderBlockWithMeta[] = tagged.map(ob => ({ ...ob }));

    // Merge by direction independently
    const bullishTagged = tagged.filter(ob => ob.type === 'BULLISH');
    const bearishTagged = tagged.filter(ob => ob.type === 'BEARISH');

    const mergedBullish = this.mergeGroup(bullishTagged);
    const mergedBearish = this.mergeGroup(bearishTagged);

    const merged = [...mergedBullish, ...mergedBearish]
      .sort((a, b) => a.breakCandleIndex - b.breakCandleIndex);

    return { merged, analytics };
  }

  // ============================================================
  // Greedy overlap merge for a single-direction group
  // ============================================================
  private static mergeGroup(blocks: OrderBlockWithMeta[]): OrderBlockWithMeta[] {
    if (blocks.length === 0) return [];

    // Sort by lowerPrice ascending for stable merge
    const sorted = [...blocks].sort((a, b) => a.lowerPrice - b.lowerPrice);

    const result: OrderBlockWithMeta[] = [];
    let current: OrderBlockWithMeta = { ...sorted[0]!, mergedFromIds: [] };

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i]!;

      // Overlap condition: ranges intersect
      const overlapLow  = Math.max(current.lowerPrice, next.lowerPrice);
      const overlapHigh = Math.min(current.upperPrice, next.upperPrice);

      if (overlapLow < overlapHigh) {
        // Merge: expand range to cover both OBs
        const mergedFromIds = [
          ...current.mergedFromIds,
          ...(current.mergedFromIds.length === 0 ? [current.id] : []),
          next.id,
        ];
        current = {
          ...current,
          id:           `OB-MERGED-${current.type}-${current.baseCandleIndex}-${next.baseCandleIndex}`,
          upperPrice:   Math.max(current.upperPrice, next.upperPrice),
          lowerPrice:   Math.min(current.lowerPrice, next.lowerPrice),
          isMitigated:  current.isMitigated || next.isMitigated,
          touchCount:   current.touchCount + next.touchCount,
          // Recalculate width
          widthPercent: Number(
            (
              (Math.max(current.upperPrice, next.upperPrice) - Math.min(current.lowerPrice, next.lowerPrice)) /
              Math.max(current.upperPrice, next.upperPrice) * 100
            ).toFixed(4)
          ),
          // SMC source takes precedence; mark as MERGED for analytics
          source:       'SMC',
          mergeSource:  'MERGED',
          mergedFromIds,
          // Use earlier formation time
          createdAt:    current.baseCandleIndex <= next.baseCandleIndex ? current.createdAt : next.createdAt,
          // Recalculate entry price using the merged zone width
          entryPrice:   this.calcEntryPrice(
            current.type,
            Math.max(current.upperPrice, next.upperPrice),
            Math.min(current.lowerPrice, next.lowerPrice)
          ),
        };
      } else {
        result.push(current);
        current = { ...next, mergedFromIds: [] };
      }
    }
    result.push(current);

    return result;
  }

  // ============================================================
  // Recalculate entry price after merge using the same OB width rule:
  //   width% = ((upper - lower) / upper) * 100
  //   if width% <= 0.6% → enter at first edge
  //   if width% >  0.6% → enter 25% inside
  // ============================================================
  private static calcEntryPrice(
    type:  'BULLISH' | 'BEARISH',
    upper: number,
    lower: number
  ): number {
    const rawWidth = Math.max(0.0001, upper - lower);
    const widthPct = (rawWidth / Math.max(0.0001, upper)) * 100;

    if (type === 'BULLISH') {
      // Bullish OB: price approaches from above -> first edge = upperPrice
      // If width <= 0.6% -> enter at edge (upperPrice)
      // If width > 0.6% -> enter 25% inside from top: upperPrice - 0.25 * rawWidth
      // Example: Upper=100, Lower=99, Width=1% -> Entry = 99.75, SL = 99
      if (widthPct <= 0.6) return Number(upper.toFixed(4));
      return Number((upper - 0.25 * rawWidth).toFixed(4));
    } else {
      // Bearish OB: price approaches from below -> first edge = lowerPrice
      // If width <= 0.6% -> enter at edge (lowerPrice)
      // If width > 0.6% -> enter 25% inside from bottom: lowerPrice + 0.25 * rawWidth
      // Example: Upper=100, Lower=99, Width=1% -> Entry = 99.25, SL = 100
      if (widthPct <= 0.6) return Number(lower.toFixed(4));
      return Number((lower + 0.25 * rawWidth).toFixed(4));
    }
  }
}
