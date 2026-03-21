import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  RoleSelection,
  UserLoginScreen,
  UserSignupScreen,
  AdminLoginScreen,
  AdminSignupScreen,
  DeliveryLoginScreen,
  DeliverySignupScreen,
} from '../components';
import { ROLE_USER, ROLE_ADMIN, ROLE_DELIVERY } from '@food-donation/shared/constants';
import { THEME } from '../config/env';

type AuthStep = 'role' | 'login' | 'signup';

export const AuthScreen = () => {
  const [step, setStep] = useState<AuthStep>('role');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setStep('login');
  };

  const handleLoginSuccess = () => {
    // Navigation will handle the route change via auth state
  };

  const handleSignupSuccess = () => {
    // Navigation will handle the route change via auth state
  };

  const handleBackToRoleSelection = () => {
    setStep('role');
    setSelectedRole(null);
  };

  return (
    <View style={styles.container}>
      {step === 'role' && <RoleSelection onSelectRole={handleSelectRole} />}

      {step === 'login' && selectedRole === ROLE_USER && (
        <UserLoginScreen onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setStep('signup')} />
      )}

      {step === 'login' && selectedRole === ROLE_ADMIN && (
        <AdminLoginScreen onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setStep('signup')} />
      )}

      {step === 'login' && selectedRole === ROLE_DELIVERY && (
        <DeliveryLoginScreen onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setStep('signup')} />
      )}

      {step === 'signup' && selectedRole === ROLE_USER && (
        <UserSignupScreen onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setStep('login')} />
      )}

      {step === 'signup' && selectedRole === ROLE_ADMIN && (
        <AdminSignupScreen onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setStep('login')} />
      )}

      {step === 'signup' && selectedRole === ROLE_DELIVERY && (
        <DeliverySignupScreen onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setStep('login')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
