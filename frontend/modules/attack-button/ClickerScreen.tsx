import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { usePersistedCounter } from './usePersistedCounter';
import { useScrapGeneration } from '../scrap/useScrapGeneration';
import { formatNumber } from '../scrap/formatNumber';
import { useNavigation } from '../../shared/hooks/useNavigation';

/**
 * Main clicker game screen.
 * Displays a counter and feed button. Each tap increments the counter.
 * Counter value persists across app sessions.
 */
export function ClickerScreen() {
  const { count$, actions } = usePersistedCounter();
  const { scrap$ } = useScrapGeneration(count$);
  const { actions: navActions } = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Memo>
          {() => (
            <Text
              style={styles.counterText}
              accessibilityRole="text"
              accessibilityLabel={`Singularity Pet Count: ${count$.get()}`}
            >
              Singularity Pet Count: {count$.get()}
            </Text>
          )}
        </Memo>
      </View>

      {/* Scrap Display */}
      <View style={styles.scrapContainer}>
        <Memo>
          {() => (
            <Text
              style={styles.scrapText}
              accessibilityRole="text"
              accessibilityLabel={`Scrap collected: ${formatNumber(scrap$.get())}`}
            >
              Scrap: {formatNumber(scrap$.get())}
            </Text>
          )}
        </Memo>
        <Text style={styles.helperText}>
          AI Pets collect scrap automatically (no use yet)
        </Text>
      </View>

      <Pressable
        testID="feed-button"
        style={({ pressed }) => [
          styles.feedButton,
          pressed && styles.feedButtonPressed,
        ]}
        onPress={actions.increment}
        accessibilityRole="button"
        accessibilityLabel="Feed button"
        accessibilityHint="Tap to increase the Singularity Pet count by one"
      >
        <Text style={styles.feedButtonText}>feed</Text>
      </Pressable>

      {/* Shop Button */}
      <Pressable
        style={({ pressed }) => [
          styles.shopButton,
          pressed && styles.shopButtonPressed,
        ]}
        onPress={navActions.navigateToShop}
        accessibilityRole="button"
        accessibilityLabel="Shop"
        accessibilityHint="Navigate to the shop to purchase upgrades"
      >
        <Text style={styles.shopButtonText}>Shop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  counterContainer: {
    marginBottom: 40,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  scrapContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  scrapText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  feedButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedButtonPressed: {
    opacity: 0.7,
  },
  feedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shopButton: {
    marginTop: 20,
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    minHeight: 44,
  },
  shopButtonPressed: {
    opacity: 0.7,
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
