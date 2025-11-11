import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePersistedState } from './usePersistedState';

const STORAGE_KEY = 'singularityPetCount';

export const ClickerScreen = () => {
  const [count, setCount] = usePersistedState(STORAGE_KEY);

  const handleFeed = () => {
    setCount(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text
        style={styles.counter}
        accessibilityLabel="Singularity Pet Count"
        accessibilityValue={{ text: count.toString() }}
        accessibilityLiveRegion="polite"
      >
        Singularity Pet Count: {count}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleFeed}
        accessibilityRole="button"
        accessibilityLabel="Feed"
        accessibilityHint="Tap to feed your Singularity Pet"
      >
        <Text style={styles.buttonText}>Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  counter: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 44,  // WCAG accessibility minimum
    minHeight: 44,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
