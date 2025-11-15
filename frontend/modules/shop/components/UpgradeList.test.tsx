import React from 'react'
import { render, screen, userEvent } from '@testing-library/react-native'
import { UpgradeList } from './UpgradeList'
import { scrapStore } from '../../scrap/stores/scrap.store'
import { shopStore } from '../stores/shop.store'
import { UpgradeType, type Upgrade } from '../types'

describe('UpgradeList', () => {
  const UPGRADES: Upgrade[] = [
    {
      id: 'storage-pouch-1',
      name: 'Storage Pouch',
      description: 'Adds +1 scrap per pet',
      cost: 20,
      upgradeType: UpgradeType.SCRAP_PER_PET,
      effectValue: 1
    },
    {
      id: 'pet-feeder-1',
      name: 'Pet Feeder',
      description: 'Adds +1 pet per feed',
      cost: 50,
      upgradeType: UpgradeType.PETS_PER_FEED,
      effectValue: 1
    }
  ]

  beforeEach(() => {
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set([])
    shopStore.availableUpgrades.set(UPGRADES)
  })

  test('renders all available upgrades', () => {
    render(<UpgradeList />)

    expect(screen.getByText('Storage Pouch')).toBeTruthy()
    expect(screen.getByText('Pet Feeder')).toBeTruthy()
  })

  test('shows empty state when no upgrades available', () => {
    shopStore.availableUpgrades.set([])

    render(<UpgradeList />)

    expect(screen.getByText(/no upgrades available/i)).toBeTruthy()
  })

  test('handles purchase action', async () => {
    scrapStore.scrap.set(25)
    const user = userEvent.setup()

    render(<UpgradeList />)

    const purchaseButtons = screen.getAllByRole('button', { name: /purchase/i })
    await user.press(purchaseButtons[0]) // Purchase Storage Pouch

    expect(shopStore.purchasedUpgrades.get()).toContain('storage-pouch-1')
    expect(scrapStore.scrap.get()).toBe(5) // 25 - 20
  })

  test('shows success feedback after purchase', async () => {
    scrapStore.scrap.set(25)
    const user = userEvent.setup()

    render(<UpgradeList />)

    const purchaseButtons = screen.getAllByRole('button', { name: /purchase/i })
    await user.press(purchaseButtons[0])

    // Should show "Purchased" badge
    expect(screen.getByText(/purchased/i)).toBeTruthy()
  })

  test('shows error feedback for failed purchase', async () => {
    scrapStore.scrap.set(10) // Insufficient for Storage Pouch (cost 20)
    const user = userEvent.setup()

    render(<UpgradeList />)

    const purchaseButtons = screen.getAllByRole('button', { name: /purchase/i })

    // Button should be disabled
    expect(purchaseButtons[0]).toBeDisabled()
  })

  test('renders upgrades in scrollable list', () => {
    const { getByTestId } = render(<UpgradeList />)

    const scrollView = getByTestId('upgrade-list-scroll')
    expect(scrollView).toBeTruthy()
  })
})
