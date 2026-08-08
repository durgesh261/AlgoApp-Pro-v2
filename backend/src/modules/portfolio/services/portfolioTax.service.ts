// backend/src/modules/portfolio/services/portfolioTax.service.ts

/**
 * Delta Exchange India Tax & Fee Calculator
 * 
 * CRITICAL: Crypto futures/perpetuals on Delta Exchange India are INR-settled
 * derivatives. They are NOT Virtual Digital Assets (VDAs).
 * 
 * Tax Treatment:
 * - Spot Crypto (VDA): Section 115BBH — 30% flat + 1% TDS
 * - Crypto Futures (Delta India): Section 43(5) — Speculative Business Income,
 *   taxed at slab rates, expenses deductible, losses set-off allowed
 */

export interface FeeBreakdown {
  makerFee: number;      // 0.02%
  takerFee: number;      // 0.05%
  gstOnFees: number;     // 18% of fee amount
  liquidationFee: number; // 0.5%
  totalEstimated: number;
}

export interface TaxEstimate {
  classification: 'SPECULATIVE_BUSINESS';
  section: '43(5)';
  applicableTaxRate: 'SLAB_RATE'; // NOT 30% flat
  vdaTaxApplies: false;
  tdsApplies: false;
  taxableProfit: number;
  deductibleExpenses: number;
  carryForwardLosses: boolean;
  maxCarryForwardYears: 4;
  itrForm: 'ITR-3';
  schedule: 'Schedule P&L → Speculative Business';
}

export class PortfolioTaxService {
  private static readonly FUTURES_MAKER = 0.0002;  // 0.02%
  private static readonly FUTURES_TAKER = 0.0005; // 0.05%
  private static readonly GST_RATE = 0.18;          // 18% on fees
  private static readonly LIQUIDATION_FEE = 0.005;  // 0.5%

  /**
   * Calculate trading fees for a given notional value
   */
  static calculateFees(
    notionalValue: number, 
    isMaker: boolean, 
    isLiquidated: boolean = false
  ): FeeBreakdown {
    const baseFeeRate = isMaker ? this.FUTURES_MAKER : this.FUTURES_TAKER;
    const baseFee = notionalValue * baseFeeRate;
    const gst = baseFee * this.GST_RATE;
    const liquidationFee = isLiquidated ? notionalValue * this.LIQUIDATION_FEE : 0;

    return {
      makerFee: isMaker ? baseFee : 0,
      takerFee: isMaker ? 0 : baseFee,
      gstOnFees: gst,
      liquidationFee,
      totalEstimated: baseFee + gst + liquidationFee,
    };
  }

  /**
   * Get tax classification for crypto futures
   * Returns the CORRECT classification — NOT VDA
   */
  static getTaxClassification(realizedPnL: number = 0): TaxEstimate {
    const expenses = 0; // Would be calculated from actual trading expenses
    
    return {
      classification: 'SPECULATIVE_BUSINESS',
      section: '43(5)',
      applicableTaxRate: 'SLAB_RATE',
      vdaTaxApplies: false,
      tdsApplies: false,
      taxableProfit: realizedPnL,
      deductibleExpenses: expenses,
      carryForwardLosses: true,
      maxCarryForwardYears: 4,
      itrForm: 'ITR-3',
      schedule: 'Schedule P&L → Speculative Business',
    };
  }

  /**
   * Validate that NO VDA tax is being applied to futures
   * Use this as a guard in your PnL calculation pipeline
   */
  static validateNoVdaTax(taxApplied: number, pnl: number): void {
    const vdaTaxAmount = pnl > 0 ? pnl * 0.30 : 0;
    if (Math.abs(taxApplied - vdaTaxAmount) < 1) {
      throw new Error(
        'CRITICAL: 30% VDA tax was incorrectly applied to futures PnL. ' +
        'Futures are speculative business income, not VDAs. ' +
        'Remove Section 115BBH tax logic from futures pipeline.'
      );
    }
  }
}
