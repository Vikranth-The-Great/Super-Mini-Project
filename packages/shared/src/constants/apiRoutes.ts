/**
 * API route constants - shared between web and mobile
 * All routes are relative to /api base URL
 */

export const API_ROUTES = {
  // User Auth
  USER_REGISTER: '/auth/register',
  USER_LOGIN: '/auth/login',
  USER_ME: '/auth/me',

  // NGO/Admin Auth (supports both /api/admin/auth and /api/ngo/auth)
  ADMIN_REGISTER: '/admin/auth/register',
  ADMIN_LOGIN: '/admin/auth/login',
  ADMIN_ME: '/admin/auth/me',

  NGO_REGISTER: '/ngo/auth/register',
  NGO_LOGIN: '/ngo/auth/login',
  NGO_ME: '/ngo/auth/me',

  // Delivery Auth
  DELIVERY_REGISTER: '/delivery/auth/register',
  DELIVERY_LOGIN: '/delivery/auth/login',
  DELIVERY_ME: '/delivery/auth/me',

  // Donations
  DONATIONS_CREATE: '/donations',
  DONATIONS_MY: '/donations/my',
  DONATIONS_ALL: '/donations/all',
  DONATIONS_AVAILABLE: '/donations/available',
  DONATIONS_CLAIM: (id: string) => `/donations/${id}/claim`,
  DONATIONS_ASSIGN: (id: string) => `/donations/${id}/assign`,
  DONATIONS_COMPLETE: (id: string) => `/donations/${id}/complete`,
  DONATIONS_CANCEL: (id: string) => `/donations/${id}/cancel`,

  // NGOs
  NGOS_FOOD_AVAILABLE: '/ngos/food-availability',
  NGOS_LIST: '/ngos/list',
  NGOS_AVAILABLE_FOR_DONATION: (id: string) => `/ngos/available-for/${id}`,

  // Notifications
  NOTIFICATIONS_MY: '/notifications/my',
  NOTIFICATIONS_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',

  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_FOOD_STATS: '/analytics/food-stats',

  // Feedback
  FEEDBACK_CREATE: '/feedback',
  FEEDBACK_LIST: '/feedback/list',

  // Health
  HEALTH: '/health',
} as const;

/**
 * Helper to get auth routes for a specific role
 */
export const getAuthRoutes = (role: 'user' | 'admin' | 'ngo' | 'delivery') => {
  const routes: Record<string, { register: string; login: string; me: string }> = {
    user: {
      register: API_ROUTES.USER_REGISTER,
      login: API_ROUTES.USER_LOGIN,
      me: API_ROUTES.USER_ME,
    },
    admin: {
      register: API_ROUTES.ADMIN_REGISTER,
      login: API_ROUTES.ADMIN_LOGIN,
      me: API_ROUTES.ADMIN_ME,
    },
    ngo: {
      register: API_ROUTES.NGO_REGISTER,
      login: API_ROUTES.NGO_LOGIN,
      me: API_ROUTES.NGO_ME,
    },
    delivery: {
      register: API_ROUTES.DELIVERY_REGISTER,
      login: API_ROUTES.DELIVERY_LOGIN,
      me: API_ROUTES.DELIVERY_ME,
    },
  };
  return routes[role] || routes.user;
};
