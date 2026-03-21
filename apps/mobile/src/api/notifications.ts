/**
 * Notifications API
 * Get and manage notifications
 */

import client from './client';
import { API_ROUTES } from '@food-donation/shared/constants';
import type { Notification } from '@food-donation/shared/types';

export const notificationApi = {
  /**
   * Get all notifications for current user
   */
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await client.get(API_ROUTES.NOTIFICATIONS_MY);
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    await client.put(API_ROUTES.NOTIFICATIONS_READ(id), {});
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await client.put(API_ROUTES.NOTIFICATIONS_READ_ALL, {});
  },
};
