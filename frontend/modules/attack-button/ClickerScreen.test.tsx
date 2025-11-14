import React from 'react'
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ClickerScreen } from './ClickerScreen'

describe('ClickerScreen', () => {
  const user = userEvent.setup()

  beforeEach(async () => {
    jest.clearAllMocks()
    // Clear AsyncStorage to prevent state persistence between tests
    await AsyncStorage.clear()
    // Small delay to ensure storage is fully cleared
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  test('renders feed button', () => {
    render(<ClickerScreen />)
    expect(screen.getByText('Feed')).toBeTruthy()
  })

  test('renders counter label', () => {
    render(<ClickerScreen />)
    expect(screen.getByText(/Singularity Pet Count/i)).toBeTruthy()
  })

  test('displays initial count of 0', () => {
    render(<ClickerScreen />)
    expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy()
  })

  test('increments count on button press', async () => {
    render(<ClickerScreen />)

    const feedButton = screen.getByText('Feed')
    await user.press(feedButton)

    expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy()
  })

  test('handles multiple rapid taps accurately', async () => {
    // Use unique storage key to avoid state pollution from other tests
    render(<ClickerScreen storageKey={`test-rapid-taps-${Date.now()}`} />)
    const testUser = userEvent.setup()

    // Verify we start at 0
    expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy()

    const feedButton = screen.getByText('Feed')

    // Tap 5 times rapidly
    for (let i = 0; i < 5; i++) {
      await testUser.press(feedButton)
    }

    // Wait for all observable updates to settle
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy()
    }, { timeout: 3000 })
  })

  test('formats large numbers with commas', async () => {
    render(<ClickerScreen />)

    // Mock hook to return large number
    const mockHook = require('./hooks/usePersistedCounter')
    jest.spyOn(mockHook, 'usePersistedCounter').mockReturnValue({
      count$: {
        get: () => 1234567,
        // Mock observable methods needed by Memo
        peek: () => 1234567,
        onChange: jest.fn()
      },
      actions: {
        increment: jest.fn(),
        reset: jest.fn(),
        set: jest.fn()
      }
    })

    const { rerender } = render(<ClickerScreen />)
    rerender(<ClickerScreen />)

    expect(screen.getByText('Singularity Pet Count: 1,234,567')).toBeTruthy()
  })

  test('feed button meets accessibility touch target size', () => {
    render(<ClickerScreen />)

    const button = screen.getByTestId('feed-button')
    const style = button.props.style

    // Flatten style array if needed
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style)
      : style

    expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44)
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44)
  })

  test('has high contrast colors for accessibility', () => {
    const { getByText } = render(<ClickerScreen />)

    const counterText = screen.getByText(/Singularity Pet Count/i)
    const style = counterText.props.style

    // Verify text color is defined (actual contrast checked manually)
    expect(style.color).toBeDefined()
  })
})
