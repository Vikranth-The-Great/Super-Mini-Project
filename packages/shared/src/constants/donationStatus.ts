/**
 * Donation status constants
 * Derived from donation model fields: deliveredAt, deliveryBy, assignedTo
 */

export const DONATION_STATUS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
} as const;

export type DonationStatus = typeof DONATION_STATUS[keyof typeof DONATION_STATUS];

export const STATUS_COLORS: Record<DonationStatus, string> = {
  [DONATION_STATUS.PENDING]: '#FFA500', // Orange
  [DONATION_STATUS.ASSIGNED]: '#4169E1', // Blue
  [DONATION_STATUS.IN_TRANSIT]: '#FF6347', // Tomato
  [DONATION_STATUS.DELIVERED]: '#228B22', // Forest Green
};

export const STATUS_PRIORITY: Record<DonationStatus, number> = {
  [DONATION_STATUS.PENDING]: 1,
  [DONATION_STATUS.ASSIGNED]: 2,
  [DONATION_STATUS.IN_TRANSIT]: 3,
  [DONATION_STATUS.DELIVERED]: 4,
};

/**
 * Determine donation status based on timestamps and assignments
 */
export const getDonationStatus = (donation: {
  deliveredAt?: string | null;
  deliveryBy?: string | null;
  assignedTo?: string | null;
}): DonationStatus => {
  if (donation.deliveredAt) return DONATION_STATUS.DELIVERED;
  if (donation.deliveryBy) return DONATION_STATUS.IN_TRANSIT;
  if (donation.assignedTo) return DONATION_STATUS.ASSIGNED;
  return DONATION_STATUS.PENDING;
};
