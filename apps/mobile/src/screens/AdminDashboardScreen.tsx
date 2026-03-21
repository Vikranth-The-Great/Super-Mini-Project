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
import { ngoApi } from '../api/admin';
import { DonationCard } from '../components';
import { THEME } from '../config/env';
import type { Donation } from '@food-donation/shared/types';

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaming] = useState<string | null>(null);

  const loadDonations = async () => {
    try {
      const data = await ngoApi.getAvailableDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load donations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDonations();
  };

  const handleClaimDonation = async (donation: Donation) => {
    setClaming(donation._id);
    try {
      await ngoApi.claimDonation(donation._id);
      Alert.alert('Success', 'Donation claimed!');
      await loadDonations();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to claim donation');
    } finally {
      setClaming(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {currentUser?.name || 'NGO'}!</Text>
        <Text style={styles.subtitle}>Available donations</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.donationContainer}>
              <DonationCard donation={item} onPress={() => {}} />
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  claiming === item._id && styles.claimButtonDisabled,
                ]}
                onPress={() => handleClaimDonation(item)}
                disabled={claiming === item._id}
              >
                {claiming === item._id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.claimButtonText}>Claim Donation</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No available donations</Text>
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
    backgroundColor: THEME.colors.secondary,
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
  donationContainer: {
    marginBottom: THEME.spacing.md,
  },
  claimButton: {
    backgroundColor: THEME.colors.success,
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    opacity: 0.5,
  },
  claimButtonText: {
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
