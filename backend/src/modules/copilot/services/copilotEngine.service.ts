import { prisma } from '../../../db.js';
import { deltaSyncService } from '../../delta-exchange/index.js';
import { MarketScannerService } from '../../live-trading/services/MarketScannerService.js';
import { candleEngine } from '../../../engine/CandleEngine.js';
import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';
import { ZoneDetectorService } from '../../strategy/services/zoneDetector.service.js';

export interface CopilotContext {
  currentPrice: number;
  activeSymbol: string;
  trend: string;
  openPosition: any | null;
  recentTrades: any[];
  activeZones: any[];
  scannerState: string;
  balance: number;
  unrealizedPnL: number;
  latestDecision: any | null;
  marketStructure: any;
}

export interface CopilotMessage {
  role: 'user' | 'copilot';
  content: string;
  timestamp: string;
  metadata?: any;
}

/**
 * Trade Copilot Engine
 * 
 * Provides natural-language answers grounded in REAL backend data:
 * - Current market structure (BOS/CHoCH, trend, zones)
 * - Open positions & PnL
 * - Recent trade history & performance
 * - Scanner decisions (why APPROVED / why REJECTED)
 * - Strategy rule references (§)
 */
export class CopilotEngineService {
  private static conversationHistory = new Map<string, CopilotMessage[]>();
  private static readonly MAX_HISTORY = 20;

  public static async processQuery(
    userId: string,
    query: string,
    activeSymbol: string
  ): Promise<CopilotMessage> {
    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();

    // Build live context
    const context = await this.buildContext(activeSymbol);

    // Classify intent and generate response
    let response: string;

    if (this.isGreeting(normalizedQuery)) {
      response = this.greeting(context);
    } else if (this.isMarketStructureQuery(normalizedQuery)) {
      response = this.explainMarketStructure(context);
    } else if (this.isTradeQuery(normalizedQuery)) {
      response = await this.explainTrades(context, normalizedQuery);
    } else if (this.isStrategyQuery(normalizedQuery)) {
      response = this.explainStrategy(context, normalizedQuery);
    } else if (this.isPositionQuery(normalizedQuery)) {
      response = this.explainPosition(context);
    } else if (this.isZoneQuery(normalizedQuery)) {
      response = this.explainZones(context);
    } else if (this.isScannerQuery(normalizedQuery)) {
      response = this.explainScanner(context);
    } else if (this.isRiskQuery(normalizedQuery)) {
      response = this.explainRisk(context);
    } else {
      response = this.generalAssistance(context, query);
    }

    // Store conversation
    const userMsg: CopilotMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    const copilotMsg: CopilotMessage = {
      role: 'copilot',
      content: response,
      timestamp: new Date().toISOString(),
      metadata: { latencyMs: Date.now() - startTime, contextSnapshot: context },
    };

    const history = this.conversationHistory.get(userId) || [];
    history.push(userMsg, copilotMsg);
    if (history.length > this.MAX_HISTORY * 2) {
      history.splice(0, 2);
    }
    this.conversationHistory.set(userId, history);

    return copilotMsg;
  }

  public static getHistory(userId: string): CopilotMessage[] {
    return this.conversationHistory.get(userId) || [];
  }

  public static clearHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  // ─── Context Builder ───

  private static async buildContext(symbol: string): Promise<CopilotContext> {
    const balances = deltaSyncService.getBalances();
    const positions = deltaSyncService.getPositions();
    const usdt = balances.find(b => b.asset_symbol === 'USDT' || b.asset_symbol === 'USD');
    const balance = usdt ? parseFloat(usdt.balance || '0') : 0;

    const candles = candleEngine.get1HCandles(symbol);
    const indicators = candles.length > 10 
      ? IndicatorEngineService.computeIndicators(candles, '1H', symbol)
      : null;

    const zones = await ZoneDetectorService.detectZones(symbol);
    const activeZones = zones.filter(z => z.status === 'FRESH' || z.status === 'TOUCHED');

    const recentTrades = await prisma.tradeLedger.findMany({
      where: { symbol },
      orderBy: { executedAt: 'desc' },
      take: 5,
    });

    const latestDecision = await prisma.decisionLog.findFirst({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
    });

    const openPosition = positions.find(p => 
      (p.product_symbol || '').toUpperCase() === symbol.toUpperCase()
    ) || null;

    const unrealizedPnL = openPosition 
      ? parseFloat(openPosition.unrealized_pnl || '0') 
      : 0;

    return {
      currentPrice: candles[candles.length - 1]?.close || 0,
      activeSymbol: symbol,
      trend: indicators?.marketStructure?.trend || 'UNKNOWN',
      openPosition,
      recentTrades,
      activeZones,
      scannerState: MarketScannerService.getState?.() || 'UNKNOWN',
      balance,
      unrealizedPnL,
      latestDecision,
      marketStructure: indicators?.marketStructure || null,
    };
  }

