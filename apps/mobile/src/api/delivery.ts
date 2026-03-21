/**
 * Delivery API
 * Uses /api/delivery/auth endpoints
 */

import client from './client';
import { API_ROUTES } from '@food-donation/shared/constants';
import type { AuthResponse, DeliverySignupPayload, AuthCredentials, DeliveryData } from '@food-donation/shared/types';

export const deliveryApi = {
  /**
   * Delivery person signup
   */
  register: async (payload: DeliverySignupPayload): Promise<AuthResponse<DeliveryData>> => {
    const response = await client.post(API_ROUTES.DELIVERY_REGISTER, payload);
    return response.data;
  },

  /**
   * Delivery person login
   */
  login: async (credentials: AuthCredentials): Promise<AuthResponse<DeliveryData>> => {
    const response = await client.post(API_ROUTES.DELIVERY_LOGIN, credentials);
    return response.data;
  },

  /**
   * Get current delivery person profile
   */
  getMe: async (): Promise<DeliveryData> => {
    const response = await client.get(API_ROUTES.DELIVERY_ME);
    return response.data;
  },

  /**
   * Get available deliveries (donations needing delivery)
   */
  getAvailableDeliveries: async () => {
    const response = await client.get(API_ROUTES.DONATIONS_AVAILABLE);
    return response.data;
  },

  /**
   * Accept a delivery order
   */
  acceptDelivery: async (donationId: string) => {
    const response = await client.post(API_ROUTES.DONATIONS_ASSIGN(donationId), {});
    return response.data;
  },

  /**
   * Mark delivery as completed
   */
  completeDelivery: async (donationId: string) => {
    const response = await client.post(API_ROUTES.DONATIONS_COMPLETE(donationId), {
      deliveredAt: new Date().toISOString(),
    });
    return response.data;
  },

  /**
   * Get assigned deliveries
   */
  getMyDeliveries: async () => {
    const response = await client.get(API_ROUTES.DONATIONS_MY);
    return response.data;
  },
};
