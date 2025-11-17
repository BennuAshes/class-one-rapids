import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';
import { totalScrapMultiplier$, totalPetBonus$ } from '../../shared/store/gameStore';

interface AttackButtonScreenProps {
  onNavigateToShop: () => void;
}

/**
 * Main screen for the Attack Button (Singularity Pet feeding) feature.
 * Displays a counter and a button to increment it.
 * Integrates with upgrade system for scrap multipliers and pet bonuses.
 */
export const AttackButtonScreen = observer(({ onNavigateToShop }: AttackButtonScreenProps) => {
  const { petCount$, scrap$ } = useGameState();

  /**
   * Handles feeding the Singularity Pet.
   * Base gain is 1 pet, plus any pet bonus from purchased upgrades.
   */
  const handleFeed = () => {
    const bonus = totalPetBonus$.get();
    const petsToAdd = 1 + bonus;
    petCount$.set((prev) => prev + petsToAdd);
  };

  /**
   * Scrap generation timer with multiplier support
   *
   * Generates scrap passively based on current petCount.
   * Base rate: 1 scrap per pet per second
   * Multiplier: Applied from purchased scrap efficiency upgrades
   *
   * Formula: petCount * (1 + totalScrapMultiplier)
   * Example: With 10 pets and 0.25 multiplier (25%), generates 12.5 scrap/sec
   *
   * Timer runs for the entire component lifetime (empty dependency array).
   * Uses .get() to read latest values on each tick (no need to depend on observables).
   * Updates scrap using functional update to avoid race conditions.
   * Cleanup function ensures timer is cleared on unmount.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const petCount = petCount$.get(); // Read current pet count
      const multiplier = totalScrapMultiplier$.get(); // Read current scrap multiplier
      const scrapGenerated = petCount * (1 + multiplier); // Apply multiplier

      // Only update state if scrap would actually be generated
      // This avoids unnecessary state updates, re-renders, and saves when petCount = 0
      if (scrapGenerated > 0) {
        scrap$.set((prev) => prev + scrapGenerated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - timer persists for component lifetime

  const petCount = petCount$.get();
  const scrap = scrap$.get();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${petCount}`}
        >
          Singularity Pet Count: {petCount}
        </Text>

        <Text
          style={styles.scrapText}
          accessibilityRole="text"
          accessibilityLabel={`Scrap: ${scrap}`}
        >
          Scrap: {scrap}
        </Text>

        <Pressable
          onPress={onNavigateToShop}
          accessibilityRole="button"
          accessibilityLabel="Shop"
          accessibilityHint="Tap to browse and purchase upgrades"
          style={({ pressed }) => [
            styles.shopButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.shopButtonText}>Shop</Text>
        </Pressable>

        <Pressable
          onPress={handleFeed}
          accessibilityRole="button"
          accessibilityLabel="feed button"
          accessibilityHint="Tap to feed your Singularity Pet and increase the count"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  counterText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#000000',
  },
  scrapText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#000000',
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shopButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#34C759',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
