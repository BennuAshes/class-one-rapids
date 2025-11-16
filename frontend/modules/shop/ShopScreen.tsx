import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';

interface ShopScreenProps {
  onBack: () => void;
}

export function ShopScreen({ onBack }: ShopScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Shop Screen</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to clicker"
        >
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
