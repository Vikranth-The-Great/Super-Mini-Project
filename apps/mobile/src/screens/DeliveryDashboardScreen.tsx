import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks';
import { deliveryApi } from '../api/delivery';
import { DonationCard } from '../components';
import { THEME } from '../config/env';
import type { Donation } from '@food-donation/shared/types';

interface DeliveryOrder extends Donation {
  isAccepted?: boolean;
}

export const DeliveryDashboardScreen = ({ navigation }: any) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const [available, myOrders] = await Promise.all([
        deliveryApi.getAvailableDeliveries().catch(() => []),
        deliveryApi.getMyDeliveries().catch(() => []),
      ]);

      const availableOrders = (Array.isArray(available) ? available : []).map((o: any) => ({
        ...o,
        isAccepted: false,
      }));
      const acceptedOrders = (Array.isArray(myOrders) ? myOrders : []).map((o: any) => ({
        ...o,
        isAccepted: true,
      }));

      setOrders([...acceptedOrders, ...availableOrders]);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleAcceptOrder = async (order: DeliveryOrder) => {
    setAccepting(order._id);
    try {
      await deliveryApi.acceptDelivery(order._id);
      Alert.alert('Success', 'Order accepted!');
      await loadOrders();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to accept order');
    } finally {
      setAccepting(null);
    }
  };

  const handleCompleteOrder = async (order: DeliveryOrder) => {
    Alert.alert('Complete Delivery', 'Mark this order as delivered?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await deliveryApi.completeDelivery(order._id);
            Alert.alert('Success', 'Delivery completed!');
            await loadOrders();
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete order');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {currentUser?.name || 'Delivery Partner'}!</Text>
        <Text style={styles.subtitle}>Your deliveries</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.orderContainer}>
              <DonationCard donation={item} onPress={() => {}} showStatus={false} />
              {item.isAccepted ? (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteOrder(item)}
                >
                  <Text style={styles.buttonText}>✓ Mark Delivered</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.acceptButton,
                    accepting === item._id && styles.buttonDisabled,
                  ]}
                  onPress={() => handleAcceptOrder(item)}
                  disabled={accepting === item._id}
                >
                  {accepting === item._id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Accept Order</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No orders available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.warning,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  orderContainer: {
    marginBottom: THEME.spacing.md,
  },
  acceptButton: {
    backgroundColor: THEME.colors.primary,
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: THEME.colors.success,
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingTop: THEME.spacing.md,
  },
  loader: {
    marginTop: THEME.spacing.xl,
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
