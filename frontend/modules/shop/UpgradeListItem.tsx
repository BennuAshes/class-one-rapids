import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { Observable } from '@legendapp/state';
import { formatNumber } from '../scrap/formatNumber';
import { Upgrade } from './upgradeDefinitions';

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isAffordable$: Observable<boolean>;
  onPurchase: (upgradeId: string) => void;
}

/**
 * Component for displaying a single upgrade item in the shop list.
 * Shows upgrade details and purchase button with reactive affordability state.
 */
export function UpgradeListItem({
  upgrade,
  isAffordable$,
  onPurchase,
}: UpgradeListItemProps) {
  const typeColor =
    upgrade.effectType === 'scrapMultiplier' ? '#FF9500' : '#34C759';

  return (
    <View style={styles.container}>
      <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />

      <View style={styles.content}>
        <Text style={styles.name}>{upgrade.name}</Text>
        <Text style={styles.description}>{upgrade.description}</Text>
        <Text style={styles.cost}>Cost: {formatNumber(upgrade.cost)} scrap</Text>
      </View>

      <Memo>
        {() => {
          const isAffordable = isAffordable$.get();
          return (
            <Pressable
              style={({ pressed }) => [
                styles.purchaseButton,
                !isAffordable && styles.purchaseButtonDisabled,
                pressed && isAffordable && styles.purchaseButtonPressed,
              ]}
              onPress={() => onPurchase(upgrade.id)}
              disabled={!isAffordable}
              accessibilityRole="button"
              accessibilityLabel={`Purchase ${upgrade.name}`}
              accessibilityHint={`Costs ${formatNumber(upgrade.cost)} scrap`}
              accessibilityState={{ disabled: !isAffordable }}
            >
              <Text
                style={[
                  styles.purchaseButtonText,
                  !isAffordable && styles.purchaseButtonTextDisabled,
                ]}
              >
                Purchase
              </Text>
            </Pressable>
          );
        }}
      </Memo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  typeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cost: {
    fontSize: 12,
    color: '#999999',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    minHeight: 44,
    justifyContent: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  purchaseButtonPressed: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  purchaseButtonTextDisabled: {
    color: '#999999',
  },
});
