/**
 * Common error messages and error codes
 */

export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',

  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_COORDINATES: 'Invalid coordinates',

  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out',
  SERVER_ERROR: 'Server error. Please try again later.',

  // General errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  NOT_FOUND: 'Not found',
  ALREADY_EXISTS: 'Already exists',
  ACCESS_DENIED: 'Access denied',
};

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'AUTH_001',
  EMAIL_EXISTS: 'AUTH_002',
  USER_NOT_FOUND: 'AUTH_003',
  INVALID_TOKEN: 'AUTH_004',
  UNAUTHORIZED: 'AUTH_401',
  FORBIDDEN: 'AUTH_403',
  NOT_FOUND: 'NOT_FOUND_404',
  SERVER_ERROR: 'SERVER_500',
  NETWORK_ERROR: 'NET_001',
  VALIDATION_ERROR: 'VALIDATION_001',
} as const;
