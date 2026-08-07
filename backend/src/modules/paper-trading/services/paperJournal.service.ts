import { PaperTradeJournalDto, PaperJournalEventType } from '@algoapp/shared';

let journalEntries: PaperTradeJournalDto[] = [
  {
    id: 'JRN-101',
    eventType: PaperJournalEventType.ORDER_FILL,
    symbol: 'BTCUSD.P',
    action: 'PAPER_BUY_FILLED',
    details: 'Filled paper limit order 0.50 BTC @ $63,150.00',
    timestamp: '2026-08-02T18:14:02Z',
  },
  {
    id: 'JRN-102',
    eventType: PaperJournalEventType.ORDER_FILL,
    symbol: 'ETHUSD.P',
    action: 'PAPER_BUY_FILLED',
    details: 'Filled paper market order 4.00 ETH @ $3,420.00',
    timestamp: '2026-08-02T19:05:18Z',
  },
  {
    id: 'JRN-103',
    eventType: PaperJournalEventType.RISK_EVENT,
    symbol: 'SOLUSD.P',
    action: 'RISK_CAPACITY_CHECK',
    details: 'Paper order verified against 2.0% max risk policy.',
    timestamp: '2026-08-02T19:42:50Z',
  },
];

export class PaperJournalService {
  public static async getJournalEntries(): Promise<PaperTradeJournalDto[]> {
    return journalEntries;
  }

  public static async logEntry(
    eventType: PaperJournalEventType,
    action: string,
    details: string,
    symbol?: string,
    metadataJson?: string
  ): Promise<PaperTradeJournalDto> {
    const entry: PaperTradeJournalDto = {
      id: `JRN-${Date.now()}`,
      eventType,
      symbol,
      action,
      details,
      metadataJson,
      timestamp: new Date().toISOString(),
    };
    journalEntries.unshift(entry);
    return entry;
  }

  public static async logAction(
    action: string,
    details: string,
    symbol?: string
  ): Promise<PaperTradeJournalDto> {
    return this.logEntry(PaperJournalEventType.ORDER_FILL, action, details, symbol);
  }
}
