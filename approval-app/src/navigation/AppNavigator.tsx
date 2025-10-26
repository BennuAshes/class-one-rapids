/**
 * App Navigation
 * Bottom tab navigation with badge support for pending approvals
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WorkflowsScreen } from '../screens/WorkflowsScreen';
import { ApprovalsScreen } from '../screens/ApprovalsScreen';
import { WorkflowDetailScreen } from '../screens/WorkflowDetailScreen';
import { usePendingApprovalCount } from '../api/queries';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Workflows Stack Navigator
 * Includes WorkflowsScreen and WorkflowDetailScreen
 */
function WorkflowsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workflows" component={WorkflowsScreen} />
      <Stack.Screen name="WorkflowDetail" component={WorkflowDetailScreen} />
    </Stack.Navigator>
  );
}

/**
 * Main App Navigator
 * Bottom tab navigation with dynamic badge count
 */
export function AppNavigator() {
  const pendingCount = usePendingApprovalCount();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'WorkflowsTab':
              iconName = 'clipboard-text-multiple';
              break;
            case 'ApprovalsTab':
              iconName = 'checkbox-marked-circle-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6750A4',
        tabBarInactiveTintColor: '#666',
      })}
    >
      <Tab.Screen
        name="WorkflowsTab"
        component={WorkflowsStack}
        options={{
          tabBarLabel: 'Workflows',
        }}
      />
      <Tab.Screen
        name="ApprovalsTab"
        component={ApprovalsScreen}
        options={{
          tabBarLabel: 'Approvals',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}