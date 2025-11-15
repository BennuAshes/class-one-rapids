import React from 'react'
import { render, screen, userEvent } from '@testing-library/react-native'
import { UpgradeItem } from './UpgradeItem'
import { scrapStore } from '../../scrap/stores/scrap.store'
import { shopStore } from '../stores/shop.store'
import { UpgradeType, type Upgrade } from '../types'

describe('UpgradeItem', () => {
  const STORAGE_POUCH: Upgrade = {
    id: 'storage-pouch-1',
    name: 'Storage Pouch',
    description: 'Adds +1 scrap per pet',
    cost: 20,
    upgradeType: UpgradeType.SCRAP_PER_PET,
    effectValue: 1
  }

  const mockOnPurchase = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    scrapStore.scrap.set(0)
    shopStore.purchasedUpgrades.set([])
  })

  test('renders upgrade name and description', () => {
    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    expect(screen.getByText('Storage Pouch')).toBeTruthy()
    expect(screen.getByText('Adds +1 scrap per pet')).toBeTruthy()
  })

  test('renders cost correctly', () => {
    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    expect(screen.getByText(/20/)).toBeTruthy()
  })

  test('shows disabled purchase button when insufficient scrap', () => {
    scrapStore.scrap.set(10) // Less than cost of 20

    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    expect(purchaseButton).toBeDisabled()
  })

  test('shows enabled purchase button when sufficient scrap', () => {
    scrapStore.scrap.set(25) // More than cost of 20

    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    expect(purchaseButton).toBeEnabled()
  })

  test('calls onPurchase when purchase button tapped with sufficient scrap', async () => {
    scrapStore.scrap.set(25)
    const user = userEvent.setup()

    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    await user.press(purchaseButton)

    expect(mockOnPurchase).toHaveBeenCalledWith('storage-pouch-1')
  })

  test('shows "Purchased" badge when upgrade is owned', () => {
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    expect(screen.getByText(/purchased|owned/i)).toBeTruthy()
  })

  test('disables purchase button when upgrade is already purchased', () => {
    scrapStore.scrap.set(50)
    shopStore.purchasedUpgrades.set(['storage-pouch-1'])

    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase/i })
    expect(purchaseButton).toBeDisabled()
  })

  test('has accessible labels for screen readers', () => {
    scrapStore.scrap.set(25)

    render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    const purchaseButton = screen.getByRole('button', { name: /purchase storage pouch for 20 scrap/i })
    expect(purchaseButton).toBeTruthy()
  })

  test('visual distinction for unaffordable upgrade', () => {
    scrapStore.scrap.set(10)

    const { getByTestId } = render(<UpgradeItem upgrade={STORAGE_POUCH} onPurchase={mockOnPurchase} />)

    const itemContainer = getByTestId('upgrade-item-container')
    const style = itemContainer.props.style

    // Check for opacity in style array
    const hasOpacity = Array.isArray(style)
      ? style.some(s => s && s.opacity !== undefined)
      : style && style.opacity !== undefined

    expect(hasOpacity).toBe(true)
  })
})
