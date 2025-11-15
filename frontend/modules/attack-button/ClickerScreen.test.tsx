import React from 'react'
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ClickerScreen } from './ClickerScreen'
import { shopStore } from '../shop/stores/shop.store'
import { UpgradeType } from '../shop/types'

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

describe('ClickerScreen - Bot Factory Integration', () => {
  const user = userEvent.setup()

  beforeEach(async () => {
    jest.clearAllMocks()
    // Restore any mocked modules
    jest.restoreAllMocks()
    await AsyncStorage.clear()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Reset shop state
    shopStore.purchasedUpgrades.set([])

    // Restore hardcoded upgrades
    shopStore.availableUpgrades.set([
      {
        id: 'storage-pouch-1',
        name: 'Storage Pouch',
        description: 'Adds +1 scrap per pet',
        cost: 20,
        upgradeType: UpgradeType.SCRAP_PER_PET,
        effectValue: 1
      },
      {
        id: 'bot-factory-1',
        name: 'Bot Factory',
        description: 'Adds +1 AI Bot per Feed click',
        cost: 100,
        upgradeType: UpgradeType.PETS_PER_FEED,
        effectValue: 1
      }
    ])
  })

  test('should increment by 1 when no bonus (no Bot Factory)', async () => {
    render(<ClickerScreen storageKey={`test-clicker-no-bonus-${Date.now()}`} />)

    const feedButton = screen.getByTestId('feed-button')

    // Initial state
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy()
    })

    // Press Feed button
    await user.press(feedButton)

    // Should increment by 1 (base amount, no bonus)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy()
    })
  })

  test('should increment by 2 when Bot Factory owned (1 base + 1 bonus)', async () => {
    // Purchase Bot Factory
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    render(<ClickerScreen storageKey={`test-clicker-with-bonus-${Date.now()}`} />)

    const feedButton = screen.getByTestId('feed-button')

    // Initial state
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy()
    })

    // Press Feed button - WILL FAIL initially (still using increment())
    await user.press(feedButton)

    // Should increment by 2 (1 base + 1 bonus)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 2')).toBeTruthy()
    })
  })

  test('full integration: purchase Bot Factory → feed gains 2 pets', async () => {
    render(<ClickerScreen storageKey={`test-full-integration-${Date.now()}`} />)

    const feedButton = screen.getByTestId('feed-button')

    // Feed without bonus
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy()
    })

    // Purchase Bot Factory mid-session
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    // Feed with bonus should add 2
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 3')).toBeTruthy() // 1 + 2 = 3
    })

    // Another feed with bonus
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 5')).toBeTruthy() // 3 + 2 = 5
    })
  })

  test('multiple rapid feeds with bonus apply correctly', async () => {
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    render(<ClickerScreen storageKey={`test-rapid-feeds-${Date.now()}`} />)

    const feedButton = screen.getByTestId('feed-button')

    // Rapid taps
    for (let i = 0; i < 5; i++) {
      await user.press(feedButton)
    }

    // Should be 10 (5 taps × 2 pets per tap)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 10')).toBeTruthy()
    }, { timeout: 3000 })
  })

  test('bonus persists across component remounts', async () => {
    shopStore.purchasedUpgrades.set(['bot-factory-1'])

    const storageKey = `test-persistence-${Date.now()}`
    let renderResult = render(
      <ClickerScreen storageKey={storageKey} />
    )

    let feedButton = screen.getByTestId('feed-button')

    // Feed once with bonus
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 2')).toBeTruthy()
    })

    // Simulate app restart (unmount + remount)
    renderResult.unmount()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Re-render with same storage key
    renderResult = render(<ClickerScreen storageKey={storageKey} />)

    // Feed again - bonus should still apply
    feedButton = screen.getByTestId('feed-button')
    await user.press(feedButton)
    await waitFor(() => {
      expect(screen.getByText('Singularity Pet Count: 4')).toBeTruthy() // 2 + 2
    })
  })
})
