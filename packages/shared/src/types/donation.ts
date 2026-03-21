import type { DonationStatus } from '../constants/donationStatus';

/**
 * Donation types - shared between web and mobile
 */

export interface DonationCreatePayload {
  food: string;
  type?: string;
  category: string;
  quantity: string;
  location: string;
  address: string;
  latitude?: number | string;
  longitude?: number | string;
  expiryDate: string;
  expiryTime: string;
  phoneno?: string;
}

export interface Donation {
  _id: string;
  donorName: string;
  food: string;
  category: string;
  quantity: string;
  phoneno: string;
  location: string;
  address: string;
  latitude?: string | number;
  longitude?: string | number;
  createdAt: string;
  expiryDate: string;
  expiryTime: string;
  // Status related fields
  assignedTo?: string; // NGO ID
  deliveryBy?: string; // Delivery person ID
  deliveredAt?: string; // Timestamp when delivered
  // For NGO view
  status?: DonationStatus;
  // For delivery view
  userId?: string;
}

export interface DonationWithStatus extends Donation {
  status: DonationStatus;
}

export interface ClaimDonationPayload {
  ngoId: string;
}

export interface AssignDonationPayload {
  deliveryPersonId: string;
}

export interface CompleteDonationPayload {
  deliveredAt: string;
}
