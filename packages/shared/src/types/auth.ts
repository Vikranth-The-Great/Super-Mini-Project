import type { UserRole } from '../constants/roles';

/**
 * Auth-related types - shared between web and mobile
 */

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserSignupPayload extends AuthCredentials {
  name: string;
  gender: 'M' | 'F' | 'O';
}

export interface AdminSignupPayload extends AuthCredentials {
  name: string;
  address: string;
  location: string;
}

export interface DeliverySignupPayload extends AuthCredentials {
  name: string;
  city: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  gender?: string;
}

export interface AdminData {
  id: string;
  name: string;
  email: string;
  location?: string;
  address?: string;
}

export interface DeliveryData {
  id: string;
  name: string;
  email: string;
  city?: string;
}

export type AuthUser = UserData | AdminData | DeliveryData;

export interface AuthResponse<T extends AuthUser = AuthUser> {
  token: string;
  user?: T;
  person?: T;
  ngo?: T;
  admin?: T;
}

export interface DecodedToken {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
