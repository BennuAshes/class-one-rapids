import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export function SingularityPet() {
  const [count, setCount] = useState<number>(0);

  const handleFeed = () => {
    // Use functional update to prevent race conditions during rapid clicking
    setCount(prevCount => prevCount + 1);
  };

  return (
    <View style={styles.container}>
      <Text
        style={styles.countText}
        accessibilityLabel={`Singularity Pet Count: ${count}`}
      >
        Singularity Pet Count: {count}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.feedButton,
          pressed && styles.feedButtonPressed
        ]}
        onPress={handleFeed}
        accessibilityRole="button"
        accessibilityLabel="Feed the singularity pet"
        accessibilityHint="Increases the pet count by one"
      >
        <Text style={styles.buttonText}>feed</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  countText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  feedButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
    minHeight: 44, // Meets WCAG minimum touch target
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedButtonPressed: {
    backgroundColor: '#0051D5', // Darker shade for pressed state
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
