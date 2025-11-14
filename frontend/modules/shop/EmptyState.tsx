import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * Empty state component for shop
 *
 * Displayed when no upgrades are available for purchase.
 */
export function EmptyState({ message = 'Upgrades coming soon!' }: { message?: string } = {}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔜</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>Check back later for new upgrades</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
})
