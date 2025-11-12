/**
 * Formats a number with comma separators for thousands
 *
 * @param num - Number to format
 * @returns Formatted string with commas (e.g., "1,234,567")
 *
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}
