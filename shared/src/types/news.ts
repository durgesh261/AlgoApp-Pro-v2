export type NewsCategory = 'CRYPTO' | 'BITCOIN' | 'ETHEREUM' | 'DELTA_EXCHANGE' | 'MACRO_ECONOMY' | 'REGULATORY';
export type NewsImportance = 'HIGH' | 'MEDIUM' | 'LOW';

export interface LiveNewsItemDto {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url?: string | undefined;
  category: NewsCategory;
  importance: NewsImportance;
  symbols: string[];
  publishedAt: string;
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | undefined;
  impactScore?: number | undefined; // 1 - 10
}

export interface NewsFilterQueryDto {
  category?: NewsCategory | undefined;
  importance?: NewsImportance | undefined;
  symbol?: string | undefined;
  limit?: number | undefined;
}
