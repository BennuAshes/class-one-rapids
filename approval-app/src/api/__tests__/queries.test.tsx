/**
 * TanStack Query Hooks Tests
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useHealth,
  useWorkflows,
  useWorkflow,
  usePendingApprovals,
  useApproveRequest,
  useRejectRequest,
  usePendingApprovalCount,
} from '../queries';
import { api } from '../client';

// Mock the API client
jest.mock('../client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Query Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useHealth', () => {
    it('should fetch health status', async () => {
      const mockHealth = { status: 'healthy' as const, port: 8080 };
      (api.health as jest.Mock).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockHealth);
    });

    it('should handle health check errors', async () => {
      (api.health as jest.Mock).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useWorkflows', () => {
    it('should fetch workflows list', async () => {
      const mockWorkflows = [
        {
          execution_id: '20241020_143022',
          status: 'awaiting_approval' as const,
          started_at: '2024-10-20T14:30:22',
        },
      ];
      (api.getWorkflows as jest.Mock).mockResolvedValue(mockWorkflows);

      const { result } = renderHook(() => useWorkflows(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockWorkflows);
    });

    it('should handle empty workflows list', async () => {
      (api.getWorkflows as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useWorkflows(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });
  });

  describe('useWorkflow', () => {
    it('should fetch single workflow', async () => {
      const mockWorkflow = {
        execution_id: '20241020_143022',
        status: {
          execution_id: '20241020_143022',
          feature_source: 'command line',
          approval_mode: 'file',
          status: 'awaiting_approval' as const,
          started_at: '2024-10-20T14:30:22',
          working_directory: '/path',
          steps: [],
        },
        approvals: [],
        files: [],
      };
      (api.getWorkflow as jest.Mock).mockResolvedValue(mockWorkflow);

      const { result } = renderHook(() => useWorkflow('20241020_143022'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockWorkflow);
    });

    it('should not fetch when execution ID is empty', () => {
      const { result } = renderHook(() => useWorkflow(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('usePendingApprovals', () => {
    it('should fetch pending approvals', async () => {
      const mockApprovals = [
        {
          execution_id: '20241020_143022',
          checkpoint: 'PRD',
          file: '/path/to/prd.md',
          file_path: '/path/to/.approval_PRD.json',
          timestamp: '2024-10-20T14:30:22',
          status: 'pending' as const,
          timeout_seconds: 300,
        },
      ];
      (api.getPendingApprovals as jest.Mock).mockResolvedValue(mockApprovals);

      const { result } = renderHook(() => usePendingApprovals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockApprovals);
    });

    it('should be disabled when enabled is false', () => {
      const { result } = renderHook(() => usePendingApprovals({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('usePendingApprovalCount', () => {
    it('should return count of pending approvals', async () => {
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

      const { result } = renderHook(() => usePendingApprovalCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current).toBe(2));
    });

    it('should return 0 when no pending approvals', async () => {
      (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePendingApprovalCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current).toBe(0));
    });
  });

  describe('useApproveRequest', () => {
    it('should approve request successfully', async () => {
      const mockResponse = { success: true, message: 'Approved' };
      (api.approveRequest as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useApproveRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('/path/to/approval.json');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle approval errors', async () => {
      (api.approveRequest as jest.Mock).mockRejectedValue(new Error('Approval failed'));

      const { result } = renderHook(() => useApproveRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('/path/to/approval.json');

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useRejectRequest', () => {
    it('should reject request successfully', async () => {
      const mockResponse = { success: true, message: 'Rejected' };
      (api.rejectRequest as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRejectRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ filePath: '/path/to/approval.json', reason: 'Not ready' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle rejection errors', async () => {
      (api.rejectRequest as jest.Mock).mockRejectedValue(new Error('Rejection failed'));

      const { result } = renderHook(() => useRejectRequest(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ filePath: '/path/to/approval.json' });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});