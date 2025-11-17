import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';
import { Upgrade } from '../../shared/types/game';

/**
 * Props for the ShopScreen component.
 */
interface ShopScreenProps {
  /** Callback function to navigate back to the main screen */
  onNavigateBack: () => void;
}

/**
 * Empty state component displayed when no upgrades are available.
 */
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateTitle}>
      No upgrades available yet.
    </Text>
    <Text style={styles.emptyStateSubtitle}>
      Check back soon for new upgrades!
    </Text>
  </View>
);

/**
 * Props for the UpgradeCard component.
 */
interface UpgradeCardProps {
  /** The upgrade to display */
  upgrade: Upgrade;
  /** Whether the upgrade has been purchased */
  isOwned: boolean;
  /** Whether the upgrade can be purchased (enough scrap and not owned) */
  canPurchase: boolean;
  /** Callback function to execute the purchase */
  onPurchase: () => void;
  /** Label text for the purchase button */
  buttonLabel: string;
}

/**
 * Displays a single upgrade card with purchase button.
 */
const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  isOwned,
  canPurchase,
  onPurchase,
  buttonLabel,
}) => {
  const cardOpacity = isOwned ? 0.6 : 1;

  return (
    <View style={[styles.card, { opacity: cardOpacity }]}>
      <Text style={styles.upgradeName}>{upgrade.name}</Text>
      <Text style={styles.upgradeDescription}>{upgrade.description}</Text>

      <View style={styles.effectContainer}>
        <Text style={styles.effectLabel}>
          Effect: {upgrade.effectType === 'scrapMultiplier'
            ? `Scrap Multiplier x${upgrade.effectValue}`
            : `Pet Bonus +${upgrade.effectValue}`
          }
        </Text>
      </View>

      <View style={styles.costContainer}>
        <Text style={styles.costLabel}>
          Cost: {upgrade.cost} scrap
        </Text>
      </View>

      <Pressable
        onPress={onPurchase}
        disabled={!canPurchase}
        accessibilityRole="button"
        accessibilityLabel={`Buy ${upgrade.name} for ${upgrade.cost} scrap`}
        accessibilityHint={canPurchase ? 'Double tap to purchase' : undefined}
        accessibilityState={{ disabled: !canPurchase }}
        style={({ pressed }) => [
          styles.purchaseButton,
          isOwned && styles.purchaseButtonOwned,
          !canPurchase && !isOwned && styles.purchaseButtonDisabled,
          pressed && canPurchase && styles.purchaseButtonPressed,
        ]}
      >
        <Text
          style={[
            styles.purchaseButtonText,
            isOwned && styles.purchaseButtonTextOwned,
            !canPurchase && !isOwned && styles.purchaseButtonTextDisabled,
          ]}
        >
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
};

/**
 * ShopScreen component displays the upgrade shop interface.
 *
 * Allows players to browse and purchase upgrades using scrap currency.
 * Integrates with gameState$ observable for reactive state management.
 *
 * @param props - Component props
 * @param props.onNavigateBack - Callback to return to main screen
 *
 * @example
 * ```typescript
 * <ShopScreen onNavigateBack={() => setCurrentScreen('main')} />
 * ```
 */
export const ShopScreen = observer(({ onNavigateBack }: ShopScreenProps) => {
  const { scrap$, upgrades$, purchasedUpgrades$ } = useGameState();
  const scrap = scrap$.get();
  const upgrades = upgrades$.get();
  const purchasedUpgrades = purchasedUpgrades$.get();

  /**
   * Checks if an upgrade has been purchased.
   * @param upgradeId - The ID of the upgrade to check
   * @returns True if the upgrade is owned
   */
  const isOwned = (upgradeId: string): boolean => {
    return purchasedUpgrades.includes(upgradeId);
  };

  /**
   * Determines if an upgrade can be purchased.
   * @param upgrade - The upgrade to check
   * @returns True if the player has enough scrap and doesn't own the upgrade
   */
  const canPurchase = (upgrade: Upgrade): boolean => {
    return !isOwned(upgrade.id) && scrap >= upgrade.cost;
  };

  /**
   * Gets the appropriate button label based on upgrade state.
   * @param upgrade - The upgrade to get the label for
   * @returns "Owned", "Not enough scrap", or "Buy"
   */
  const getButtonLabel = (upgrade: Upgrade): string => {
    if (isOwned(upgrade.id)) {
      return 'Owned';
    }
    if (scrap < upgrade.cost) {
      return 'Not enough scrap';
    }
    return 'Buy';
  };

  /**
   * Handles the purchase of an upgrade.
   * Validates ownership and scrap before executing the purchase.
   * @param upgrade - The upgrade to purchase
   */
  const handlePurchase = (upgrade: Upgrade): void => {
    // Validation: prevent purchasing already owned upgrades
    if (isOwned(upgrade.id)) {
      console.warn('Upgrade already owned:', upgrade.id);
      return;
    }

    // Validation: ensure player has enough scrap
    if (scrap < upgrade.cost) {
      console.warn('Insufficient scrap for upgrade:', upgrade.id);
      return;
    }

    // Execute purchase: deduct scrap and add to purchased list
    scrap$.set((prev) => prev - upgrade.cost);
    purchasedUpgrades$.set((prev) => [...prev, upgrade.id]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onNavigateBack}
          accessibilityRole="button"
          accessibilityLabel="Back to main screen"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Shop</Text>

        <View style={styles.scrapContainer}>
          <Text style={styles.scrapLabel}>Scrap:</Text>
          <Text style={styles.scrapValue}>{scrap}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {upgrades.length === 0 ? (
          <EmptyState />
        ) : (
          upgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              isOwned={isOwned(upgrade.id)}
              canPurchase={canPurchase(upgrade)}
              onPurchase={() => handlePurchase(upgrade)}
              buttonLabel={getButtonLabel(upgrade)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  scrapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrapLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  scrapValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  effectContainer: {
    marginBottom: 8,
  },
  effectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  costContainer: {
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34C759',
  },
  purchaseButton: {
    minWidth: 44,
    minHeight: 44,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  purchaseButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  purchaseButtonOwned: {
    backgroundColor: '#4CAF50',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  purchaseButtonTextDisabled: {
    color: '#999999',
  },
  purchaseButtonTextOwned: {
    color: '#FFFFFF',
  },
});
