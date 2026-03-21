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
import type { DeliverySignupPayload, AuthUser } from '@food-donation/shared/types';

interface DeliverySignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const DeliverySignupScreen = ({ onSignupSuccess, onSwitchToLogin }: DeliverySignupProps) => {
  const { loginDelivery } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
  });

  const handleSignup = async () => {
    setLoading(true);
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.city) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      const payload: DeliverySignupPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city,
      };

      const response = await deliveryApi.register(payload);
      const deliveryData: AuthUser =
        response.person ??
        response.user ??
        ({ id: '', name: formData.name, email: formData.email, city: formData.city } as AuthUser);

      await loginDelivery(response.token, deliveryData);
      onSignupSuccess?.();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || axiosError.message;

      // If account already exists, seamlessly attempt login with the same credentials.
      if (status === 409) {
        try {
          const loginResponse = await deliveryApi.login({
            email: formData.email,
            password: formData.password,
          });

          const deliveryData: AuthUser =
            loginResponse.person ??
            loginResponse.user ??
            ({ id: '', name: formData.name, email: formData.email, city: formData.city } as AuthUser);

          await loginDelivery(loginResponse.token, deliveryData);
          Alert.alert('Welcome Back', 'You already had an account, so we logged you in.');
          onSignupSuccess?.();
          return;
        } catch (loginError) {
          Alert.alert(
            'Account Exists',
            'This delivery email is already registered. Please go back and use Login with the correct password.'
          );
          return;
        }
      }

      Alert.alert('Signup Failed', message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Delivery Account</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} editable={!loading} />
      <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
      <TextInput style={styles.input} placeholder="Password" value={formData.password} onChangeText={(text) => setFormData({ ...formData, password: text })} secureTextEntry editable={!loading} />
      <TextInput style={styles.input} placeholder="Confirm Password" value={formData.confirmPassword} onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })} secureTextEntry editable={!loading} />
      <TextInput style={styles.input} placeholder="City" value={formData.city} onChangeText={(text) => setFormData({ ...formData, city: text })} editable={!loading} />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin}>
        <Text style={styles.link}>Already have delivery account? Login</Text>
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
