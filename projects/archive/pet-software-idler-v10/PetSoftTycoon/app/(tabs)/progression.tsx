import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { progressionStore } from '@features/progression/state/progressionStore'
import { playerStore } from '@features/player/state/playerStore'

export default observer(function ProgressionScreen() {
  const prestigeLevel = progressionStore.prestigeLevel.get()
  const investorPoints = progressionStore.investorPoints.get()
  const level = playerStore.level.get()
  const experience = playerStore.experience.get()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progression</Text>
      <Text style={styles.stat}>Level: {level}</Text>
      <Text style={styles.stat}>Experience: {experience}</Text>
      <Text style={styles.stat}>Prestige Level: {prestigeLevel}</Text>
      <Text style={styles.stat}>Investor Points: {investorPoints}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  stat: {
    fontSize: 18,
    marginBottom: 10
  }
})