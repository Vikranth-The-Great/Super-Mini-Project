import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDate, formatTime, truncateText } from '@food-donation/shared/utils';
import { THEME } from '../config/env';
import type { Donation } from '@food-donation/shared/types';

interface DonationCardProps {
  donation: Donation;
  onPress: () => void;
  showStatus?: boolean;
}

export const DonationCard = ({ donation, onPress, showStatus = true }: DonationCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.header}>
      <Text style={styles.foodName}>{truncateText(donation.food, 30)}</Text>
      {showStatus && <Text style={styles.category}>{donation.category}</Text>}
    </View>

    <Text style={styles.quantity}>Qty: {donation.quantity}</Text>
    <Text style={styles.address}>{truncateText(donation.address, 40)}</Text>

    <View style={styles.footer}>
      <Text style={styles.date}>{formatDate(donation.createdAt)}</Text>
      <Text style={styles.time}>{formatTime(donation.createdAt)}</Text>
    </View>
  </TouchableOpacity>
);

interface DonationListProps {
  donations: Donation[];
  onSelectDonation: (donation: Donation) => void;
}

export const DonationList = ({ donations, onSelectDonation }: DonationListProps) => (
  <FlatList
    data={donations}
    keyExtractor={(item) => item._id}
    renderItem={({ item }) => (
      <DonationCard donation={item} onPress={() => onSelectDonation(item)} />
    )}
    contentContainerStyle={styles.list}
    ListEmptyComponent={
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No donations found</Text>
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
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.dark,
  },
  category: {
    backgroundColor: THEME.colors.primary,
    color: '#fff',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    fontSize: 12,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: THEME.spacing.sm,
  },
  address: {
    fontSize: 13,
    color: '#999',
    marginBottom: THEME.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  time: {
    fontSize: 12,
    color: '#999',
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
