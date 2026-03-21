/**
 * Data formatting utilities - shared between web and mobile
 */

/**
 * Format date to locale string
 */
export const formatDate = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr?.toString() || '';
  }
};

/**
 * Format time to locale string
 */
export const formatTime = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateStr?.toString() || '';
  }
};

/**
 * Format date and time together
 */
export const formatDateTime = (dateStr: string | Date): string => {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

/**
 * Format time range
 */
export const formatTimeRange = (startStr: string, endStr: string): string => {
  const start = formatTime(startStr);
  const end = formatTime(endStr);
  return `${start} - ${end}`;
};

/**
 * Relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;

    return formatDate(date);
  } catch {
    return dateStr?.toString() || '';
  }
};

/**
 * Format quantity with units
 */
export const formatQuantity = (quantity: string | number, unit = 'units'): string => {
  return `${quantity} ${unit}`;
};

/**
 * Format location coordinates as decimal degrees
 */
export const formatCoordinates = (latitude?: number | string, longitude?: number | string): string => {
  if (!latitude || !longitude) return '';
  const lat = Number(latitude).toFixed(4);
  const lon = Number(longitude).toFixed(4);
  return `${lat}, ${lon}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
