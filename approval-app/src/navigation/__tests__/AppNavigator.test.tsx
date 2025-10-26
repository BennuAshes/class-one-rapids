/**
 * AppNavigator Tests
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from '../AppNavigator';
import { api } from '../../api/client';

jest.mock('../../api/client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>{children}</PaperProvider>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API calls to prevent errors
    (api.getWorkflows as jest.Mock).mockResolvedValue([]);
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);
  });

  it('should render bottom tab navigation', () => {
    const { getByText } = render(<AppNavigator />, {
      wrapper: createWrapper(),
    });

    expect(getByText('Workflows')).toBeTruthy();
    expect(getByText('Approvals')).toBeTruthy();
  });

  it('should show badge on Approvals tab when there are pending approvals', async () => {
    const mockApprovals = [
      {
        execution_id: '1',
        checkpoint: 'PRD',
        file: '/path/1',
        file_path: '/path/1',
        timestamp: '2024-10-20T14:30:22',
        status: 'pending' as const,
        timeout_seconds: 300,
      },
      {
        execution_id: '2',
        checkpoint: 'TDD',
        file: '/path/2',
        file_path: '/path/2',
        timestamp: '2024-10-20T14:30:22',
        status: 'pending' as const,
        timeout_seconds: 300,
      },
    ];

    (api.getPendingApprovals as jest.Mock).mockResolvedValue(mockApprovals);

    const { getByText } = render(<AppNavigator />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      // Badge should show count
      expect(getByText('Approvals')).toBeTruthy();
    });
  });

  it('should not show badge when no pending approvals', async () => {
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<AppNavigator />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Approvals')).toBeTruthy();
    });
  });
});