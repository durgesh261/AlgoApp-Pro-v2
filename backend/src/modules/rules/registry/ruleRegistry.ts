import { RuleMetadataDto } from '@algoapp/shared';

export class RuleRegistry {
  public static getAllRuleMetadata(): RuleMetadataDto[] {
    return [
      {
        ruleId: 'MARKET_TIMEFRAME_1H',
        name: 'Strict 1H Timeframe Filter',
        description: 'Enforces evaluation exclusively on the 1-Hour timeframe.',
        purpose: 'Prevents noise from lower timeframes and maintains strategy alignment.',
        currentValue: '1H',
      },
      {
        ruleId: 'MARKET_PAIR_ALLOWLIST',
        name: 'Perpetual Pairs Allowlist',
        description: 'Restricts strategy engine to BTCUSD.P, ETHUSD.P, SOLUSD.P, XRPUSD.P.',
        purpose: 'Limits trading to high-liquidity perpetual markets.',
        currentValue: 'BTCUSD.P, ETHUSD.P, SOLUSD.P, XRPUSD.P',
      },
      {
        ruleId: 'ZONE_FIRST_TOUCH_BONUS',
        name: 'First Touch Confluence Bonus',
        description: 'Adds +20 confidence score when price enters a zone for the first time.',
        purpose: 'Rewards highest-probability structural entry points.',
        currentValue: '+20 Score',
      },
      {
        ruleId: 'OPPOSING_ZONE_PENALTY',
        name: 'Opposing Zone Block Penalty',
        description: 'Applies -20 score penalty or blocks trade if an opposing zone is within range.',
        purpose: 'Protects trades from running into immediate counter-trend liquidity.',
        currentValue: '-20 Score',
      },
      {
        ruleId: 'EXECUTE_CONFIDENCE_THRESHOLD',
        name: 'Minimum Execution Confidence Threshold',
        description: 'Requires at least 80.0% confidence score for EXECUTE state emission.',
        purpose: 'Ensures only high-conviction trade setups pass the decision pipeline.',
        currentValue: '80.0%',
      },
    ];
  }
}
