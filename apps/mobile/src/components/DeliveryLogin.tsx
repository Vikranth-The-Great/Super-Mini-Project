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
import { AxiosError } from 'axios';
import { useAuth } from '../hooks';
import { deliveryApi } from '../api/delivery';
import { THEME } from '../config/env';
import type { AuthCredentials, AuthUser } from '@food-donation/shared/types';

interface DeliveryLoginProps {
  onLoginSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export const DeliveryLoginScreen = ({ onLoginSuccess, onSwitchToSignup }: DeliveryLoginProps) => {
  const { loginDelivery } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!formData.email || !formData.password) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const credentials: AuthCredentials = {
        email: formData.email,
        password: formData.password,
      };

      const response = await deliveryApi.login(credentials);
      const deliveryData: AuthUser =
        response.person ??
        response.user ??
        ({ id: '', name: 'Delivery', email: formData.email } as AuthUser);

      await loginDelivery(response.token, deliveryData);
      onLoginSuccess?.();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || axiosError.message;

      if (status === 409) {
        Alert.alert('Account Exists', 'This email is already registered. Please use your password to login.');
      } else {
        Alert.alert('Login Failed', message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToSignup}>
        <Text style={styles.link}>New delivery account? Sign Up</Text>
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
    backgroundColor: THEME.colors.warning,
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
    color: THEME.colors.warning,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
    textDecorationLine: 'underline',
  },
});
