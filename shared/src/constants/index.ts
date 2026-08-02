export const API_VERSION_PREFIX = '/api/v1';

export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 200;

export const HTTP_HEADERS = {
  CORRELATION_ID: 'X-Request-Id',
} as const;

export const DECIMAL_PRECISION = {
  CURRENCY_SCALE: 8,
  QUANTITY_SCALE: 8,
  PRICE_SCALE: 8,
} as const;

export const TERMINAL_PAGE_ROUTES: Record<string, string> = {
  DASHBOARD: '/',
  PAPER_TRADING: '/paper-trading',
  LIVE_TRADING: '/live-trading',
  ANALYSIS: '/analysis',
  TRADE_JOURNAL: '/journal',
  ANALYTICS: '/analytics',
  CHALLENGE: '/challenge',
  SETTINGS: '/settings',
};
