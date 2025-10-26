/**
 * Polling Service Tests
 */

import { pollingService } from '../polling';
import { api } from '../../api/client';
import * as notificationService from '../notifications';

jest.mock('../../api/client');
jest.mock('../notifications');

describe('Polling Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    pollingService.stop(); // Ensure clean state
  });

  afterEach(() => {
    jest.useRealTimers();
    pollingService.stop();
  });

  it('should start polling with default interval', () => {
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

    pollingService.start();

    expect(api.getPendingApprovals).toHaveBeenCalled();
  });

  it('should poll at specified interval', async () => {
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

    pollingService.start(10000); // 10 seconds

    // Initial call
    expect(api.getPendingApprovals).toHaveBeenCalledTimes(1);

    // Advance time by 10 seconds
    jest.advanceTimersByTime(10000);
    await Promise.resolve(); // Allow promises to resolve

    // Should have polled again
    expect(api.getPendingApprovals).toHaveBeenCalledTimes(2);
  });

  it('should update badge count on poll', async () => {
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

    pollingService.start();
    await Promise.resolve(); // Allow promises to resolve

    expect(notificationService.setBadgeCount).toHaveBeenCalledWith(2);
  });

  it('should send notifications for new approvals', async () => {
    // First poll - no approvals
    (api.getPendingApprovals as jest.Mock).mockResolvedValueOnce([]);

    pollingService.start(10000);
    await Promise.resolve();

    // Second poll - new approval
    const newApproval = {
      execution_id: '20241020_143022',
      checkpoint: 'PRD',
      file: '/path/to/prd.md',
      file_path: '/path/to/.approval_PRD.json',
      timestamp: '2024-10-20T14:30:22',
      status: 'pending' as const,
      timeout_seconds: 300,
    };
    (api.getPendingApprovals as jest.Mock).mockResolvedValueOnce([newApproval]);

    // Use runAllTimersAsync to ensure all async operations complete
    await jest.advanceTimersByTimeAsync(10000);

    expect(notificationService.sendApprovalNotification).toHaveBeenCalledWith(
      'PRD',
      '20241020_143022'
    );
  });

  it('should not send notifications for existing approvals', async () => {
    const approval = {
      execution_id: '20241020_143022',
      checkpoint: 'PRD',
      file: '/path/to/prd.md',
      file_path: '/path/to/.approval_PRD.json',
      timestamp: '2024-10-20T14:30:22',
      status: 'pending' as const,
      timeout_seconds: 300,
    };

    // First poll - approval exists
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([approval]);

    pollingService.start(10000);
    await Promise.resolve();

    // Clear notification mock
    (notificationService.sendApprovalNotification as jest.Mock).mockClear();

    // Second poll - same approval
    jest.advanceTimersByTime(10000);
    await Promise.resolve();

    // Should not send notification again
    expect(notificationService.sendApprovalNotification).not.toHaveBeenCalled();
  });

  it('should stop polling when stop is called', () => {
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

    pollingService.start(10000);
    expect(api.getPendingApprovals).toHaveBeenCalledTimes(1);

    pollingService.stop();

    // Advance time
    jest.advanceTimersByTime(20000);

    // Should not have polled again
    expect(api.getPendingApprovals).toHaveBeenCalledTimes(1);
  });

  it('should handle polling errors gracefully', async () => {
    (api.getPendingApprovals as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Should not throw
    pollingService.start();
    await Promise.resolve();

    // Should continue polling after error
    jest.advanceTimersByTime(30000);
    expect(api.getPendingApprovals).toHaveBeenCalled();
  });

  it('should poll immediately when pollNow is called', async () => {
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

    await pollingService.pollNow();

    expect(api.getPendingApprovals).toHaveBeenCalled();
  });

  it('should not start polling twice', () => {
    (api.getPendingApprovals as jest.Mock).mockResolvedValue([]);

    pollingService.start();
    const firstCallCount = (api.getPendingApprovals as jest.Mock).mock.calls.length;

    pollingService.start(); // Try to start again

    // Should not have made additional calls
    expect((api.getPendingApprovals as jest.Mock).mock.calls.length).toBe(firstCallCount);
  });
});