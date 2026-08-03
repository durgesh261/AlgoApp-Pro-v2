import { TradeReviewDetailDto } from '@algoapp/shared';

export class TradeReviewExporterService {
  public static exportCsv(detail: TradeReviewDetailDto): string {
    const header =
      'TradeID,Symbol,Timeframe,Side,Entry,Exit,Quantity,Margin,Leverage,GrossPnL,Fee,Tax,NetPnL,Result,Idea,Emotion,ConfidenceBefore,ConfidenceAfter\n';

    const e = detail.ledgerEntry;
    const j = detail.journalNote;

    const row = `${e.tradeId},${e.symbol},${e.timeframe},${e.side},${e.entryPrice},${e.exitPrice},${e.quantity},${e.marginUsed},${e.leverage},${e.grossPnL},${e.tradingFee},${e.tax},${e.netPnL},${e.resultStatus},"${j?.idea || ''}","${j?.emotion || 'CALM'}",${j?.confidenceBefore || 8},${j?.confidenceAfter || 8}`;

    return header + row + '\n';
  }

  public static exportJson(detail: TradeReviewDetailDto): string {
    return JSON.stringify(detail, null, 2);
  }
}
