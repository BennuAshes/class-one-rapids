/**
 * WorkflowDetailScreen Tests
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { WorkflowDetailScreen } from '../WorkflowDetailScreen';
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

const mockRoute = {
  params: {
    executionId: '20241020_143022',
  },
};

describe('WorkflowDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (api.getWorkflow as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { UNSAFE_queryAllByType } = render(
      <WorkflowDetailScreen route={mockRoute as any} navigation={{} as any} />,
      {
        wrapper: createWrapper(),
      }
    );

    const indicators = UNSAFE_queryAllByType('ActivityIndicator' as any);
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('should render workflow details', async () => {
    const mockWorkflow = {
      execution_id: '20241020_143022',
      status: {
        execution_id: '20241020_143022',
        feature_source: 'command line',
        approval_mode: 'file',
        status: 'awaiting_approval' as const,
        started_at: '2024-10-20T14:30:22',
        working_directory: '/path/to/workflow',
        steps: [
          { name: 'Generate PRD', status: 'completed' as const },
          { name: 'Generate TDD', status: 'pending' as const },
        ],
      },
      approvals: [],
      files: [],
    };

    (api.getWorkflow as jest.Mock).mockResolvedValue(mockWorkflow);

    const { getByText } = render(
      <WorkflowDetailScreen route={mockRoute as any} navigation={{} as any} />,
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(getByText('20241020_143022')).toBeTruthy();
      expect(getByText('command line')).toBeTruthy();
      expect(getByText('file')).toBeTruthy();
    });
  });

  it('should render workflow steps', async () => {
    const mockWorkflow = {
      execution_id: '20241020_143022',
      status: {
        execution_id: '20241020_143022',
        feature_source: 'command line',
        approval_mode: 'file',
        status: 'awaiting_approval' as const,
        started_at: '2024-10-20T14:30:22',
        working_directory: '/path',
        steps: [
          { name: 'Generate PRD', status: 'completed' as const },
          { name: 'Generate TDD', status: 'in_progress' as const },
          { name: 'Generate Tasks', status: 'pending' as const },
        ],
      },
      approvals: [],
      files: [],
    };

    (api.getWorkflow as jest.Mock).mockResolvedValue(mockWorkflow);

    const { getByText } = render(
      <WorkflowDetailScreen route={mockRoute as any} navigation={{} as any} />,
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(getByText('Generate PRD')).toBeTruthy();
      expect(getByText('Generate TDD')).toBeTruthy();
      expect(getByText('Generate Tasks')).toBeTruthy();
    });
  });

  it('should render approval history', async () => {
    const mockWorkflow = {
      execution_id: '20241020_143022',
      status: {
        execution_id: '20241020_143022',
        feature_source: 'command line',
        approval_mode: 'file',
        status: 'completed' as const,
        started_at: '2024-10-20T14:30:22',
        working_directory: '/path',
        steps: [],
      },
      approvals: [
        {
          execution_id: '20241020_143022',
          checkpoint: 'PRD',
          file: '/path/to/prd.md',
          file_path: '/path/to/.approval_PRD.json',
          timestamp: '2024-10-20T14:30:22',
          status: 'approved' as const,
          timeout_seconds: 300,
        },
      ],
      files: [],
    };

    (api.getWorkflow as jest.Mock).mockResolvedValue(mockWorkflow);

    const { getByText } = render(
      <WorkflowDetailScreen route={mockRoute as any} navigation={{} as any} />,
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(getByText('PRD')).toBeTruthy();
      expect(getByText(/Status: approved/)).toBeTruthy();
    });
  });

  it('should render generated files', async () => {
    const mockWorkflow = {
      execution_id: '20241020_143022',
      status: {
        execution_id: '20241020_143022',
        feature_source: 'command line',
        approval_mode: 'file',
        status: 'completed' as const,
        started_at: '2024-10-20T14:30:22',
        working_directory: '/path',
        steps: [],
      },
      approvals: [],
      files: [
        { name: 'prd_20241020.md', size: 1024, path: '/path/to/prd.md' },
        { name: 'tdd_20241020.md', size: 2048, path: '/path/to/tdd.md' },
      ],
    };

    (api.getWorkflow as jest.Mock).mockResolvedValue(mockWorkflow);

    const { getByText } = render(
      <WorkflowDetailScreen route={mockRoute as any} navigation={{} as any} />,
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(getByText('prd_20241020.md')).toBeTruthy();
      expect(getByText('tdd_20241020.md')).toBeTruthy();
      expect(getByText('1.0 KB')).toBeTruthy();
      expect(getByText('2.0 KB')).toBeTruthy();
    });
  });

  it('should render error state on fetch failure', async () => {
    (api.getWorkflow as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText } = render(
      <WorkflowDetailScreen route={mockRoute as any} navigation={{} as any} />,
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(getByText('Error Loading Workflow')).toBeTruthy();
    });
  });

  it('should render not found state when workflow is null', async () => {
    (api.getWorkflow as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(
      <WorkflowDetailScreen route={mockRoute as any} navigation={{} as any} />,
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(getByText('Workflow Not Found')).toBeTruthy();
    });
  });
});