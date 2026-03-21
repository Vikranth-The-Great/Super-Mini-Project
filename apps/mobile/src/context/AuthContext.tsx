/**
 * Auth Context for mobile
 * Manages authentication state and persistence
 * Uses AsyncStorage instead of localStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/env';
import { ROLE_USER, ROLE_ADMIN, ROLE_DELIVERY } from '@food-donation/shared/constants';
import type { UserRole } from '@food-donation/shared/constants';
import type { AuthUser } from '@food-donation/shared/types';

interface AuthContextType {
  // User
  userToken: string | null;
  user: AuthUser | null;
  loginUser: (token: string, userData: AuthUser) => Promise<void>;
  logoutUser: () => Promise<void>;

  // Admin/NGO
  adminToken: string | null;
  admin: AuthUser | null;
  loginAdmin: (token: string, adminData: AuthUser) => Promise<void>;
  logoutAdmin: () => Promise<void>;

  // Delivery
  deliveryToken: string | null;
  delivery: AuthUser | null;
  loginDelivery: (token: string, deliveryData: AuthUser) => Promise<void>;
  logoutDelivery: () => Promise<void>;

  // Helpers
  currentRole: UserRole | null;
  currentToken: string | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AuthUser | null>(null);

  const [deliveryToken, setDeliveryToken] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<AuthUser | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Restore session on app launch
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [userTokenStored, userStored, adminTokenStored, adminStored, deliveryTokenStored, deliveryStored] =
        await AsyncStorage.multiGet([
          STORAGE_KEYS.USER_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.ADMIN_TOKEN,
          STORAGE_KEYS.ADMIN_DATA,
          STORAGE_KEYS.DELIVERY_TOKEN,
          STORAGE_KEYS.DELIVERY_DATA,
        ]);

      if (userTokenStored[1]) setUserToken(userTokenStored[1]);
      if (userStored[1]) setUser(JSON.parse(userStored[1]));

      if (adminTokenStored[1]) setAdminToken(adminTokenStored[1]);
      if (adminStored[1]) setAdmin(JSON.parse(adminStored[1]));

      if (deliveryTokenStored[1]) setDeliveryToken(deliveryTokenStored[1]);
      if (deliveryStored[1]) setDelivery(JSON.parse(deliveryStored[1]));
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  // User auth
  const loginUser = async (token: string, userData: AuthUser) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_TOKEN, token],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
      ]);
      setUserToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user session:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER_TOKEN, STORAGE_KEYS.USER_DATA]);
      setUserToken(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to logout user:', error);
    }
  };

  // Admin auth
  const loginAdmin = async (token: string, adminData: AuthUser) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ADMIN_TOKEN, token],
        [STORAGE_KEYS.ADMIN_DATA, JSON.stringify(adminData)],
      ]);
      setAdminToken(token);
      setAdmin(adminData);
    } catch (error) {
      console.error('Failed to save admin session:', error);
      throw error;
    }
  };

  const logoutAdmin = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.ADMIN_TOKEN, STORAGE_KEYS.ADMIN_DATA]);
      setAdminToken(null);
      setAdmin(null);
    } catch (error) {
      console.error('Failed to logout admin:', error);
    }
  };

  // Delivery auth
  const loginDelivery = async (token: string, deliveryData: AuthUser) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.DELIVERY_TOKEN, token],
        [STORAGE_KEYS.DELIVERY_DATA, JSON.stringify(deliveryData)],
      ]);
      setDeliveryToken(token);
      setDelivery(deliveryData);
    } catch (error) {
      console.error('Failed to save delivery session:', error);
      throw error;
    }
  };

  const logoutDelivery = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.DELIVERY_TOKEN, STORAGE_KEYS.DELIVERY_DATA]);
      setDeliveryToken(null);
      setDelivery(null);
    } catch (error) {
      console.error('Failed to logout delivery:', error);
    }
  };

  // Helpers - get current role and token
  const getCurrentRole = (): UserRole | null => {
    if (userToken) return ROLE_USER;
    if (adminToken) return ROLE_ADMIN;
    if (deliveryToken) return ROLE_DELIVERY;
    return null;
  };

  const getCurrentToken = (): string | null => {
    return userToken || adminToken || deliveryToken || null;
  };

  const getCurrentUser = (): AuthUser | null => {
    return user || admin || delivery || null;
  };

  const logout = async () => {
    await Promise.all([logoutUser(), logoutAdmin(), logoutDelivery()]);
  };

  const value: AuthContextType = {
    userToken,
    user,
    loginUser,
    logoutUser,
    adminToken,
    admin,
    loginAdmin,
    logoutAdmin,
    deliveryToken,
    delivery,
    loginDelivery,
    logoutDelivery,
    currentRole: getCurrentRole(),
    currentToken: getCurrentToken(),
    currentUser: getCurrentUser(),
    isAuthenticated: !!getCurrentToken(),
    logout,
  };

  // Don't render anything until session is restored
  if (!isInitialized) {
    return null; // Or a splash screen
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
