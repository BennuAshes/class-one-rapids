import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Memo } from '@legendapp/state/react';
import { usePersistedCounter } from './usePersistedCounter';

/**
 * Main clicker game screen.
 * Displays a counter and feed button. Each tap increments the counter.
 * Counter value persists across app sessions.
 */
export function ClickerScreen() {
  const { count$, actions } = usePersistedCounter();

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
});
