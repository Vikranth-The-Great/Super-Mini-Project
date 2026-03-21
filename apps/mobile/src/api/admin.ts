/**
 * Admin/NGO API
 * Uses /api/admin/auth and /api/ngos endpoints
 */

import client from './client';
import { API_ROUTES } from '@food-donation/shared/constants';
import type { AuthResponse, AdminSignupPayload, AuthCredentials, AdminData } from '@food-donation/shared/types';

export const adminApi = {
  /**
   * Admin/NGO signup
   */
  register: async (payload: AdminSignupPayload): Promise<AuthResponse<AdminData>> => {
    const response = await client.post(API_ROUTES.ADMIN_REGISTER, payload);
    return response.data;
  },

  /**
   * Admin/NGO login
   */
  login: async (credentials: AuthCredentials): Promise<AuthResponse<AdminData>> => {
    const response = await client.post(API_ROUTES.ADMIN_LOGIN, credentials);
    return response.data;
  },

  /**
   * Get current admin profile
   */
  getMe: async (): Promise<AdminData> => {
    const response = await client.get(API_ROUTES.ADMIN_ME);
    return response.data;
  },
};

export const ngoApi = {
  /**
   * Get available food donations
   */
  getAvailableDonations: async () => {
    const response = await client.get(API_ROUTES.NGOS_FOOD_AVAILABLE);
    return response.data;
  },

  /**
   * Claim a donation
   */
  claimDonation: async (donationId: string) => {
    const response = await client.post(API_ROUTES.DONATIONS_CLAIM(donationId), {});
    return response.data;
  },

  /**
   * Get list of NGOs
   */
  list: async () => {
    const response = await client.get(API_ROUTES.NGOS_LIST);
    return response.data;
  },
};
