export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  date: string;       // ISO string
  time: string;       // e.g. "08:30am"
  impact: 'High' | 'Medium' | 'Low' | 'Holiday';
  forecast: string;
  previous: string;
  actual: string;
  outcome: 'beat' | 'miss' | 'inline' | 'pending';
  outcomeLabel: string;
}

export class EconomicCalendarService {
  private static cachedEvents: EconomicEvent[] = [];
  private static lastFetched: number = 0;
  private static readonly CACHE_TTL_MS = 300000; // 5 minutes

  public static async getCalendar(forceRefresh = false): Promise<EconomicEvent[]> {
    const now = Date.now();
    if (forceRefresh || this.cachedEvents.length === 0 || now - this.lastFetched > this.CACHE_TTL_MS) {
      await this.refresh();
    }
    return this.cachedEvents;
  }

  private static parseNum(val: string): number | null {
    if (!val || val.trim() === '') return null;
    const cleaned = val.replace(/[%KMBTkm,$+]/g, '').trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }

  private static calcOutcome(actual: string, forecast: string): { outcome: EconomicEvent['outcome']; label: string } {
    if (!actual || actual.trim() === '') return { outcome: 'pending', label: 'Pending' };
    const a = this.parseNum(actual);
    const f = this.parseNum(forecast);
    if (a === null || f === null) return { outcome: 'pending', label: 'Released' };
    const diff = ((a - f) / Math.max(Math.abs(f), 0.0001)) * 100;
    if (diff > 2) return { outcome: 'beat', label: `Beat +${diff.toFixed(1)}%` };
    if (diff < -2) return { outcome: 'miss', label: `Miss ${diff.toFixed(1)}%` };
    return { outcome: 'inline', label: 'In-Line' };
  }

  public static async refresh(): Promise<void> {
    const events: EconomicEvent[] = [];

    // Source 1: ForexFactory community JSON (widely used, free, no auth)
    try {
      const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 AlgoApp' },
      });
      const data: any[] = await res.json();
      for (const item of data) {
        const actual = item.actual || '';
        const forecast = item.forecast || '';
        const { outcome, label } = this.calcOutcome(actual, forecast);
        events.push({
          id: `FF-${item.title?.substring(0, 15).replace(/\s/g, '')}-${item.date}`,
          title: item.title || '',
          country: item.country || '',
          currency: item.currency || '',
          date: item.date || '',
          time: item.time || 'All Day',
          impact: (item.impact as EconomicEvent['impact']) || 'Low',
          forecast,
          previous: item.previous || '',
          actual,
          outcome,
          outcomeLabel: label,
        });
      }
    } catch {
      // try next source
    }

    // Source 2: Investing.com economic calendar (public scrape via tradingeconomics API mirror)
    try {
      const res = await fetch('https://economic-calendar.tradingview.com/events?from=' +
        new Date(Date.now() - 86400000).toISOString().split('T')[0] +
        '&to=' + new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] +
        '&countries=US,EU,GB,JP,CN&limit=60', {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data: any = await res.json();
        const items: any[] = data?.result || [];
        for (const item of items) {
          const actual = item.actual != null ? String(item.actual) : '';
          const forecast = item.forecast != null ? String(item.forecast) : '';
          const { outcome, label } = this.calcOutcome(actual, forecast);
          const existing = events.find(e => e.title.toLowerCase() === (item.title || '').toLowerCase());
          if (!existing) {
            events.push({
              id: `TV-${(item.title || '').substring(0, 15).replace(/\s/g, '')}-${item.date}`,
              title: item.title || '',
              country: item.country || '',
              currency: item.currency || '',
              date: item.date || new Date().toISOString(),
              time: item.time || '',
              impact: item.importance === 3 ? 'High' : item.importance === 2 ? 'Medium' : 'Low',
              forecast,
              previous: item.previous != null ? String(item.previous) : '',
              actual,
              outcome,
              outcomeLabel: label,
            });
          }
        }
      }
    } catch {
      // ignore
    }

    // Sort: upcoming first, then past
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (events.length > 0) {
      this.cachedEvents = events;
      this.lastFetched = Date.now();
    }
  }
}
