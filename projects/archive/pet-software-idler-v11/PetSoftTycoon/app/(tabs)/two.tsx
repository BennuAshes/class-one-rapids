import { StyleSheet, View, Text } from 'react-native';
import { useGameStore } from '../../src/core/state/gameStore';

export default function StatsScreen() {
  const { statistics, money } = useGameStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Statistics</Text>
      
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Current Money</Text>
        <Text style={styles.statValue}>${money.toString()}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Total Clicks</Text>
        <Text style={styles.statValue}>{statistics.totalClicks.toLocaleString()}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Total Earned</Text>
        <Text style={styles.statValue}>${statistics.totalEarned.toString()}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Play Time</Text>
        <Text style={styles.statValue}>{Math.round(statistics.playTime / 1000)} seconds</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});