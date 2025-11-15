import { renderHook, act, waitFor } from '@testing-library/react-native'
import { usePersistedCounter } from './usePersistedCounter'

describe('usePersistedCounter - incrementBy', () => {
  // Use unique storage keys per test to avoid state pollution
  let testCounter = 0

  beforeEach(() => {
    jest.clearAllMocks()
    testCounter++
  })

  test('should have incrementBy action', () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`))

    // Test WILL FAIL - incrementBy doesn't exist yet
    expect(result.current.actions.incrementBy).toBeDefined()
    expect(typeof result.current.actions.incrementBy).toBe('function')
  })

  test('should increment by custom amount', async () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`))

    act(() => {
      result.current.actions.incrementBy(5)
    })

    // CRITICAL: Wait for Legend-State observable to update
    await waitFor(() => {
      expect(result.current.count$.get()).toBe(5)
    })
  })

  test('should handle incrementBy(2) for Bot Factory use case', async () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`))

    act(() => {
      result.current.actions.incrementBy(2)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(2)
    })

    // Second increment with bonus
    act(() => {
      result.current.actions.incrementBy(2)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(4) // 2 + 2
    })
  })

  test('should handle rapid incrementBy calls accurately', async () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`))

    // Rapid actions with verification after EACH
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.actions.incrementBy(2)
      })

      // CRITICAL: Wait after EACH action (Legend-State async updates)
      await waitFor(() => {
        expect(result.current.count$.get()).toBe((i + 1) * 2)
      })
    }

    // Final verification
    expect(result.current.count$.get()).toBe(6)
  })

  test('should validate incrementBy prevents negative values', async () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`, 10))

    act(() => {
      result.current.actions.incrementBy(-15)
    })

    await waitFor(() => {
      // validateCount() clamps to 0, not -5
      expect(result.current.count$.get()).toBe(0)
    })
  })

  test('should validate incrementBy handles fractional values', async () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`))

    act(() => {
      result.current.actions.incrementBy(3.7)
    })

    await waitFor(() => {
      // validateCount() floors to integer
      expect(result.current.count$.get()).toBe(3)
    })
  })

  test('existing increment() still works (regression test)', async () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`))

    act(() => {
      result.current.actions.increment()
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(1)
    })
  })

  test('incrementBy works with existing set() action', async () => {
    const { result } = renderHook(() => usePersistedCounter(`test-counter-${testCounter}`))

    act(() => {
      result.current.actions.set(10)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(10)
    })

    act(() => {
      result.current.actions.incrementBy(5)
    })

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(15)
    })
  })
})
