import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDate, formatRelativeTime } from '@food-donation/shared/utils';
import { THEME } from '../config/env';
import type { Notification } from '@food-donation/shared/types';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

const NotificationItemComponent = ({ notification, onPress }: NotificationItemProps) => (
  <TouchableOpacity
    style={[styles.card, !notification.isRead && styles.unread]}
    onPress={onPress}
  >
    <View style={styles.header}>
      <Text style={[styles.title, !notification.isRead && styles.boldText]}>{notification.title}</Text>
      <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
    </View>
    <Text style={styles.message}>{notification.message}</Text>
  </TouchableOpacity>
);

interface NotificationListProps {
  notifications: Notification[];
  onSelectNotification: (notification: Notification) => void;
}

export const NotificationList = ({ notifications, onSelectNotification }: NotificationListProps) => (
  <FlatList
    data={notifications}
    keyExtractor={(item) => item._id}
    renderItem={({ item }) => (
      <NotificationItemComponent notification={item} onPress={() => onSelectNotification(item)} />
    )}
    contentContainerStyle={styles.list}
    ListEmptyComponent={
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No notifications</Text>
      </View>
    }
  />
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.light,
  },
  unread: {
    backgroundColor: '#F9F9F9',
    borderLeftColor: THEME.colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.dark,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: THEME.spacing.sm,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  list: {
    padding: THEME.spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
