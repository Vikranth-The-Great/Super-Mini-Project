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
import type { AuthCredentials, AuthUser } from '@food-donation/shared/types';

interface AdminLoginProps {
  onLoginSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export const AdminLoginScreen = ({ onLoginSuccess, onSwitchToSignup }: AdminLoginProps) => {
  const { loginAdmin } = useAuth();
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

      const response = await adminApi.login(credentials);
      const adminData: AuthUser =
        response.admin ??
        response.ngo ??
        response.user ??
        ({ id: '', name: 'NGO', email: formData.email } as AuthUser);

      await loginAdmin(response.token, adminData);
      onLoginSuccess?.();
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NGO Login</Text>

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
        <Text style={styles.link}>New NGO account? Sign Up</Text>
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
