/**
 * IST (Indian Standard Time) utility functions for QuantEdge AI.
 * All timestamps displayed in the app use IST (UTC+5:30).
 */

const IST_LOCALE = 'en-IN';
const IST_TIMEZONE = 'Asia/Kolkata';

/** Format a timestamp as IST time only — e.g. "14:35:07" */
export function toISTTime(date: string | number | Date): string {
  return new Date(date).toLocaleTimeString(IST_LOCALE, {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Format a timestamp as IST time (no seconds) — e.g. "14:35" */
export function toISTTimeShort(date: string | number | Date): string {
  return new Date(date).toLocaleTimeString(IST_LOCALE, {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format a timestamp as IST date — e.g. "07/08/2026" */
export function toISTDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString(IST_LOCALE, {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Format a timestamp as IST date + time — e.g. "07/08/2026, 14:35:07" */
export function toISTDateTime(date: string | number | Date): string {
  return new Date(date).toLocaleString(IST_LOCALE, {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Format a timestamp as compact IST — e.g. "07 Aug, 14:35" */
export function toISTDateTimeCompact(date: string | number | Date): string {
  return new Date(date).toLocaleString(IST_LOCALE, {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Get current IST time as a string — e.g. "14:35:07 IST" */
export function nowIST(): string {
  return new Date().toLocaleTimeString(IST_LOCALE, {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + ' IST';
}

/** Get a relative time description — e.g. "2m ago" */
export function timeAgoIST(date: string | number | Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return toISTDate(date);
}
