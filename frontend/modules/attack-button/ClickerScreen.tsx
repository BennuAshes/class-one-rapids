import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Memo } from '@legendapp/state/react';
import { usePersistedCounter } from './hooks/usePersistedCounter';
import { useNavigation } from '../../shared/hooks/useNavigation';

export function ClickerScreen(): JSX.Element {
  const { count$, actions } = usePersistedCounter('singularity-pet-count');
  const { count$: scrap$, actions: scrapActions } = usePersistedCounter('scrap-balance');
  const { actions: navActions } = useNavigation();

  const handleFeed = () => {
    actions.increment();
    scrapActions.increment(); // Grant 1 scrap per feed (base rate)
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Memo>
          {() => (
            <Text
              style={styles.counterText}
              accessibilityRole="text"
            >
              Singularity Pet Count: {count$.get()}
            </Text>
          )}
        </Memo>

        <View style={styles.scrapContainer}>
          <Text style={styles.scrapLabel}>Scrap:</Text>
          <Memo>
            {() => <Text style={styles.scrapValue}>{scrap$.get()}</Text>}
          </Memo>
        </View>

        <Pressable
          onPress={handleFeed}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Feed"
          testID="feed-button"
        >
          <Text style={styles.buttonText}>Feed</Text>
        </Pressable>

        <Pressable
          style={styles.shopButton}
          onPress={navActions.navigateToShop}
          accessibilityRole="button"
          accessibilityLabel="Open Shop"
        >
          <Text style={styles.shopButtonText}>Shop</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: '#34D399',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  scrapLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  scrapValue: {
    fontSize: 18,
    color: '#34D399',
    fontWeight: 'bold',
  },
});
