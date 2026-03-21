/**
 * Authentication API - User signup/login
 * Uses /api/auth endpoints
 */

import client from './client';
import { API_ROUTES } from '@food-donation/shared/constants';
import type { AuthResponse, UserSignupPayload, AuthCredentials, UserData } from '@food-donation/shared/types';

export const authApi = {
  /**
   * User signup
   */
  register: async (payload: UserSignupPayload): Promise<AuthResponse<UserData>> => {
    const response = await client.post(API_ROUTES.USER_REGISTER, payload);
    return response.data;
  },

  /**
   * User login
   */
  login: async (credentials: AuthCredentials): Promise<AuthResponse<UserData>> => {
    const response = await client.post(API_ROUTES.USER_LOGIN, credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<UserData> => {
    const response = await client.get(API_ROUTES.USER_ME);
    return response.data;
  },
};
