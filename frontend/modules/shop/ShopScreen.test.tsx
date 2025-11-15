import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ShopScreen } from './ShopScreen'
import { scrapStore } from '../scrap/stores/scrap.store'
import { shopStore } from './stores/shop.store'
import { UpgradeType, type Upgrade } from './types'

describe('ShopScreen', () => {
  const STORAGE_POUCH: Upgrade = {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  }

  beforeEach(() => {
    // Reset scrap balance and shop state before each test
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set([STORAGE_POUCH])
  })

  test('displays shop header', () => {
    // RED: This test will fail initially (ShopScreen doesn't exist)
    render(<ShopScreen />)

    expect(screen.getByText(/shop/i)).toBeTruthy()
  })

  test('displays scrap balance in header', () => {
    scrapStore.scrap.set(250)

    render(<ShopScreen />)

    // Should show scrap balance in header format "Scrap: 250"
    expect(screen.getByText(/scrap: 250/i)).toBeTruthy()
  })

  test('has shop-screen testID', () => {
    render(<ShopScreen />)

    expect(screen.getByTestId('shop-screen')).toBeTruthy()
  })

  test('displays upgrade list with available upgrades', () => {
    render(<ShopScreen />)

    expect(screen.getByText('Storage Pouch')).toBeTruthy()
    expect(screen.getByText(/adds \+1 scrap per pet/i)).toBeTruthy()
  })

  test('shows empty state when no upgrades available', () => {
    shopStore.availableUpgrades.set([])

    render(<ShopScreen />)

    expect(screen.getByText(/no upgrades available/i)).toBeTruthy()
  })
})
