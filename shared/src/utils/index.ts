/**
 * Format a string or number as an exact fixed-precision decimal string.
 */
export function formatDecimalString(value: string | number, precision = 8): string {
  const str = typeof value === 'number' ? value.toString() : value;
  if (!str || isNaN(Number(str))) {
    return (0).toFixed(precision);
  }
  const parts = str.split('.');
  const integerPart = parts[0] ?? '0';
  let fractionalPart = parts[1] ?? '';
  
  if (fractionalPart.length < precision) {
    fractionalPart = fractionalPart.padEnd(precision, '0');
  } else if (fractionalPart.length > precision) {
    fractionalPart = fractionalPart.slice(0, precision);
  }
  
  return precision > 0 ? `${integerPart}.${fractionalPart}` : integerPart;
}

/**
 * Returns current timestamp in ISO 8601 UTC format.
 */
export function getIsoUtcTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}
