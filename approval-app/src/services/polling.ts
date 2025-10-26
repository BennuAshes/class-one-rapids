/**
 * Background Polling Service
 * Polls for new approval requests and triggers notifications
 */

import { AppState, AppStateStatus } from 'react-native';
import { api } from '../api/client';
import { sendApprovalNotification, setBadgeCount } from './notifications';
import type { Approval } from '../api/types';

class PollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastPendingApprovals: Set<string> = new Set();
  private isPolling = false;
  private pollInterval = 30000; // 30 seconds default

  /**
   * Start background polling
   */
  start(intervalMs: number = 30000): void {
    if (this.isPolling) {
      console.log('Polling already started');
      return;
    }

    this.pollInterval = intervalMs;
    this.isPolling = true;

    // Initial poll
    this.poll();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.poll();
    }, this.pollInterval);

    // Adjust interval based on app state
    AppState.addEventListener('change', this.handleAppStateChange);

    console.log(`Polling started with interval: ${intervalMs}ms`);
  }

  /**
   * Stop background polling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isPolling = false;
    console.log('Polling stopped');
  }

  /**
   * Poll for new approval requests
   */
  private poll = async (): Promise<void> => {
    try {
      const approvals = await api.getPendingApprovals();

      // Update badge count
      await setBadgeCount(approvals.length);

      // Check for new approvals
      const currentApprovalIds = new Set(approvals.map((a) => a.file_path));

      // Find newly added approvals
      const newApprovals = approvals.filter(
        (approval) => !this.lastPendingApprovals.has(approval.file_path)
      );

      // Send notifications for new approvals
      for (const approval of newApprovals) {
        await sendApprovalNotification(approval.checkpoint, approval.execution_id);
      }

      // Update tracked approvals
      this.lastPendingApprovals = currentApprovalIds;
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  /**
   * Handle app state changes (foreground/background)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      // App came to foreground - use shorter interval
      this.updatePollingInterval(5000); // 5 seconds when active
    } else if (nextAppState === 'background') {
      // App went to background - use longer interval
      this.updatePollingInterval(30000); // 30 seconds when backgrounded
    }
  };

  /**
   * Update polling interval
   */
  private updatePollingInterval(newInterval: number): void {
    if (this.pollInterval === newInterval) return;

    this.pollInterval = newInterval;

    // Restart polling with new interval
    if (this.isPolling) {
      this.stop();
      this.start(newInterval);
    }
  }

  /**
   * Force a poll immediately
   */
  async pollNow(): Promise<void> {
    await this.poll();
  }
}

// Singleton instance
export const pollingService = new PollingService();