/**
 * Formats a number with thousand separators for display.
 *
 * @param value - The number to format
 * @returns Formatted string with commas (e.g., "1,234,567")
 *
 * @example
 * formatNumber(0) → "0"
 * formatNumber(1000) → "1,000"
 * formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
