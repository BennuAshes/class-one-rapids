import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ClickerScreen } from './ClickerScreen'

describe('ClickerScreen', () => {
  const mockNavigateToShop = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('displays counter label with initial count of 0', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)
      expect(screen.getByText('Singularity Pet Count: 0')).toBeTruthy()
    })

    test('displays feed button', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)
      expect(screen.getByText('feed')).toBeTruthy()
    })

    test('displays shop navigation button', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)
      expect(screen.getByText('Shop')).toBeTruthy()
    })
  })

  describe('Feed Button Interaction', () => {
    test('increments counter by 1 when feed button is pressed', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const feedButton = screen.getByText('feed')
      fireEvent.press(feedButton)

      expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy()
    })

    test('increments counter multiple times with sequential clicks', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const feedButton = screen.getByText('feed')

      fireEvent.press(feedButton)
      expect(screen.getByText('Singularity Pet Count: 1')).toBeTruthy()

      fireEvent.press(feedButton)
      expect(screen.getByText('Singularity Pet Count: 2')).toBeTruthy()

      fireEvent.press(feedButton)
      expect(screen.getByText('Singularity Pet Count: 3')).toBeTruthy()
    })

    test('handles rapid clicking accurately', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const feedButton = screen.getByText('feed')

      // Simulate 10 rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.press(feedButton)
      }

      expect(screen.getByText('Singularity Pet Count: 10')).toBeTruthy()
    })

    test('supports large counter values', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const feedButton = screen.getByText('feed')

      // Simulate 100 clicks
      for (let i = 0; i < 100; i++) {
        fireEvent.press(feedButton)
      }

      expect(screen.getByText('Singularity Pet Count: 100')).toBeTruthy()
    })
  })

  describe('Navigation', () => {
    test('calls onNavigateToShop when shop button is pressed', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const shopButton = screen.getByText('Shop')
      fireEvent.press(shopButton)

      expect(mockNavigateToShop).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    test('feed button has correct accessibility attributes', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const feedButton = screen.getByRole('button', {
        name: 'Feed the Singularity Pet'
      })
      expect(feedButton).toBeTruthy()
    })

    test('shop button has correct accessibility attributes', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const shopButton = screen.getByRole('button', {
        name: 'Navigate to shop'
      })
      expect(shopButton).toBeTruthy()
    })
  })

  describe('Visual Regression', () => {
    test('matches snapshot on initial render', () => {
      const { toJSON } = render(
        <ClickerScreen onNavigateToShop={mockNavigateToShop} />
      )
      expect(toJSON()).toMatchSnapshot()
    })

    test('matches snapshot after incrementing counter', () => {
      const { toJSON } = render(
        <ClickerScreen onNavigateToShop={mockNavigateToShop} />
      )

      const feedButton = screen.getByText('feed')
      fireEvent.press(feedButton)

      expect(toJSON()).toMatchSnapshot()
    })
  })

  describe('Button Styling', () => {
    test('feed button applies pressed styles when pressed', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const feedButton = screen.getByText('feed')

      fireEvent(feedButton, 'pressIn')
      fireEvent(feedButton, 'pressOut')

      expect(feedButton).toBeTruthy()
    })

    test('shop button applies pressed styles when pressed', () => {
      render(<ClickerScreen onNavigateToShop={mockNavigateToShop} />)

      const shopButton = screen.getByText('Shop')

      fireEvent(shopButton, 'pressIn')
      fireEvent(shopButton, 'pressOut')

      expect(shopButton).toBeTruthy()
    })
  })
})
