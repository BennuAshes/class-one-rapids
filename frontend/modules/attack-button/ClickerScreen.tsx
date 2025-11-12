import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Memo } from '@legendapp/state/react'
import { usePersistedCounter } from './hooks/usePersistedCounter'
import { formatNumber } from './utils/formatNumber'

/**
 * Main clicker screen component
 *
 * Displays a feed button and counter showing Singularity Pet Count.
 * Uses fine-grained reactivity with Legend-State for optimal performance.
 */
export function ClickerScreen() {
  // Get counter state and actions from hook
  const { count$, actions } = usePersistedCounter('singularity-pet-count-v1', 0)

  return (
    <View style={styles.container}>
      {/* Counter Display - Only re-renders when count changes */}
      <Memo>
        {() => (
          <Text style={styles.counterText}>
            Singularity Pet Count: {formatNumber(count$.get())}
          </Text>
        )}
      </Memo>

      {/* Feed Button */}
      <TouchableOpacity
        style={styles.feedButton}
        onPress={actions.increment}
        activeOpacity={0.7}
        accessibilityLabel="Feed button"
        accessibilityHint="Tap to increase Singularity Pet Count"
        accessibilityRole="button"
      >
        <Text style={styles.feedButtonText}>Feed</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  counterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
})
