import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Memo } from '@legendapp/state/react';
import { useNavigation } from '../../shared/hooks/useNavigation';
import { usePersistedCounter } from '../attack-button/hooks/usePersistedCounter';
import { useUpgrades } from './hooks/useUpgrades';
import { UpgradeList } from './components/UpgradeList';

/**
 * ShopScreen - Shop interface for viewing and purchasing upgrades
 *
 * Displays:
 * - Current scrap balance
 * - List of available upgrades
 * - Back button to return to clicker screen
 */
export function ShopScreen(): JSX.Element {
  const { actions: navActions } = useNavigation();
  const { count$: scrap$ } = usePersistedCounter('scrap-balance');
  const upgradesHook = useUpgrades();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={navActions.navigateToClicker}
          accessibilityRole="button"
          accessibilityLabel="Back to Clicker"
          testID="back-button"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Shop</Text>

        <View style={styles.scrapDisplay}>
          <Memo>
            {() => (
              <Text
                accessibilityRole="text"
                accessibilityLabel={`Scrap balance: ${scrap$.get()}`}
              >
                <Text style={styles.scrapLabel}>Scrap: </Text>
                <Text style={styles.scrapValue}>{scrap$.get()}</Text>
              </Text>
            )}
          </Memo>
        </View>
      </View>

      <UpgradeList
        upgrades$={upgradesHook.filteredUpgrades$}
        purchasedUpgrades$={upgradesHook.purchasedUpgrades$}
        currentScrap$={scrap$}
        onPurchase={upgradesHook.actions.purchaseUpgrade}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#111827',
  },
  scrapDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#34D399',
  },
  scrapLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    color: '#111827',
  },
  scrapValue: {
    fontSize: 20,
    color: '#34D399',
    fontWeight: 'bold',
  },
});
