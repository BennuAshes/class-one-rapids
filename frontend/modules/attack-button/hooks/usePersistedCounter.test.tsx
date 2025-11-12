import { renderHook, act, waitFor } from '@testing-library/react-native'
import { usePersistedCounter } from './usePersistedCounter'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage')

describe('usePersistedCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
  })

  test('initializes with default value of 0', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    expect(result.current.count$.get()).toBe(0)
  })

  test('initializes with custom initial value', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key', 10)
    )

    expect(result.current.count$.get()).toBe(10)
  })

  test('increment increases count by 1', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.increment()
    })

    expect(result.current.count$.get()).toBe(1)
  })

  test('multiple increments accumulate correctly', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.increment()
      result.current.actions.increment()
      result.current.actions.increment()
    })

    expect(result.current.count$.get()).toBe(3)
  })

  test('reset returns count to initial value', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key', 10)
    )

    act(() => {
      result.current.actions.increment()
      result.current.actions.increment()
      result.current.actions.reset()
    })

    expect(result.current.count$.get()).toBe(10)
  })

  test('set changes count to specific value', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(42)
    })

    expect(result.current.count$.get()).toBe(42)
  })

  test('saves count to AsyncStorage on increment', async () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.increment()
    })

    // Wait for debounced save (500ms + buffer)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        expect.any(String)
      )
    }, { timeout: 1000 })
  })

  test('loads saved count on initialization', async () => {
    // Mock AsyncStorage to return saved value
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('42')

    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    await waitFor(() => {
      expect(result.current.count$.get()).toBe(42)
    })
  })

  test('prevents count from going negative', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(-10)
    })

    expect(result.current.count$.get()).toBe(0)
  })

  test('prevents count from exceeding MAX_SAFE_INTEGER', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(Number.MAX_SAFE_INTEGER + 1000)
    })

    expect(result.current.count$.get()).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('handles invalid numbers gracefully', () => {
    const { result } = renderHook(() =>
      usePersistedCounter('test-key')
    )

    act(() => {
      result.current.actions.set(NaN)
    })

    expect(result.current.count$.get()).toBe(0)

    act(() => {
      result.current.actions.set(Infinity)
    })

    expect(result.current.count$.get()).toBe(0)
  })
})
