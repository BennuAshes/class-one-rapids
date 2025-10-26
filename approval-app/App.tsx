/**
 * Workflow Approval App
 * Main entry point
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './src/api/queries';
import { AppNavigator } from './src/navigation/AppNavigator';
import { lightTheme } from './src/theme/theme';
import {
  requestNotificationPermissions,
  addNotificationResponseListener,
  setBadgeCount,
} from './src/services/notifications';
import { pollingService } from './src/services/polling';

// Create QueryClient instance
const queryClient = createQueryClient();

export default function App() {
  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        console.log('Notification permissions granted');

        // Start background polling
        pollingService.start(30000); // Poll every 30 seconds

        // Handle notification taps
        const subscription = addNotificationResponseListener((response) => {
          const data = response.notification.request.content.data;
          console.log('Notification tapped:', data);
          // TODO: Navigate to specific approval if needed
        });

        return () => {
          subscription.remove();
          pollingService.stop();
        };
      }
    };

    initNotifications();

    // Cleanup on unmount
    return () => {
      pollingService.stop();
      setBadgeCount(0);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={lightTheme}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style="auto" />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}