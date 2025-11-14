import { SCRAP_CONSTRAINTS } from '../types'

/**
 * Validates and constrains scrap values
 *
 * @param value - Value to validate
 * @returns Valid scrap value within constraints
 */
export function validateScrap(value: number): number {
  const original = value

  // Check for invalid numbers
  if (!Number.isFinite(value)) {
    if (__DEV__) {
      console.warn(`[Scrap] Invalid number ${original}, resetting to 0`)
    }
    return SCRAP_CONSTRAINTS.MIN_VALUE
  }

  // Prevent negative
  if (value < SCRAP_CONSTRAINTS.MIN_VALUE) {
    if (__DEV__) {
      console.warn(`[Scrap] Negative value ${value} not allowed, setting to 0`)
    }
    return SCRAP_CONSTRAINTS.MIN_VALUE
  }

  // Prevent overflow
  if (value > SCRAP_CONSTRAINTS.MAX_VALUE) {
    if (__DEV__) {
      console.warn(`[Scrap] Value ${value} exceeds max, capping at ${SCRAP_CONSTRAINTS.MAX_VALUE}`)
    }
    return SCRAP_CONSTRAINTS.MAX_VALUE
  }

  // Ensure integer
  return Math.floor(value)
}
