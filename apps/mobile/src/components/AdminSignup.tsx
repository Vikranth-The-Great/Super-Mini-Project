import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks';
import { adminApi } from '../api/admin';
import { THEME } from '../config/env';
import type { AdminSignupPayload, AuthUser } from '@food-donation/shared/types';

interface AdminSignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const AdminSignupScreen = ({ onSignupSuccess, onSwitchToLogin }: AdminSignupProps) => {
  const { loginAdmin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    location: '',
  });

  const handleSignup = async () => {
    setLoading(true);
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.address || !formData.location) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      const payload: AdminSignupPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        location: formData.location,
      };

      const response = await adminApi.register(payload);
      const adminData: AuthUser =
        response.admin ??
        response.ngo ??
        response.user ??
        ({ id: '', name: formData.name, email: formData.email, location: formData.location } as AuthUser);

      await loginAdmin(response.token, adminData);
      onSignupSuccess?.();
    } catch (error) {
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create NGO Account</Text>

      <TextInput style={styles.input} placeholder="NGO Name" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} editable={!loading} />
      <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
      <TextInput style={styles.input} placeholder="Password" value={formData.password} onChangeText={(text) => setFormData({ ...formData, password: text })} secureTextEntry editable={!loading} />
      <TextInput style={styles.input} placeholder="Confirm Password" value={formData.confirmPassword} onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })} secureTextEntry editable={!loading} />
      <TextInput style={styles.input} placeholder="Address" value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} editable={!loading} />
      <TextInput style={styles.input} placeholder="Location/City" value={formData.location} onChangeText={(text) => setFormData({ ...formData, location: text })} editable={!loading} />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin}>
        <Text style={styles.link}>Already have NGO account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.lg,
    color: THEME.colors.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    fontSize: 16,
  },
  button: {
    backgroundColor: THEME.colors.secondary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: THEME.colors.secondary,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
    textDecorationLine: 'underline',
  },
});
