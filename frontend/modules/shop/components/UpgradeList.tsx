import React, { useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Memo } from '@legendapp/state/react'
import { shopStore } from '../stores/shop.store'
import { useShopActions } from '../useShopActions'
import { UpgradeItem } from './UpgradeItem'

export function UpgradeList() {
  const { purchaseUpgrade } = useShopActions()

  const handlePurchase = useCallback((upgradeId: string) => {
    const result = purchaseUpgrade(upgradeId)
    // Purchase result handled by state changes (purchased upgrades, scrap balance)
    // Error states shown via disabled buttons
  }, [purchaseUpgrade])

  return (
    <Memo>
      {() => {
        const availableUpgrades = shopStore.availableUpgrades.get()

        if (availableUpgrades.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No upgrades available</Text>
            </View>
          )
        }

        return (
          <ScrollView
            testID="upgrade-list-scroll"
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
          >
            {availableUpgrades.map(upgrade => (
              <UpgradeItem
                key={upgrade.id}
                upgrade={upgrade}
                onPurchase={handlePurchase}
              />
            ))}
          </ScrollView>
        )
      }}
    </Memo>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  contentContainer: {
    padding: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center'
  }
})
