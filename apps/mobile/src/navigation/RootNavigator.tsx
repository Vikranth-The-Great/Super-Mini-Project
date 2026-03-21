import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks';
import { ROLE_USER, ROLE_ADMIN, ROLE_DELIVERY } from '@food-donation/shared/constants';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { DeliveryNavigator } from './DeliveryNavigator';
import { SplashScreen } from '../screens';

/**
 * Root Navigator - handles auth state and navigation routing
 * Shows splash while checking session, then either Auth or App navigator
 */
export const RootNavigator = () => {
  const auth = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Simulate splash screen delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  // Determine which navigator to show based on auth state
  const renderNavigator = () => {
    if (!auth.isAuthenticated) {
      return <AuthNavigator />;
    }

    // Show role-specific navigator
    switch (auth.currentRole) {
      case ROLE_USER:
        return <UserNavigator />;
      case ROLE_ADMIN:
        return <AdminNavigator />;
      case ROLE_DELIVERY:
        return <DeliveryNavigator />;
      default:
        return <AuthNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {renderNavigator()}
    </NavigationContainer>
  );
};
