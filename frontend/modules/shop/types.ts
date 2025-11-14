/**
 * Shop Module Type Definitions
 *
 * Defines upgrade schema and shop state types for the upgrade shop system.
 */

/**
 * Upgrade effect types
 *
 * SCRAP_PER_PET: Increases scrap gained per pet when feeding
 * PETS_PER_FEED: Increases number of pets gained per feed action
 */
export enum UpgradeType {
  SCRAP_PER_PET = 'SCRAP_PER_PET',
  PETS_PER_FEED = 'PETS_PER_FEED'
}

/**
 * Upgrade entity
 *
 * Represents a single purchasable upgrade in the shop.
 * Effects are additive (not multiplicative) for MVP simplicity.
 */
export interface Upgrade {
  /** Unique identifier */
  id: string

  /** Display name shown to user */
  name: string

  /** Player-facing description of what upgrade does */
  description: string

  /** Scrap cost to purchase */
  cost: number

  /** Category of effect this upgrade provides */
  upgradeType: UpgradeType

  /** Numeric value to add (additive effect) */
  effectValue: number

  /** Optional icon identifier for future use */
  iconName?: string
}

/**
 * Shop state interface
 *
 * Manages available upgrades and purchase tracking
 */
export interface ShopState {
  /** All upgrades that can be purchased */
  availableUpgrades: Upgrade[]

  /** IDs of upgrades that have been purchased */
  purchasedUpgrades: string[]

  /** Timestamp of last purchase (for analytics) */
  lastPurchaseTime: number
}

/**
 * Purchase result
 *
 * Returned from purchase actions to indicate success/failure
 */
export interface PurchaseResult {
  success: boolean
  error?: 'INSUFFICIENT_FUNDS' | 'ALREADY_PURCHASED' | 'INVALID_UPGRADE'
}

/**
 * Mock upgrade for testing
 *
 * Example upgrade demonstrating the schema structure
 */
export const mockUpgrade: Upgrade = {
  id: 'test-upgrade-1',
  name: 'Test Upgrade',
  description: 'A test upgrade for development',
  cost: 100,
  upgradeType: UpgradeType.SCRAP_PER_PET,
  effectValue: 5
}
