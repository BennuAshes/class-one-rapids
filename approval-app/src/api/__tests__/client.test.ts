/**
 * API Client Tests
 */

import { api, ApiError } from '../client';
import type { Workflow, WorkflowDetail, Approval, ApprovalResponse, HealthResponse } from '../types';

describe('API Client', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('health', () => {
    it('should fetch health status successfully', async () => {
      const mockResponse: HealthResponse = {
        status: 'healthy',
        port: 8080,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.health();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/health',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle health check errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      await expect(api.health()).rejects.toThrow(ApiError);
    });
  });

  describe('getWorkflows', () => {
    it('should fetch workflows successfully', async () => {
      const mockWorkflows: Workflow[] = [
        {
          execution_id: '20241020_143022',
          status: 'awaiting_approval',
          started_at: '2024-10-20T14:30:22',
          current_step: 'PRD',
          approval_mode: 'file',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkflows,
      });

      const result = await api.getWorkflows();

      expect(result).toEqual(mockWorkflows);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/workflows',
        expect.any(Object)
      );
    });

    it('should return empty array when no workflows', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await api.getWorkflows();
      expect(result).toEqual([]);
    });
  });

  describe('getWorkflow', () => {
    it('should fetch single workflow successfully', async () => {
      const mockWorkflow: WorkflowDetail = {
        execution_id: '20241020_143022',
        status: {
          execution_id: '20241020_143022',
          feature_source: 'command line',
          approval_mode: 'file',
          status: 'awaiting_approval',
          started_at: '2024-10-20T14:30:22',
          working_directory: '/path/to/workflow',
          steps: [
            { name: 'Generate PRD', status: 'completed' },
            { name: 'Generate TDD', status: 'pending' },
          ],
        },
        approvals: [],
        files: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkflow,
      });

      const result = await api.getWorkflow('20241020_143022');

      expect(result).toEqual(mockWorkflow);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/workflows/20241020_143022',
        expect.any(Object)
      );
    });

    it('should handle 404 not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Workflow not found' }),
      });

      await expect(api.getWorkflow('invalid-id')).rejects.toThrow(ApiError);
    });
  });

  describe('getPendingApprovals', () => {
    it('should fetch pending approvals successfully', async () => {
      const mockApprovals: Approval[] = [
        {
          execution_id: '20241020_143022',
          checkpoint: 'PRD',
          file: '/path/to/prd.md',
          file_path: '/path/to/.approval_PRD.json',
          timestamp: '2024-10-20T14:30:22',
          status: 'pending',
          timeout_seconds: 300,
          preview: 'PRD content...',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApprovals,
      });

      const result = await api.getPendingApprovals();

      expect(result).toEqual(mockApprovals);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/approvals/pending',
        expect.any(Object)
      );
    });

    it('should return empty array when no pending approvals', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await api.getPendingApprovals();
      expect(result).toEqual([]);
    });
  });

  describe('approveRequest', () => {
    it('should approve request successfully', async () => {
      const mockResponse: ApprovalResponse = {
        success: true,
        message: 'Request approved',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.approveRequest('/path/to/.approval_PRD.json');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/approve'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle approval failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Failed to approve' }),
      });

      await expect(api.approveRequest('/invalid/path')).rejects.toThrow(ApiError);
    });
  });

  describe('rejectRequest', () => {
    it('should reject request successfully', async () => {
      const mockResponse: ApprovalResponse = {
        success: true,
        message: 'Request rejected',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.rejectRequest('/path/to/.approval_PRD.json', 'Not ready');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reject'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'Not ready' }),
        })
      );
    });

    it('should use default reason if none provided', async () => {
      const mockResponse: ApprovalResponse = {
        success: true,
        message: 'Request rejected',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.rejectRequest('/path/to/.approval_PRD.json');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ reason: 'Rejected via mobile app' }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    // TODO: Fix this test - fake timers don't work properly with promises
    it.skip(
      'should handle network timeout',
      async () => {
        jest.useFakeTimers();

        const fetchPromise = new Promise(() => {}); // Never resolves
        (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

        const resultPromise = api.health();

        jest.advanceTimersByTime(30000); // Advance past timeout

        await expect(resultPromise).rejects.toThrow();

        jest.useRealTimers();
      },
      10000
    ); // Increase timeout for this test

    it('should handle JSON parse errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(api.health()).rejects.toThrow();
    });
  });
});