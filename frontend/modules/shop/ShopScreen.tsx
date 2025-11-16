import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { computed } from '@legendapp/state';
import { useNavigation } from '../../shared/hooks/useNavigation';
import { usePersistedCounter } from '../attack-button/usePersistedCounter';
import { useScrapGeneration } from '../scrap/useScrapGeneration';
import { useUpgrades } from './useUpgrades';
import { formatNumber } from '../scrap/formatNumber';
import { UpgradeListItem } from './UpgradeListItem';
import { Upgrade } from './upgradeDefinitions';

/**
 * Shop screen component for displaying and purchasing upgrades.
 * Integrates with the clicker system to access scrap balance and enable purchases.
 */
export function ShopScreen() {
  const { actions: navActions } = useNavigation();
  const { count$ } = usePersistedCounter();
  const { scrap$ } = useScrapGeneration(count$);
  const { availableUpgrades$, actions } = useUpgrades(scrap$);

  const handlePurchase = (upgradeId: string) => {
    const success = actions.purchase(upgradeId);
    if (success) {
      console.log(`Successfully purchased upgrade: ${upgradeId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={navActions.navigateToClicker}
          accessibilityRole="button"
          accessibilityLabel="Back to clicker screen"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Available Upgrades</Text>

      <Memo>
        {() => (
          <Text style={styles.scrapBalance}>
            Scrap: {formatNumber(scrap$.get())}
          </Text>
        )}
      </Memo>

      <Memo>
        {() => {
          const upgrades = availableUpgrades$.get();
          return (
            <FlatList
              data={upgrades}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isAffordable$ = computed(
                  () => scrap$.get() >= item.cost
                );
                return (
                  <UpgradeListItem
                    upgrade={item}
                    isAffordable$={isAffordable$}
                    onPurchase={handlePurchase}
                  />
                );
              }}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No upgrades available. You've purchased them all!
                </Text>
              }
            />
          );
        }}
      </Memo>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrapBalance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 40,
  },
});
