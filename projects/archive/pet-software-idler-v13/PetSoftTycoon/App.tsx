import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { observer } from '@legendapp/state/react';
import { useEffect } from 'react';
import { gameState$ } from './src/core/state/gameState';
import { gameLoop } from './src/core/services/gameLoop';
import { GAME_CONFIG } from './src/shared/constants/gameConfig';

// Initialize game state
gameState$.money.set(GAME_CONFIG.STARTING_MONEY);
gameState$.meta.gameStarted.set(true);

const App = observer(() => {
  useEffect(() => {
    // Start the game loop when app loads
    gameLoop.start();
    
    return () => {
      // Clean up when app unmounts
      gameLoop.stop();
    };
  }, []);

  const money = gameState$.money.get();
  const valuation = gameState$.valuation.get();

  const handleClick = () => {
    // Simple click to earn money mechanic
    gameState$.money.set(money + 10);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      <Text style={styles.money}>Money: ${money.toFixed(2)}</Text>
      <Text style={styles.valuation}>Valuation: ${valuation.toFixed(2)}</Text>
      
      <Button title="Click to Earn $10" onPress={handleClick} />
      
      <StatusBar style="auto" />
    </View>
  );
});

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  money: {
    fontSize: 18,
    marginBottom: 10,
    color: '#4CAF50',
  },
  valuation: {
    fontSize: 16,
    marginBottom: 20,
    color: '#2196F3',
  },
});
