import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { observer } from '@legendapp/state/react'
import { scrapStore } from '../scrap/stores/scrap.store'
import { EmptyState } from './EmptyState'

/**
 * Shop screen component
 *
 * Displays upgrades available for purchase with scrap currency.
 * Shows current scrap balance in header.
 */
export const ShopScreen = observer(({ onBack }: { onBack?: () => void } = {}) => {
  const scrap = scrapStore.scrap.get()

  return (
    <View testID="shop-screen" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack && (
            <TouchableOpacity
              testID="back-button"
              style={styles.backButton}
              onPress={onBack}
              accessibilityLabel="Back button"
              accessibilityHint="Return to main screen"
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Shop</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.scrapBalance}>Scrap: {scrap}</Text>
      </View>
      <EmptyState />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 60, // Account for status bar
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 68, // Match back button width for centering
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  scrapBalance: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
})
