import { Tabs } from 'expo-router'
import { Platform } from 'react-native'
import { TabIcon } from '@shared/components/TabIcon'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      headerShown: false,
      tabBarStyle: Platform.select({
        ios: {
          backgroundColor: '#ffffff',
          borderTopColor: '#c6c6c8',
        },
        default: {
          backgroundColor: '#ffffff',
        }
      })
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <TabIcon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="departments"
        options={{
          title: 'Departments',
          tabBarIcon: ({ color }) => (
            <TabIcon name="building" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progression"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <TabIcon name="trophy" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon name="gear" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}