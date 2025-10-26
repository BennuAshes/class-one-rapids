/**
 * ApprovalsScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApprovalsScreen } from '../ApprovalsScreen';
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
    <QueryClientProvider client={queryClient}>
      <PaperProvider>{children}</PaperProvider>
    </QueryClientProvider>
  );
};

describe('ApprovalsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (api.getPendingApprovals as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { UNSAFE_queryAllByType } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    const indicators = UNSAFE_queryAllByType('ActivityIndicator' as any);
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('should render pending approvals list', async () => {
    const mockApprovals = [
      {
        execution_id: '20241020_143022',
        checkpoint: 'PRD',
        file: '/path/to/prd.md',
        file_path: '/path/to/.approval_PRD.json',
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        timeout_seconds: 300,
      },
    ];

    (api.getPendingApprovals as jest.Mock).mockResolvedValue(mockApprovals);

    const { getByText } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('PRD')).toBeTruthy();
      expect(getByText('20241020_143022')).toBeTruthy();
    });
  });

  it('should render empty state when no pending approvals', async () => {
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('No Pending Approvals')).toBeTruthy();
    });
  });

  it('should render error state on fetch failure', async () => {
    (api.getPendingApprovals as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Error Loading Approvals')).toBeTruthy();
    });
  });

  it('should call approve API when approve button is pressed', async () => {
    const mockApprovals = [
      {
        execution_id: '20241020_143022',
        checkpoint: 'PRD',
        file: '/path/to/prd.md',
        file_path: '/path/to/.approval_PRD.json',
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        timeout_seconds: 300,
      },
    ];

    (api.getPendingApprovals as jest.Mock).mockResolvedValue(mockApprovals);
    (api.approveRequest as jest.Mock).mockResolvedValue({ success: true, message: 'Approved' });

    const { getByText } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('PRD')).toBeTruthy();
    });

    fireEvent.press(getByText('Approve'));

    await waitFor(() => {
      expect(api.approveRequest).toHaveBeenCalledWith('/path/to/.approval_PRD.json');
    });
  });

  it('should show reject dialog when reject button is pressed', async () => {
    const mockApprovals = [
      {
        execution_id: '20241020_143022',
        checkpoint: 'PRD',
        file: '/path/to/prd.md',
        file_path: '/path/to/.approval_PRD.json',
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        timeout_seconds: 300,
      },
    ];

    (api.getPendingApprovals as jest.Mock).mockResolvedValue(mockApprovals);

    const { getByText } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('PRD')).toBeTruthy();
    });

    fireEvent.press(getByText('Reject'));

    await waitFor(() => {
      expect(getByText('Reject Approval')).toBeTruthy();
    });
  });

  it('should call reject API when confirmed in dialog', async () => {
    const mockApprovals = [
      {
        execution_id: '20241020_143022',
        checkpoint: 'PRD',
        file: '/path/to/prd.md',
        file_path: '/path/to/.approval_PRD.json',
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        timeout_seconds: 300,
      },
    ];

    (api.getPendingApprovals as jest.Mock).mockResolvedValue(mockApprovals);
    (api.rejectRequest as jest.Mock).mockResolvedValue({ success: true, message: 'Rejected' });

    const { getByText } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('PRD')).toBeTruthy();
    });

    // Open reject dialog
    fireEvent.press(getByText('Reject'));

    await waitFor(() => {
      expect(getByText('Reject Approval')).toBeTruthy();
    });

    // Confirm rejection
    fireEvent.press(getByText('Confirm Reject'));

    await waitFor(() => {
      expect(api.rejectRequest).toHaveBeenCalledWith({
        filePath: '/path/to/.approval_PRD.json',
        reason: 'Rejected via mobile app',
      });
    });
  });

  it('should close reject dialog when cancel is pressed', async () => {
    const mockApprovals = [
      {
        execution_id: '20241020_143022',
        checkpoint: 'PRD',
        file: '/path/to/prd.md',
        file_path: '/path/to/.approval_PRD.json',
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
        timeout_seconds: 300,
      },
    ];

    (api.getPendingApprovals as jest.Mock).mockResolvedValue(mockApprovals);

    const { getByText, queryByText } = render(<ApprovalsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('PRD')).toBeTruthy();
    });

    // Open reject dialog
    fireEvent.press(getByText('Reject'));

    await waitFor(() => {
      expect(getByText('Reject Approval')).toBeTruthy();
    });

    // Cancel
    fireEvent.press(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Reject Approval')).toBeNull();
    });
  });
});