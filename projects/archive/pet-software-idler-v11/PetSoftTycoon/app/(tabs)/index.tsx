import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../src/core/state/gameStore';

export default function GameScreen() {
  const { money, statistics, click } = useGameStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PetSoft Tycoon</Text>
        <Text style={styles.money}>${money.toString()}</Text>
      </View>
      
      <View style={styles.gameArea}>
        <TouchableOpacity 
          style={styles.clickButton}
          onPress={click}
          activeOpacity={0.7}
        >
          <Text style={styles.clickText}>💰</Text>
          <Text style={styles.clickLabel}>Click for Money!</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>Total Clicks: {statistics.totalClicks}</Text>
        <Text style={styles.statText}>Total Earned: ${statistics.totalEarned.toString()}</Text>
        <Text style={styles.statText}>Play Time: {Math.round(statistics.playTime / 1000)}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  money: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2e7d32',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clickText: {
    fontSize: 60,
    marginBottom: 10,
  },
  clickLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  stats: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});