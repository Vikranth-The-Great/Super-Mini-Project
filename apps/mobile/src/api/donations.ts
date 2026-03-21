/**
 * Donations API
 * Create, view, and manage donations
 */

import client from './client';
import { API_ROUTES } from '@food-donation/shared/constants';
import type { DonationCreatePayload, Donation } from '@food-donation/shared/types';

export const donationApi = {
  /**
   * Create a new donation
   */
  create: async (payload: DonationCreatePayload): Promise<Donation> => {
    const response = await client.post(API_ROUTES.DONATIONS_CREATE, payload);
    return response.data;
  },

  /**
   * Get all donations for current user
   */
  getMyDonations: async (): Promise<Donation[]> => {
    const response = await client.get(API_ROUTES.DONATIONS_MY);
    return response.data;
  },

  /**
   * Get all available donations (for NGO/delivery view)
   */
  getAll: async (): Promise<Donation[]> => {
    const response = await client.get(API_ROUTES.DONATIONS_ALL);
    return response.data;
  },

  /**
   * Get available donations for claiming (NGO view)
   */
  getAvailable: async (): Promise<Donation[]> => {
    const response = await client.get(API_ROUTES.DONATIONS_AVAILABLE);
    return response.data;
  },

  /**
   * Get a single donation by ID
   */
  getById: async (id: string): Promise<Donation> => {
    const response = await client.get(`/donations/${id}`);
    return response.data;
  },

  /**
   * Cancel a donation
   */
  cancel: async (id: string) => {
    const response = await client.post(API_ROUTES.DONATIONS_CANCEL(id), {});
    return response.data;
  },
};
