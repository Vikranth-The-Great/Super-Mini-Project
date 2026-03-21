import { ERROR_MESSAGES } from '../constants/errors';

/**
 * Validation utilities - shared between web and mobile
 */

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || password.length < 6) {
    return { valid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }
  return { valid: true };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { valid: false, error: ERROR_MESSAGES.PASSWORD_MISMATCH };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phone || !phoneRegex.test(phone.replace(/\D/g, ''))) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_PHONE };
  }
  return { valid: true };
};

export const validateRequired = (
  value: string | number | null | undefined,
  fieldName = 'This field'
): { valid: boolean; error?: string } => {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateCoordinates = (
  latitude: number | string | null | undefined,
  longitude: number | string | null | undefined
): { valid: boolean; error?: string } => {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return { valid: true }; // Optional coordinates are valid
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { valid: false, error: 'Latitude and longitude must be numbers' };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (lon < -180 || lon > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  return { valid: true };
};

/**
 * Form validation helper - validates multiple fields
 */
export const validateForm = (
  fields: Record<string, { value: any; rules: 'required' | 'email' | 'password' | 'phone' }>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
    const { value, rules } = fieldConfig;

    if (rules === 'required') {
      const result = validateRequired(value, fieldName);
      if (!result.valid) errors[fieldName] = result.error || ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (rules === 'email') {
      const result = validateEmail(value);
      if (!result.valid) errors[fieldName] = result.error || ERROR_MESSAGES.INVALID_EMAIL;
    } else if (rules === 'password') {
      const result = validatePassword(value);
      if (!result.valid) errors[fieldName] = result.error || ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    } else if (rules === 'phone') {
      const result = validatePhone(value);
      if (!result.valid) errors[fieldName] = result.error || ERROR_MESSAGES.INVALID_PHONE;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
