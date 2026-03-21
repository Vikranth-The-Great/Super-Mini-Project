/**
 * Custom hooks for mobile app
 */

import { useAuth } from '../context/AuthContext';

export { useAuth };

/**
 * Hook to check user's role and get relevant data
 */
export const useAuthRole = () => {
  const auth = useAuth();
  return {
    role: auth.currentRole,
    isUser: auth.currentRole === 'user',
    isAdmin: auth.currentRole === 'admin',
    isDelivery: auth.currentRole === 'delivery',
  };
};

/**
 * Hook to get current user data regardless of role
 */
export const useCurrentUser = () => {
  const auth = useAuth();
  return auth.currentUser;
};

/**
 * Hook to get current token
 */
export const useAuthToken = () => {
  const auth = useAuth();
  return auth.currentToken;
};
