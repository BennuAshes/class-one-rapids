import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Upgrade } from '../types/upgrade';

export interface UpgradeItemProps {
  upgrade: Upgrade;
  isPurchased: boolean;
  isAffordable: boolean;
  onPurchase: () => void;
}

/**
 * UpgradeItem - Individual upgrade card with purchase button
 *
 * Displays:
 * - Upgrade name and description
 * - Cost in scrap
 * - Purchase button (disabled if unaffordable or already purchased)
 *
 * Visual states:
 * - Normal: Full opacity, green purchase button
 * - Unaffordable: Reduced opacity, disabled button
 * - Purchased: "Owned" badge, disabled button
 */
export const UpgradeItem = React.memo(function UpgradeItem({
  upgrade,
  isPurchased,
  isAffordable,
  onPurchase
}: UpgradeItemProps): JSX.Element {
  const isDisabled = isPurchased || !isAffordable;

  return (
    <View
      style={[
        styles.container,
        !isAffordable && styles.unaffordable
      ]}
      testID="upgrade-item"
    >
      <View style={styles.info}>
        <Text style={styles.name}>{upgrade.name}</Text>
        <Text style={styles.description}>{upgrade.description}</Text>
        <Text style={styles.cost}>{upgrade.cost} scrap</Text>
      </View>

      <Pressable
        style={[
          styles.button,
          isDisabled && styles.buttonDisabled
        ]}
        onPress={onPurchase}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={isPurchased ? "Owned" : "Purchase"}
      >
        <Text style={[
          styles.buttonText,
          isDisabled && styles.buttonTextDisabled
        ]}>
          {isPurchased ? 'Owned' : 'Purchase'}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    opacity: 1,
  },
  unaffordable: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34D399',
  },
  button: {
    backgroundColor: '#34D399',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});
