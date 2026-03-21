import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks';
import { THEME } from '../config/env';

export const ProfileScreen = ({ navigation }: any) => {
  const { currentUser, currentRole, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </View>

        <Text style={styles.name}>{currentUser?.name || 'Unknown User'}</Text>
        <Text style={styles.email}>{currentUser?.email || 'No email'}</Text>
        <Text style={styles.role}>{currentRole?.toUpperCase() || 'Unknown Role'}</Text>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        {(currentUser as any)?.location && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{(currentUser as any).location}</Text>
          </View>
        )}

        {(currentUser as any)?.city && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>City:</Text>
            <Text style={styles.detailValue}>{(currentUser as any).city}</Text>
          </View>
        )}

        {(currentUser as any)?.gender && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gender:</Text>
            <Text style={styles.detailValue}>{(currentUser as any).gender}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  avatar: {
    fontSize: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: THEME.spacing.sm,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: THEME.spacing.sm,
  },
  role: {
    fontSize: 12,
    backgroundColor: THEME.colors.primary,
    color: '#fff',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.md,
  },
  detailsSection: {
    padding: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.dark,
    marginBottom: THEME.spacing.md,
  },
  detailRow: {
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: THEME.spacing.xs,
  },
  detailValue: {
    fontSize: 14,
    color: THEME.colors.dark,
  },
  actionsSection: {
    padding: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
  },
  logoutButton: {
    backgroundColor: THEME.colors.danger,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
