import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DevelopmentTab } from './src/features/development/components/DevelopmentTab';
import { audioManager } from './src/shared/audio/AudioManager';
import { saveManager, AutoSaveManager } from './src/shared/persistence/SaveManager';
import { usePlayer } from './src/features/core/state/playerStore';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { money } = usePlayer();
  const [autoSaveManager] = useState(() => new AutoSaveManager());
  
  useEffect(() => {
    initialize();
    
    return () => {
      autoSaveManager.stopAutoSave();
    };
  }, [autoSaveManager]);
  
  const initialize = async (): Promise<void> => {
    try {
      // Initialize audio
      await audioManager.initialize();
      
      // Load saved game
      const savedGame = await saveManager.loadGame();
      if (savedGame) {
        // Apply saved state to stores
        // Implementation depends on state restoration pattern
        console.log('Loaded saved game:', savedGame);
      }
      
      // Start auto-save
      autoSaveManager.startAutoSave(() => ({
        player: { money: money.get() },
        departments: { /* department states */ },
        progression: { /* progression state */ },
        settings: { /* settings state */ },
      }));
      
      setIsLoaded(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsLoaded(true); // Continue with default state
    }
  };
  
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading PetSoft Tycoon...</Text>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PetSoft Tycoon</Text>
        <Text style={styles.money}>${money.get().toLocaleString()}</Text>
      </View>
      
      <DevelopmentTab />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  money: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
