/**
 * Environment and configuration variables
 * Customize API_BASE_URL based on your backend server
 */

import Constants from 'expo-constants';

// ===== IMPORTANT: UPDATE THIS FOR YOUR BACKEND =====
// Local development (use your machine IP for Android emulator)
// const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Change to your IP
// VS Code tunneling or ngrok
// const API_BASE_URL = 'https://your-ngrok-url.ngrok.io/api';
// Production
// const API_BASE_URL = 'https://your-production-server.com/api';

const getExpoHost = () => {
  const possibleHostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ||
    (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost ||
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2?.extra?.expoGo?.debuggerHost;

  if (!possibleHostUri) return null;

  return possibleHostUri.split(':')[0];
};

const inferredHost = getExpoHost();
const fallbackBaseUrl = inferredHost ? `http://${inferredHost}:5000/api` : 'http://10.0.2.2:5000/api';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || fallbackBaseUrl;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000, // 10 seconds
  RETRY_COUNT: 3,
};

export const APP_CONFIG = {
  APP_NAME: 'Food Donation',
  VERSION: '1.0.0',
  LOG_ENABLED: __DEV__, // Only log in development
};

export const THEME = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4169E1',
    success: '#228B22',
    warning: '#FFA500',
    danger: '#FF4444',
    light: '#F5F5F5',
    dark: '#333333',
    border: '#E0E0E0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  ADMIN_TOKEN: 'admin_token',
  DELIVERY_TOKEN: 'delivery_token',
  USER_DATA: 'user_data',
  ADMIN_DATA: 'admin_data',
  DELIVERY_DATA: 'delivery_data',
  CURRENT_ROLE: 'current_role',
};
