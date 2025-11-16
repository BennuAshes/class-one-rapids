import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ClickerScreenProps {
  onNavigateToShop: () => void
}

export function ClickerScreen({ onNavigateToShop }: ClickerScreenProps) {
  const [count, setCount] = useState(0)

  const handleFeed = () => {
    setCount(prevCount => prevCount + 1)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Header Section - Counter Display */}
        <View style={styles.header}>
          <Text style={styles.counterLabel}>
            Singularity Pet Count: {count}
          </Text>
        </View>

        {/* Content Section - Feed Button */}
        <View style={styles.feedSection}>
          <Pressable
            onPress={handleFeed}
            style={({ pressed }) => [
              styles.feedButton,
              pressed && styles.feedButtonPressed
            ]}
            accessibilityRole="button"
            accessibilityLabel="Feed the Singularity Pet"
            accessibilityHint="Tap to feed and increase the pet count by 1"
          >
            <Text style={styles.feedButtonText}>feed</Text>
          </Pressable>
        </View>

        {/* Footer Section - Navigation */}
        <View style={styles.footer}>
          <Pressable
            onPress={onNavigateToShop}
            style={({ pressed }) => [
              styles.navButton,
              pressed && styles.navButtonPressed
            ]}
            accessibilityRole="button"
            accessibilityLabel="Navigate to shop"
          >
            <Text style={styles.navButtonText}>Shop</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  feedSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedButton: {
    minWidth: 200,
    minHeight: 80,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  feedButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  feedButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  navButton: {
    minWidth: 120,
    minHeight: 44,
    backgroundColor: '#34C759',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navButtonPressed: {
    opacity: 0.7,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
