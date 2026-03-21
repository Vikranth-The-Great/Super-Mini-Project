import type { AxiosError } from 'axios';
import { ERROR_MESSAGES } from '../constants/errors';

/**
 * Error handling utilities - for consistent error messages across apps
 */

export interface ParsedError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Parse API error response to standardized format
 */
export const parseApiError = (error: unknown): ParsedError => {
  // Axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    return {
      message: data?.message || getErrorMessageByStatus(status || 500),
      code: data?.code,
      status,
      details: data,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      message: error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
      details: error,
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    };
  }

  // Unknown error
  return {
    message: ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    details: error,
  };
};

/**
 * Get user-friendly error message by HTTP status code
 */
export const getErrorMessageByStatus = (status: number): string => {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 409:
      return ERROR_MESSAGES.EMAIL_EXISTS;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
  }
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  
  const axiosError = error as any;
  return (
    !axiosError.response &&
    (axiosError.request || axiosError.message?.includes('Network') || axiosError.code === 'ECONNABORTED')
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  
  const axiosError = error as AxiosError;
  return axiosError.response?.status === 401;
};

/**
 * Check if token is expired (usually 401 with specific message)
 */
export const isTokenExpired = (error: unknown): boolean => {
  const parsed = parseApiError(error);
  return parsed.status === 401 && parsed.message.toLowerCase().includes('token');
};
