/**
 * Notification types - shared between web and mobile
 */

export interface Notification {
  _id: string;
  recipientRole: 'user' | 'admin' | 'delivery';
  recipientId: string;
  title: string;
  message: string;
  type?: string; // e.g., 'donation_claimed', 'order_assigned'
  relatedId?: string; // ID of related donation/order
  isRead: boolean;
  createdAt: string;
  // Legacy support
  userId?: string;
}

export interface NotificationCreatePayload {
  recipientRole: 'user' | 'admin' | 'delivery';
  recipientId: string;
  title: string;
  message: string;
  type?: string;
  relatedId?: string;
}

export interface MarkNotificationReadPayload {
  isRead: boolean;
}
