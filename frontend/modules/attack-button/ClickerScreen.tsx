import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Memo } from '@legendapp/state/react'
import { usePersistedCounter } from './hooks/usePersistedCounter'
import { useUpgradeBonuses } from '../shop/useUpgradeBonuses'
import { formatNumber } from './utils/formatNumber'
import { ScrapCounter } from '../scrap/ScrapCounter'

/**
 * Main clicker screen component
 *
 * Displays a feed button and counter showing Singularity Pet Count.
 * Uses fine-grained reactivity with Legend-State for optimal performance.
 */
export function ClickerScreen({
  storageKey = 'singularity-pet-count-v1',
  onNavigateToShop
}: {
  storageKey?: string
  onNavigateToShop?: () => void
} = {}) {
  // Get counter state and actions from hook
  const { count$, actions } = usePersistedCounter(storageKey, 0)
  const { petsPerFeedBonus$ } = useUpgradeBonuses()

  // Feed button handler with bonus
  const handleFeedPress = useCallback(() => {
    const bonus = petsPerFeedBonus$.get()
    actions.incrementBy(1 + bonus)
  }, [petsPerFeedBonus$, actions])

  return (
    <View style={styles.container}>
      {/* Scrap Counter - Positioned at top */}
      <View style={styles.scrapCounterContainer}>
        <Memo>
          {() => <ScrapCounter petCount={count$.get()} style={styles.scrapCounter} />}
        </Memo>
      </View>

      {/* Counter Display - Only re-renders when count changes */}
      <Memo>
        {() => (
          <Text style={styles.counterText}>
            Singularity Pet Count: {formatNumber(count$.get())}
          </Text>
        )}
      </Memo>

      {/* Feed Button */}
      <TouchableOpacity
        testID="feed-button"
        style={styles.feedButton}
        onPress={handleFeedPress}
        activeOpacity={0.7}
        accessibilityLabel="Feed button"
        accessibilityHint="Tap to increase Singularity Pet Count"
        accessibilityRole="button"
      >
        <Text style={styles.feedButtonText}>Feed</Text>
      </TouchableOpacity>

      {/* Shop Button */}
      {onNavigateToShop && (
        <TouchableOpacity
          testID="shop-button"
          style={styles.shopButton}
          onPress={onNavigateToShop}
          activeOpacity={0.7}
          accessibilityLabel="Shop button"
          accessibilityHint="Open the upgrade shop"
          accessibilityRole="button"
        >
          <Text style={styles.shopButtonText}>🛒 Shop</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  scrapCounterContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  scrapCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
