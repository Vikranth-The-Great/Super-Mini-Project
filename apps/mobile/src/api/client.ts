import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/env';
import { ROLE_USER, ROLE_ADMIN, ROLE_DELIVERY } from '@food-donation/shared/constants';
import { STORAGE_KEYS } from '../config/env';

/**
 * Axios instance with token injection and error handling
 * Automatically attaches Bearer token from AsyncStorage
 */

const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor: attach token
client.interceptors.request.use(
  async (config) => {
    try {
      // Try to get token for current role
      const userToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const adminToken = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const deliveryToken = await AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_TOKEN);

      // Use whichever token is available
      const token = userToken || adminToken || deliveryToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear all tokens on 401
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.ADMIN_TOKEN,
        STORAGE_KEYS.DELIVERY_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ADMIN_DATA,
        STORAGE_KEYS.DELIVERY_DATA,
      ]);
      // Auth context will handle logout and redirect to login
    }

    return Promise.reject(error);
  }
);

export default client;
