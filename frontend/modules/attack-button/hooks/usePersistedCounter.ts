import { useMemo } from 'react'
import { createCounterStore, validateCount } from '../stores/counter.store'
import type { UsePersistedCounterReturn } from '../types'

/**
 * Provides persistent counter behavior with auto-save
 *
 * @param storageKey - AsyncStorage key for persistence
 * @param initialValue - Starting value if no saved data (default: 0)
 * @returns Observable counter and actions
 *
 * @example
 * ```tsx
 * const { count$, actions } = usePersistedCounter('my-counter', 0)
 *
 * // In component
 * <Memo>{() => <Text>{count$.get()}</Text>}</Memo>
 * <Button onPress={actions.increment}>Increment</Button>
 * ```
 */
export function usePersistedCounter(
  storageKey: string,
  initialValue = 0
): UsePersistedCounterReturn {
  // Create store instance (memoized to persist across renders)
  const store = useMemo(
    () => createCounterStore(storageKey, initialValue),
    [storageKey, initialValue]
  )

  // Return memoized object with observable and actions
  return useMemo(() => ({
    // Observable for fine-grained reactivity
    count$: store.count,

    // Actions (regular functions, not observables)
    actions: {
      increment: () => {
        const current = store.count.get()
        store.count.set(validateCount(current + 1))
      },

      incrementBy: (amount: number) => {
        const current = store.count.get()
        store.count.set(validateCount(current + amount))
      },

      reset: () => {
        store.count.set(validateCount(initialValue))
      },

      set: (value: number) => {
        store.count.set(validateCount(value))
      }
    }
  }), [store, initialValue])
}
