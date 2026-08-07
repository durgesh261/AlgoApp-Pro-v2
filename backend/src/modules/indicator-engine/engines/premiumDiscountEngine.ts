import { CandleDto, PremiumDiscountZonesDto } from '@algoapp/shared';

export class PremiumDiscountEngine {
  /**
   * Deterministically calculates LuxAlgo SMC Trailing Extremes and Premium/Discount Zones
   * 
   * Exact Pine Script specification:
   *   trailing.top = max(high)
   *   trailing.bottom = min(low)
   *   equilibrium = avg(trailing.top, trailing.bottom)
   *   Premium Zone: [0.95 * top + 0.05 * bottom, top]
   *   Equilibrium Zone: [0.525 * bottom + 0.475 * top, 0.525 * top + 0.475 * bottom]
   *   Discount Zone: [bottom, 0.95 * bottom + 0.05 * top]
   */
  public static calculateZones(candles: CandleDto[]): PremiumDiscountZonesDto {
    if (!candles || candles.length === 0) {
      return {
        trailingTop: 0,
        trailingBottom: 0,
        equilibrium: 0,
        premiumZone: { top: 0, bottom: 0 },
        equilibriumZone: { top: 0, bottom: 0 },
        discountZone: { top: 0, bottom: 0 },
        currentPrice: 0,
        currentZone: 'EQUILIBRIUM',
      };
    }

    let trailingTop = -Infinity;
    let trailingBottom = Infinity;

    for (const candle of candles) {
      if (candle.high > trailingTop) trailingTop = candle.high;
      if (candle.low < trailingBottom) trailingBottom = candle.low;
    }

    const currentPrice = candles[candles.length - 1]!.close;
    const equilibrium = (trailingTop + trailingBottom) / 2;

    const premiumTop = trailingTop;
    const premiumBottom = 0.95 * trailingTop + 0.05 * trailingBottom;

    const eqTop = 0.525 * trailingTop + 0.475 * trailingBottom;
    const eqBottom = 0.525 * trailingBottom + 0.475 * trailingTop;

    const discountTop = 0.95 * trailingBottom + 0.05 * trailingTop;
    const discountBottom = trailingBottom;

    let currentZone: 'PREMIUM' | 'EQUILIBRIUM' | 'DISCOUNT' = 'EQUILIBRIUM';
    if (currentPrice >= premiumBottom) {
      currentZone = 'PREMIUM';
    } else if (currentPrice <= discountTop) {
      currentZone = 'DISCOUNT';
    } else {
      currentZone = 'EQUILIBRIUM';
    }

    return {
      trailingTop: Number(trailingTop.toFixed(4)),
      trailingBottom: Number(trailingBottom.toFixed(4)),
      equilibrium: Number(equilibrium.toFixed(4)),
      premiumZone: {
        top: Number(premiumTop.toFixed(4)),
        bottom: Number(premiumBottom.toFixed(4)),
      },
      equilibriumZone: {
        top: Number(eqTop.toFixed(4)),
        bottom: Number(eqBottom.toFixed(4)),
      },
      discountZone: {
        top: Number(discountTop.toFixed(4)),
        bottom: Number(discountBottom.toFixed(4)),
      },
      currentPrice: Number(currentPrice.toFixed(4)),
      currentZone,
    };
  }
}
