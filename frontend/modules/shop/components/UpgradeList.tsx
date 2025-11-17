import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Memo, For } from '@legendapp/state/react';
import type { Observable } from '@legendapp/state';
import type { Upgrade } from '../types/upgrade';
import { UpgradeItem } from './UpgradeItem';

export interface UpgradeListProps {
  upgrades$: Observable<Upgrade[]>;
  purchasedUpgrades$: Observable<Set<string>>;
  currentScrap$: Observable<number>;
  onPurchase: (upgradeId: string, cost: number) => boolean;
}

/**
 * UpgradeList - Scrollable list of available upgrades
 *
 * Features:
 * - FlatList with virtualization for performance
 * - Empty state when no upgrades available
 * - Filters out purchased upgrades
 * - Passes purchase action to individual items
 */
export function UpgradeList({
  upgrades$,
  purchasedUpgrades$,
  currentScrap$,
  onPurchase
}: UpgradeListProps): JSX.Element {
  return (
    <View style={styles.container} testID="upgrade-list">
      <Memo>
        {() => {
          const upgrades = upgrades$.get();
          const purchased = purchasedUpgrades$.get();
          const filtered = upgrades.filter(u => !purchased.has(u.id));

          if (filtered.length === 0) {
            return (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upgrades available yet.</Text>
                <Text style={styles.emptySubtext}>Check back soon!</Text>
              </View>
            );
          }

          return (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const currentScrap = currentScrap$.get();
                const isAffordable = currentScrap >= item.cost;

                return (
                  <UpgradeItem
                    upgrade={item}
                    isPurchased={false}
                    isAffordable={isAffordable}
                    onPurchase={() => onPurchase(item.id, item.cost)}
                  />
                );
              }}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          );
        }}
      </Memo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