  // ─── Intent Classifiers ───

  private static isGreeting(q: string): boolean {
    return /^(hi|hello|hey|good morning|good evening|what's up|sup|yo)\b/.test(q);
  }

  private static isMarketStructureQuery(q: string): boolean {
    return /\b(market structure|trend|bos|choch|bullish|bearish|structure|direction)\b/.test(q);
  }

  private static isTradeQuery(q: string): boolean {
    return /\b(trade|trading|why did we|last trade|previous trade|entry|exit|pnl|profit|loss|result)\b/.test(q);
  }

  private static isStrategyQuery(q: string): boolean {
    return /\b(strategy|rule|risk|leverage|35%|60%|1h|order block|should i|recommend|advice)\b/.test(q);
  }

  private static isPositionQuery(q: string): boolean {
    return /\b(position|open trade|current trade|margin|exposure|unrealized|floating)\b/.test(q);
  }

  private static isZoneQuery(q: string): boolean {
    return /\b(zone|order block|ob|supply|demand|fresh|mitigated|touch)\b/.test(q);
  }

  private static isScannerQuery(q: string): boolean {
    return /\b(scanner|scanning|signal|confidence|ai score|approved|rejected|why was)\b/.test(q);
  }

  private static isRiskQuery(q: string): boolean {
    return /\b(risk|margin|leverage|stop loss|take profit|sl|tp|sizing|35%|100x)\b/.test(q);
  }

  // ─── Response Generators ───

  private static greeting(ctx: CopilotContext): string {
    const hasPosition = ctx.openPosition ? 'with an active position' : 'flat';
    return `Hey! QuantEdge Copilot here. You're currently ${hasPosition} on ${ctx.activeSymbol} at $${ctx.currentPrice.toLocaleString()}. The scanner is ${ctx.scannerState.toLowerCase()}. Ask me about market structure, your last trade, or why the AI made a specific decision.`;
  }

  private static explainMarketStructure(ctx: CopilotContext): string {
    if (!ctx.marketStructure) {
      return `I don't have enough 1H candle data for ${ctx.activeSymbol} yet. The indicator engine needs at least 20 candles to detect structure.`;
    }

    const { trend, lastBOS, lastCHoCH } = ctx.marketStructure;
    let response = `**${ctx.activeSymbol} Market Structure (1H)**\n\n`;
    response += `Overall Trend: **${trend}**\n`;
    response += `Current Price: **$${ctx.currentPrice.toLocaleString()}**\n\n`;

    if (lastBOS) {
      response += `• Last BOS (Break of Structure): ${lastBOS.direction} at $${lastBOS.level.toLocaleString()} — confirms ${lastBOS.direction === 'BULLISH' ? 'upside' : 'downside'} momentum. `;
      response += `(Strategy §6: BOS validates trend direction)\n`;
    }
    if (lastCHoCH) {
      response += `• Last CHoCH (Change of Character): ${lastCHoCH.direction} at $${lastCHoCH.level.toLocaleString()} — potential trend reversal signal. `;
      response += `(Strategy §6: CHoCH warns of structural shift)\n`;
    }

    if (!lastBOS && !lastCHoCH) {
      response += `No recent BOS or CHoCH detected. Market is likely consolidating — Strategy §22 recommends avoiding entries in ranging conditions.`;
    }

    const zoneCount = ctx.activeZones.length;
    response += `\nActive Order Blocks nearby: **${zoneCount}**. `;
    if (zoneCount > 0) {
      const nearest = ctx.activeZones[0];
      const type = nearest.type === 'DEMAND' ? 'Demand' : 'Supply';
      response += `Closest is a ${type} Zone at $${nearest.lowerPrice.toLocaleString()} - $${nearest.upperPrice.toLocaleString()} (Strength: ${nearest.strength}%).`;
    }

    return response;
  }

  private static async explainTrades(ctx: CopilotContext, query: string): Promise<string> {
    if (ctx.recentTrades.length === 0) {
      return `No trade history found for ${ctx.activeSymbol} in the database. Once the algorithm or manual execution places trades, they'll appear here with full decision breakdowns.`;
    }

    const latest = ctx.recentTrades[0];
    const pnl = latest.netPnL;
    const pnlEmoji = pnl > 0 ? '🟢' : pnl < 0 ? '🔴' : '⚪';
    const result = latest.resultStatus;

    let response = `**Last Trade: ${ctx.activeSymbol}**\n\n`;
    response += `${pnlEmoji} **${result}** | Net PnL: **$${pnl?.toFixed(2) || '0.00'}**\n`;
    response += `Entry: $${latest.entryPrice} → Exit: $${latest.exitPrice || 'Open'}\n`;
    response += `Leverage: ${latest.leverage}x | Risk: ${latest.riskPercent}% | Size: ${latest.quantity}\n`;
    response += `Duration: ${latest.durationSeconds ? Math.round(latest.durationSeconds / 60) + ' min' : 'N/A'}\n\n`;

    if (query.includes('why') || query.includes('explain')) {
      response += `**Why this trade?**\n`;
      response += `The AI Decision Engine approved this with ${latest.decisionConfidence}% confidence. `;
      response += `Strategy §20 requires ≥85% confidence — this ${latest.decisionConfidence >= 85 ? 'met' : 'did NOT meet'} that threshold. `;
      response += `Stop Loss was placed at the opposite Order Block edge (Strategy §18), targeting 60% account profit (Strategy §19).`;
    }

    return response;
  }

  private static explainStrategy(ctx: CopilotContext, query: string): string {
    if (query.includes('should i') || query.includes('enter') || query.includes('trade now')) {
      if (ctx.openPosition) {
        return `❌ **No new entries allowed.** Strategy §15: Only ONE trade may remain open at a time. You currently have an open ${ctx.openPosition.side} position on ${ctx.activeSymbol} with ${ctx.unrealizedPnL >= 0 ? '+' : ''}$${Math.abs(ctx.unrealizedPnL).toFixed(2)} unrealized PnL. Close this first.`;
      }

      if (ctx.activeZones.length === 0) {
        return `❌ **No valid setup.** Strategy §9: Trade ONLY Order Blocks. No fresh or first-touch Order Blocks detected on ${ctx.activeSymbol} 1H right now. The scanner is waiting.`;
      }

      const bestZone = ctx.activeZones[0];
      const priceInZone = ctx.currentPrice >= bestZone.lowerPrice && ctx.currentPrice <= bestZone.upperPrice;

      if (!priceInZone) {
        return `⏳ **Wait.** Price ($${ctx.currentPrice.toLocaleString()}) is not inside the nearest Order Block ($${bestZone.lowerPrice.toLocaleString()} - $${bestZone.upperPrice.toLocaleString()}). Strategy §10: Enter only when price touches the OB.`;
      }

      if (ctx.latestDecision && ctx.latestDecision.confidenceScore < 85) {
        return `⚠️ **Wait.** Price is inside an Order Block, but the AI Decision Engine scored this setup at ${ctx.latestDecision.confidenceScore}% confidence. Strategy §20 requires ≥85%. Reasons: ${(ctx.latestDecision.reasonCodesJson ? JSON.parse(ctx.latestDecision.reasonCodesJson).slice(0, 3).join(', ') : 'insufficient confluence')}.`;
      }

      return `✅ **Setup valid!** Price is inside a ${bestZone.type} Order Block, AI confidence is sufficient, and no position is open. The scanner will auto-execute if ALGO TRADING is ON.`;
    }

    if (query.includes('risk') || query.includes('35')) {
      return `**Risk Rules (Strategy §16-18)**\n\n• Use **100%** of account balance per trade.\n• Maximum **35%** account loss if SL hits.\n• Maximum **100x** leverage.\n• SL = opposite edge of the Order Block.\n• TP = +60% account profit target.\n\nYour current balance: **$${ctx.balance.toFixed(2)}**. At 35% risk, you can lose max **$${(ctx.balance * 0.35).toFixed(2)}** per trade.`;
    }

    if (query.includes('leverage') || query.includes('100x')) {
      return `**Leverage Rule (Strategy §17)**\n\nLeverage is auto-calculated to achieve 35% risk based on the OB width. Wider OB = lower leverage needed. Narrow OB = higher leverage allowed, capped at 100x. Never fixed — always dynamic based on SL distance.`;
    }

    return `**QuantEdge Strategy Summary**\n\n• **Pairs:** BTC, ETH, SOL, XRP only (§2)\n• **Timeframe:** 1H only (§8)\n• **Entry:** Order Block touch only (§9, §10)\n• **Risk:** 35% account risk, 100% balance used (§16-17)\n• **Profit:** Close at +60% account growth (§19)\n• **AI:** Minimum 85% confidence (§20)\n• **Max:** 1 open trade at a time (§15)\n\nAsk me about any specific rule or how it applies to the current chart.`;
  }

  private static explainPosition(ctx: CopilotContext): string {
    if (!ctx.openPosition) {
      return `You're currently **flat** on ${ctx.activeSymbol}. No open positions. Account balance: **$${ctx.balance.toFixed(2)}**. Available margin: **$${(ctx.balance - (ctx.balance * 0.35)).toFixed(2)}** after reserving 35% risk.`;
    }

    const pos = ctx.openPosition;
    const entry = parseFloat(pos.entry_price || pos.entryPrice || '0');
    const size = parseFloat(pos.size || '0');
    const mark = parseFloat(pos.mark_price || pos.markPrice || ctx.currentPrice);
    const side = pos.side?.toUpperCase() || 'UNKNOWN';
    const lev = parseFloat(pos.leverage || '1');
    const liq = pos.liquidation_price ? parseFloat(pos.liquidation_price).toFixed(2) : 'N/A';

    const pnl = ctx.unrealizedPnL;
    const pnlPct = ctx.balance > 0 ? (pnl / ctx.balance) * 100 : 0;
    const direction = side === 'BUY' || side === 'LONG' ? 'Long' : 'Short';

    let response = `**Open Position: ${ctx.activeSymbol} ${direction}**\n\n`;
    response += `Entry: **$${entry.toLocaleString()}** | Mark: **$${mark.toLocaleString()}**\n`;
    response += `Size: **${size}** lots | Leverage: **${lev}x**\n`;
    response += `Unrealized PnL: **${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}** (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}% of account)\n`;
    response += `Liquidation: **$${liq}**\n\n`;

    if (pnlPct >= 50) {
      response += `🎯 **Approaching 60% profit target!** Strategy §19 recommends closing when account profit hits 60%. You're at ${pnlPct.toFixed(1)}%. Consider taking profit soon.`;
    } else if (pnlPct <= -30) {
      response += `🚨 **High drawdown!** You're near the 35% max loss limit. Monitor closely — SL should trigger at -35%.`;
    } else {
      response += `Position is within normal risk parameters. Monitor for TP/SL hits.`;
    }

    return response;
  }

  private static explainZones(ctx: CopilotContext): string {
    if (ctx.activeZones.length === 0) {
      return `No active Order Blocks on ${ctx.activeSymbol} right now. This means:\n1. Price has mitigated all recent OBs, OR\n2. The indicator engine hasn't detected new structure yet (needs 20+ 1H candles).\n\nStrategy §9 says we ONLY trade OBs — no OB = no trade.`;
    }

    let response = `**Active Order Blocks on ${ctx.activeSymbol} (${ctx.activeZones.length})**\n\n`;
    
    ctx.activeZones.slice(0, 3).forEach((z, i) => {
      const type = z.type === 'DEMAND' ? '🟢 DEMAND' : '🔴 SUPPLY';
      const widthPct = ((z.upperPrice - z.lowerPrice) / z.upperPrice * 100).toFixed(2);
      const priceInZone = ctx.currentPrice >= z.lowerPrice && ctx.currentPrice <= z.upperPrice;
      const status = priceInZone ? '⚡ PRICE INSIDE NOW' : z.status === 'FRESH' ? '✅ Fresh' : '👆 First Touch';

      response += `**${i + 1}.** ${type} | ${status}\n`;
      response += `   Range: $${z.lowerPrice.toLocaleString()} - $${z.upperPrice.toLocaleString()}\n`;
      response += `   Width: ${widthPct}% | Strength: ${z.strength}/100 | Touches: ${z.touchCount || 0}\n`;
      response += `   ${widthPct <= '0.6' ? 'Narrow OB → Enter at edge (§11)' : 'Wide OB → Enter 25% inside (§11)'}\n\n`;
    });

    return response.trim();
  }

  private static explainScanner(ctx: CopilotContext): string {
    const state = ctx.scannerState;
    const latest = ctx.latestDecision;

    let response = `**Scanner Status: ${state}**\n\n`;

    if (state === 'RUNNING') {
      response += `The 24/7 scanner is actively monitoring all 4 pairs (BTC, ETH, SOL, XRP) on 1H timeframe.\n\n`;
    } else if (state === 'PAUSED') {
      response += `Scanner is paused. No new entry evaluation happening. Existing trade management continues.\n\n`;
    } else {
      response += `Scanner is ${state.toLowerCase()}. Start it to enable automated detection.\n\n`;
    }

    if (latest) {
      response += `**Latest Decision on ${ctx.activeSymbol}:**\n`;
      response += `State: **${latest.decisionState}** | Confidence: **${latest.confidenceScore}%**\n`;
      response += `Outcome: ${latest.outcome} | Entry: $${latest.entryPrice} | SL: $${latest.stopLossPrice} | TP: $${latest.takeProfitPrice}\n`;
      
      try {
        const reasons = JSON.parse(latest.reasonCodesJson || '[]');
        response += `Reason Codes: ${reasons.slice(0, 5).join(', ')}\n`;
      } catch {
        // ignore parse error
      }

      if (latest.decisionState === 'REJECTED') {
        response += `\n**Why rejected?** Check the reason codes above. Common causes: trend misalignment, no BOS/CHoCH confirmation, low AI confidence (<85%), or news filter blocking (§21).`;
      } else if (latest.decisionState === 'APPROVED') {
        response += `\n✅ **Approved!** This passed all 12 validation rules and AI confirmation.`;
      }
    } else {
      response += `No decision logs yet for ${ctx.activeSymbol}. Decisions appear after the scanner evaluates a setup.`;
    }

    return response;
  }

  private static explainRisk(ctx: CopilotContext): string {
    const marginUsed = ctx.openPosition ? parseFloat(ctx.openPosition.margin_amount || '0') : 0;
    const marginAvailable = ctx.balance - marginUsed;
    const riskPerTrade = ctx.balance * 0.35;

    return `**Risk Dashboard**\n\nAccount Balance: **$${ctx.balance.toFixed(2)}**\nUsed Margin: **$${marginUsed.toFixed(2)}**\nAvailable: **$${marginAvailable.toFixed(2)}**\n\n**Per-Trade Limits (Strategy §16-18):**\n• Max Risk: **$${riskPerTrade.toFixed(2)}** (35% of balance)\n• Max Leverage: **100x**\n• Balance Usage: **100%** (all-in per trade)\n\n**Current Open Risk:**\n${ctx.openPosition 
      ? `You have an open position using $${marginUsed.toFixed(2)} margin. Unrealized PnL: ${ctx.unrealizedPnL >= 0 ? '+' : ''}$${ctx.unrealizedPnL.toFixed(2)}.` 
      : 'No open positions. Full balance available for next trade.'}`;
  }

  private static generalAssistance(ctx: CopilotContext, _query: string): string {
    return `I can help with that. Based on current data for **${ctx.activeSymbol}** at $${ctx.currentPrice.toLocaleString()}:\n\n• Trend: ${ctx.marketStructure?.trend || 'Analyzing...'}\n• Active OBs: ${ctx.activeZones.length}\n• Open Position: ${ctx.openPosition ? 'Yes (' + (ctx.unrealizedPnL >= 0 ? '+' : '') + '$' + ctx.unrealizedPnL.toFixed(2) + ')' : 'None'}\n• Scanner: ${ctx.scannerState}\n\nAsk me specifically about:\n- "Explain market structure"\n- "Why was the last trade rejected?"\n- "Show me active order blocks"\n- "What is my current risk?"\n- "Should I enter now?"`;
  }
}
