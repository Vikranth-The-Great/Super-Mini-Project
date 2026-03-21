import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks';
import { donationApi } from '../api/donations';
import { DonationCard } from '../components';
import { THEME } from '../config/env';
import type { Donation } from '@food-donation/shared/types';

export const UserDashboardScreen = ({ navigation }: any) => {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDonations = async () => {
    try {
      const data = await donationApi.getMyDonations();
      setDonations(data);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {currentUser?.name || 'Donor'}!</Text>
        <Text style={styles.subtitle}>Your donations</Text>
      </View>

      <TouchableOpacity
        style={styles.newDonationButton}
        onPress={() => navigation.navigate('CreateDonation')}
      >
        <Text style={styles.newDonationText}>+ Create New Donation</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={THEME.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <DonationCard
              donation={item}
              onPress={() => navigation.navigate('DonationDetail', { donation: item })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No donations yet. Create one!</Text>
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
    backgroundColor: THEME.colors.primary,
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
  newDonationButton: {
    margin: THEME.spacing.lg,
    backgroundColor: THEME.colors.success,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  newDonationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  list: {
    paddingHorizontal: THEME.spacing.lg,
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
