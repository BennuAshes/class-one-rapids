import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameState } from '../../shared/hooks/useGameState';
import { observer } from '@legendapp/state/react';

interface ShopScreenProps {
  onNavigateBack: () => void;
}

export const ShopScreen = observer(function ShopScreen({
  onNavigateBack
}: ShopScreenProps) {
  const { scrap$, upgrades$ } = useGameState();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={onNavigateBack}
          accessibilityRole="button"
          accessibilityLabel="Back to main screen"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          Shop
        </Text>

        <Text
          style={styles.scrapBalance}
          accessibilityRole="text"
          accessibilityLabel={`Scrap balance: ${scrap$.get()}`}
        >
          Scrap: {scrap$.get()}
        </Text>
      </View>

      <View style={styles.content}>
        {upgrades$.get().length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              style={styles.emptyText}
              accessibilityRole="text"
            >
              No upgrades available yet
            </Text>
            <Text style={styles.emptySubtext}>
              Check back soon for new upgrades!
            </Text>
          </View>
        ) : (
          <Text>Upgrades list (future)</Text>
        )}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  scrapBalance: {
    fontSize: 16,
    color: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
  },
});
