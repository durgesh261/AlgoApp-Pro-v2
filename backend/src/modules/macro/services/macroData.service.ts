export interface MacroDataPoint {
  indicator: string;
  country: string;
  flag: string;
  actual: string;
  forecast: string;
  previous: string;
  unit: string;
  releaseDate: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'BETTER' | 'WORSE' | 'NEUTRAL';
  surprise?: number | undefined; // % difference actual vs forecast
}

export class MacroDataService {
  /**
   * Fetch latest published macro data (CPI, NFP, etc.)
   * Uses Trading Economics free API or fallback mock
   */
  static async getLatestMacroData(): Promise<MacroDataPoint[]> {
    try {
      const res = await fetch('https://api.tradingeconomics.com/indicators?c=guest:guest&f=json');
      if (res.ok) {
        const data = await res.json();
        return this.parseIndicators(data);
      }
    } catch {
      // Fallback
    }
    return this.getFallbackMacroData();
  }

  private static parseIndicators(data: any[]): MacroDataPoint[] {
    const majorIndicators = ['CPI', 'Inflation Rate', 'Non Farm Payrolls', 'GDP', 'Interest Rate', 'Unemployment Rate'];
    
    return data
      .filter((item: any) => {
        const title = (item.Category || item.category || '').toLowerCase();
        return majorIndicators.some(mi => title.includes(mi.toLowerCase()));
      })
      .map((item: any) => {
        const actual = parseFloat(item.LatestValue || item.latestValue);
        const forecast = parseFloat(item.Forecast || item.forecast);
        
        let trend: 'BETTER' | 'WORSE' | 'NEUTRAL' = 'NEUTRAL';
        let surprise: number | undefined;
        
        if (!isNaN(actual) && !isNaN(forecast)) {
          surprise = ((actual - forecast) / Math.abs(forecast)) * 100;
          const isGood = (item.Category || '').includes('Unemployment') || (item.Category || '').includes('Inflation')
            ? actual < forecast // Lower is better for unemployment/inflation
            : actual > forecast; // Higher is better for GDP, NFP
          trend = isGood ? 'BETTER' : 'WORSE';
        }

        return {
          indicator: item.Category || item.category,
          country: item.Country || item.country,
          flag: this.getFlag(item.Country || item.country),
          actual: String(item.LatestValue || item.latestValue),
          forecast: String(item.Forecast || item.forecast || '---'),
          previous: String(item.PreviousValue || item.previousValue || '---'),
          unit: item.Unit || item.unit || '',
          releaseDate: item.LatestValueDate || item.latestValueDate || new Date().toISOString(),
          impact: this.getImpact(item.Category || item.category),
          trend,
          surprise: surprise ? parseFloat(surprise.toFixed(2)) : undefined,
        };
      })
      .slice(0, 15);
  }

  private static getFallbackMacroData(): MacroDataPoint[] {
    return [
      { indicator: 'CPI (YoY)', country: 'United States', flag: '🇺🇸', actual: '3.2', forecast: '3.3', previous: '3.0', unit: '%', releaseDate: '2026-08-07', impact: 'HIGH', trend: 'BETTER', surprise: -3.03 },
      { indicator: 'Non-Farm Payrolls', country: 'United States', flag: '🇺🇸', actual: '185', forecast: '200', previous: '210', unit: 'K', releaseDate: '2026-08-01', impact: 'HIGH', trend: 'WORSE', surprise: -7.5 },
      { indicator: 'Fed Funds Rate', country: 'United States', flag: '🇺🇸', actual: '5.50', forecast: '5.50', previous: '5.50', unit: '%', releaseDate: '2026-07-30', impact: 'HIGH', trend: 'NEUTRAL' },
      { indicator: 'GDP (QoQ)', country: 'United States', flag: '🇺🇸', actual: '2.1', forecast: '2.0', previous: '1.9', unit: '%', releaseDate: '2026-07-25', impact: 'HIGH', trend: 'BETTER', surprise: 5.0 },
      { indicator: 'Unemployment Rate', country: 'United States', flag: '🇺🇸', actual: '4.1', forecast: '4.2', previous: '4.0', unit: '%', releaseDate: '2026-08-01', impact: 'HIGH', trend: 'WORSE', surprise: -2.38 },
      { indicator: 'CPI (YoY)', country: 'Eurozone', flag: '🇪🇺', actual: '2.4', forecast: '2.5', previous: '2.6', unit: '%', releaseDate: '2026-08-05', impact: 'HIGH', trend: 'BETTER', surprise: -4.0 },
      { indicator: 'ECB Deposit Rate', country: 'Eurozone', flag: '🇪🇺', actual: '3.75', forecast: '3.75', previous: '3.75', unit: '%', releaseDate: '2026-07-18', impact: 'HIGH', trend: 'NEUTRAL' },
      { indicator: 'RBI Repo Rate', country: 'India', flag: '🇮🇳', actual: '6.50', forecast: '6.50', previous: '6.50', unit: '%', releaseDate: '2026-08-06', impact: 'HIGH', trend: 'NEUTRAL' },
      { indicator: 'India CPI (YoY)', country: 'India', flag: '🇮🇳', actual: '5.08', forecast: '5.20', previous: '5.10', unit: '%', releaseDate: '2026-08-07', impact: 'HIGH', trend: 'BETTER', surprise: -2.31 },
      { indicator: 'BOE Bank Rate', country: 'United Kingdom', flag: '🇬🇧', actual: '5.25', forecast: '5.25', previous: '5.25', unit: '%', releaseDate: '2026-08-01', impact: 'HIGH', trend: 'NEUTRAL' },
    ];
  }

  private static getFlag(country: string): string {
    const flags: Record<string, string> = {
      'United States': '🇺🇸', 'Eurozone': '🇪🇺', 'United Kingdom': '🇬🇧',
      'India': '🇮🇳', 'China': '🇨🇳', 'Japan': '🇯🇵', 'Germany': '🇩🇪',
      'France': '🇫🇷', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Brazil': '🇧🇷',
    };
    return flags[country] || '🌍';
  }

  private static getImpact(indicator: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const high = ['CPI', 'Inflation', 'Non Farm', 'NFP', 'GDP', 'Interest Rate', 'Fed', 'ECB', 'BOE', 'RBI', 'BOJ', 'PCE'];
    const medium = ['Retail Sales', 'PMI', 'Jobless Claims', 'Trade Balance', 'Industrial Production'];
    if (high.some(h => indicator.toLowerCase().includes(h.toLowerCase()))) return 'HIGH';
    if (medium.some(m => indicator.toLowerCase().includes(m.toLowerCase()))) return 'MEDIUM';
    return 'LOW';
  }
}
