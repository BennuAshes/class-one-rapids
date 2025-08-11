import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { playerStore } from '@features/player/state/playerStore'

export default observer(function DashboardScreen() {
  const cash = playerStore.cash.get()
  const valuation = playerStore.valuation.get()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      <Text style={styles.stat}>Cash: ${cash.toLocaleString()}</Text>
      <Text style={styles.stat}>Valuation: ${valuation.toLocaleString()}</Text>
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