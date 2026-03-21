import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ROLE_USER, ROLE_ADMIN, ROLE_DELIVERY } from '@food-donation/shared/constants';
import { THEME } from '../config/env';

interface RoleButtonProps {
  role: string;
  label: string;
  description: string;
  onPress: () => void;
}

const RoleButton = ({ role, label, description, onPress }: RoleButtonProps) => (
  <TouchableOpacity style={styles.roleCard} onPress={onPress}>
    <Text style={styles.roleLabel}>{label}</Text>
    <Text style={styles.roleDescription}>{description}</Text>
  </TouchableOpacity>
);

interface RoleSelectionProps {
  onSelectRole: (role: string) => void;
}

export const RoleSelection = ({ onSelectRole }: RoleSelectionProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Select Your Role</Text>
    <Text style={styles.subtitle}>Choose what you'd like to do</Text>

    <RoleButton
      role={ROLE_USER}
      label="🍎 Food Donor"
      description="Donate excess food"
      onPress={() => onSelectRole(ROLE_USER)}
    />

    <RoleButton
      role={ROLE_ADMIN}
      label="🏢 NGO/Receiver"
      description="Claim food donations"
      onPress={() => onSelectRole(ROLE_ADMIN)}
    />

    <RoleButton
      role={ROLE_DELIVERY}
      label="🔄 Delivery Partner"
      description="Deliver donations"
      onPress={() => onSelectRole(ROLE_DELIVERY)}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
    color: THEME.colors.dark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: THEME.spacing.xl,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: THEME.colors.light,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: THEME.spacing.sm,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
});
