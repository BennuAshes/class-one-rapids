import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Memo } from '@legendapp/state/react'
import { scrapStore } from '../../scrap/stores/scrap.store'
import { shopStore } from '../stores/shop.store'
import type { Upgrade } from '../types'

interface UpgradeItemProps {
  upgrade: Upgrade
  onPurchase: (upgradeId: string) => void
}

export function UpgradeItem({ upgrade, onPurchase }: UpgradeItemProps) {
  return (
    <Memo>
      {() => {
        // Get reactive values inside Memo
        const currentScrap = scrapStore.scrap.get()
        const purchasedIds = shopStore.purchasedUpgrades.get()

        const affordable = currentScrap >= upgrade.cost
        const purchased = purchasedIds.includes(upgrade.id)
        const disabled = !affordable || purchased

        return (
          <View
            testID="upgrade-item-container"
            style={[
              styles.container,
              !affordable && !purchased && styles.unaffordable
            ]}
          >
            <View style={styles.infoSection}>
              <Text style={styles.name}>{upgrade.name}</Text>
              <Text style={styles.description}>{upgrade.description}</Text>
              <Text style={styles.cost}>{upgrade.cost} scrap</Text>
            </View>

            <View style={styles.actionSection}>
              {purchased && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Purchased</Text>
                </View>
              )}

              <Pressable
                role="button"
                accessibilityLabel={`Purchase ${upgrade.name} for ${upgrade.cost} scrap`}
                disabled={disabled}
                onPress={() => onPurchase(upgrade.id)}
                style={[
                  styles.button,
                  disabled && styles.buttonDisabled
                ]}
              >
                <Text style={[
                  styles.buttonText,
                  disabled && styles.buttonTextDisabled
                ]}>
                  Purchase
                </Text>
              </Pressable>
            </View>
          </View>
        )
      }}
    </Memo>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  unaffordable: {
    opacity: 0.6
  },
  infoSection: {
    flex: 1,
    marginRight: 12
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  cost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  actionSection: {
    alignItems: 'flex-end'
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 100,
    minHeight: 44 // WCAG touch target
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  buttonTextDisabled: {
    color: '#999'
  }
})
