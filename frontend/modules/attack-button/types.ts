import { Observable } from '@legendapp/state'

/**
 * Counter validation constraints
 */
export const COUNTER_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: Number.MAX_SAFE_INTEGER,
  DEBOUNCE_MS: 500,
} as const

/**
 * Hook return type for usePersistedCounter
 */
export interface UsePersistedCounterReturn {
  count$: Observable<number>
  actions: {
    increment: () => void
    incrementBy: (amount: number) => void
    reset: () => void
    set: (value: number) => void
  }
}
