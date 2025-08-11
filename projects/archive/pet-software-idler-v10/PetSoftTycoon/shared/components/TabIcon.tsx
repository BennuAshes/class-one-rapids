import { View, Text, StyleSheet } from 'react-native'

interface TabIconProps {
  name: string
  color: string
}

export function TabIcon({ name, color }: TabIconProps) {
  // Simple text-based icons for now, can be replaced with proper icons later
  const iconMap: Record<string, string> = {
    home: '🏠',
    building: '🏢',
    trophy: '🏆',
    gear: '⚙️'
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color }]}>
        {iconMap[name] || '•'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
})