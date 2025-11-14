import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ShopScreen } from './ShopScreen'
import { scrapStore } from '../scrap/stores/scrap.store'

describe('ShopScreen', () => {
  beforeEach(() => {
    // Reset scrap balance before each test
    scrapStore.scrap.set(0)
  })

  test('displays shop header', () => {
    // RED: This test will fail initially (ShopScreen doesn't exist)
    render(<ShopScreen />)

    expect(screen.getByText(/shop/i)).toBeTruthy()
  })

  test('displays scrap balance in header', () => {
    scrapStore.scrap.set(250)

    render(<ShopScreen />)

    // Should show scrap balance
    expect(screen.getByText(/250/)).toBeTruthy()
    expect(screen.getByText(/scrap/i)).toBeTruthy()
  })

  test('has shop-screen testID', () => {
    render(<ShopScreen />)

    expect(screen.getByTestId('shop-screen')).toBeTruthy()
  })
})
