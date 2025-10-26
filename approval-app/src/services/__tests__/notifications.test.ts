/**
 * Notifications Service Tests
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {
  requestNotificationPermissions,
  sendApprovalNotification,
  setBadgeCount,
  clearNotifications,
} from '../notifications';

jest.mock('expo-notifications');
jest.mock('expo-device');

describe('Notifications Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNotificationPermissions', () => {
    it('should request permissions on physical device', async () => {
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false on non-device (simulator)', async () => {
      (Device.isDevice as any) = false;

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });

    it('should return true if permissions already granted', async () => {
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should return false if permissions denied', async () => {
      (Device.isDevice as any) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });
  });

  describe('sendApprovalNotification', () => {
    it('should schedule notification with correct content', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

      await sendApprovalNotification('PRD', '20241020_143022');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          title: '🔔 New Approval Request',
          body: 'PRD requires your approval',
          data: {
            type: 'approval',
            checkpoint: 'PRD',
            executionId: '20241020_143022',
          },
        }),
        trigger: null,
      });
    });

    it('should handle notification errors gracefully', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Notification error')
      );

      // Should not throw
      await expect(sendApprovalNotification('PRD', '20241020_143022')).resolves.not.toThrow();
    });
  });

  describe('setBadgeCount', () => {
    it('should set badge count', async () => {
      (Notifications.setBadgeCountAsync as jest.Mock).mockResolvedValue(undefined);

      await setBadgeCount(5);

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(5);
    });

    it('should handle badge count errors gracefully', async () => {
      (Notifications.setBadgeCountAsync as jest.Mock).mockRejectedValue(
        new Error('Badge error')
      );

      // Should not throw
      await expect(setBadgeCount(5)).resolves.not.toThrow();
    });
  });

  describe('clearNotifications', () => {
    it('should clear all notifications and badge', async () => {
      (Notifications.dismissAllNotificationsAsync as jest.Mock).mockResolvedValue(undefined);
      (Notifications.setBadgeCountAsync as jest.Mock).mockResolvedValue(undefined);

      await clearNotifications();

      expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    });

    it('should handle clear errors gracefully', async () => {
      (Notifications.dismissAllNotificationsAsync as jest.Mock).mockRejectedValue(
        new Error('Clear error')
      );

      // Should not throw
      await expect(clearNotifications()).resolves.not.toThrow();
    });
  });
});