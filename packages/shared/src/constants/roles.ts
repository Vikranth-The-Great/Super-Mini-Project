/**
 * User role constants - used across backend, web, and mobile
 * Must match backend JWT role values
 */

export const ROLE_USER = 'user';
export const ROLE_ADMIN = 'admin';
export const ROLE_NGO = 'admin'; // NGO is implemented as admin role
export const ROLE_DELIVERY = 'delivery';

export const ROLES = {
  USER: ROLE_USER,
  ADMIN: ROLE_ADMIN,
  NGO: ROLE_NGO,
  DELIVERY: ROLE_DELIVERY,
} as const;

export type UserRole = typeof ROLE_USER | typeof ROLE_ADMIN | typeof ROLE_DELIVERY;

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLE_USER]: 'Food Donor',
  [ROLE_ADMIN]: 'NGO / Receiver',
  [ROLE_DELIVERY]: 'Delivery Partner',
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [ROLE_USER]: 'Donor',
  [ROLE_ADMIN]: 'NGO',
  [ROLE_DELIVERY]: 'Delivery',
};
