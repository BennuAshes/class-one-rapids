import React from 'react';
import { View, StyleSheet, SafeAreaView, Pressable, Text } from 'react-native';
import { SingularityPet } from './SingularityPet';

interface ClickerScreenProps {
  onNavigateToShop: () => void;
}

export function ClickerScreen({ onNavigateToShop }: ClickerScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SingularityPet />
        <Pressable
          style={styles.shopButton}
          onPress={onNavigateToShop}
          accessibilityRole="button"
          accessibilityLabel="Go to shop"
        >
          <Text style={styles.shopButtonText}>Shop</Text>
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
    gap: 20,
  },
  shopButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
