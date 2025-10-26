/**
 * WorkflowsScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { WorkflowsScreen } from '../WorkflowsScreen';
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

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('WorkflowsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (api.getWorkflows as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByTestId, UNSAFE_queryAllByType } = render(<WorkflowsScreen />, {
      wrapper: createWrapper(),
    });

    // Should show ActivityIndicator
    const indicators = UNSAFE_queryAllByType('ActivityIndicator' as any);
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('should render workflows list', async () => {
    const mockWorkflows = [
      {
        execution_id: '20241020_143022',
        status: 'awaiting_approval' as const,
        started_at: '2024-10-20T14:30:22',
        current_step: 'PRD',
      },
      {
        execution_id: '20241020_150000',
        status: 'completed' as const,
        started_at: '2024-10-20T15:00:00',
      },
    ];

    (api.getWorkflows as jest.Mock).mockResolvedValue(mockWorkflows);

    const { getByText } = render(<WorkflowsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('20241020_143022')).toBeTruthy();
      expect(getByText('20241020_150000')).toBeTruthy();
    });
  });

  it('should render empty state when no workflows', async () => {
    (api.getWorkflows as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<WorkflowsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('No Workflows')).toBeTruthy();
    });
  });

  it('should render error state on fetch failure', async () => {
    (api.getWorkflows as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<WorkflowsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Error Loading Workflows')).toBeTruthy();
    });
  });

  it('should navigate to workflow detail when card is pressed', async () => {
    const mockWorkflows = [
      {
        execution_id: '20241020_143022',
        status: 'awaiting_approval' as const,
        started_at: '2024-10-20T14:30:22',
      },
    ];

    (api.getWorkflows as jest.Mock).mockResolvedValue(mockWorkflows);

    const { getByText } = render(<WorkflowsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('20241020_143022')).toBeTruthy();
    });

    fireEvent.press(getByText('20241020_143022'));

    expect(mockNavigate).toHaveBeenCalledWith('WorkflowDetail', {
      executionId: '20241020_143022',
    });
  });

  it('should refresh workflows when refresh is triggered', async () => {
    const mockWorkflows = [
      {
        execution_id: '20241020_143022',
        status: 'awaiting_approval' as const,
        started_at: '2024-10-20T14:30:22',
      },
    ];

    (api.getWorkflows as jest.Mock).mockResolvedValue(mockWorkflows);

    const { getByText, getByTestId } = render(<WorkflowsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('20241020_143022')).toBeTruthy();
    });

    // Clear the mock to track new calls
    (api.getWorkflows as jest.Mock).mockClear();

    // Find and press refresh action
    const refreshButton = getByTestId('refresh-button');
    fireEvent.press(refreshButton);

    // Wait for refetch
    await waitFor(() => {
      expect(api.getWorkflows).toHaveBeenCalled();
    });
  });
});