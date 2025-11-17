import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameState } from '../../shared/hooks/useGameState';
import { observer } from '@legendapp/state/react';

interface ClickerScreenProps {
  onNavigateToShop: () => void;
}

export const ClickerScreen = observer(function ClickerScreen({
  onNavigateToShop
}: ClickerScreenProps) {
  const { petCount$, scrap$, scrapRate$ } = useGameState();

  // Scrap generation timer
  useEffect(() => {
    const interval = setInterval(() => {
      const rate = scrapRate$.get();
      scrap$.set(prev => prev + rate);
    }, 1000); // 1 second interval

    return () => clearInterval(interval); // Cleanup on unmount
  }, []); // Empty deps: timer runs for component lifetime

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${petCount$.get()}`}
        >
          Singularity Pet Count: {petCount$.get()}
        </Text>

        <Text
          style={styles.scrapText}
          accessibilityRole="text"
          accessibilityLabel={`Scrap: ${scrap$.get()}, generating ${scrapRate$.get()} per second`}
        >
          Scrap: {scrap$.get()} (+{scrapRate$.get()}/sec)
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => petCount$.set(prev => prev + 1)}
          accessibilityRole="button"
          accessibilityLabel="feed button"
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>

        <Pressable
          style={styles.shopButton}
          onPress={onNavigateToShop}
          accessibilityRole="button"
          accessibilityLabel="Open shop"
        >
          <Text style={styles.shopButtonText}>Shop</Text>
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
    marginBottom: 30,
    color: '#000000',
  },
  scrapText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#000000',
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shopButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
