/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format a date in various formats
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric'
      });
    case 'medium':
      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    case 'full':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    default:
      return dateObj.toLocaleDateString(locale);
  }
}

/**
 * Format a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (Math.abs(seconds) < 60) {
    return rtf.format(-seconds, 'second');
  } else if (Math.abs(minutes) < 60) {
    return rtf.format(-minutes, 'minute');
  } else if (Math.abs(hours) < 24) {
    return rtf.format(-hours, 'hour');
  } else if (Math.abs(days) < 7) {
    return rtf.format(-days, 'day');
  } else if (Math.abs(weeks) < 4) {
    return rtf.format(-weeks, 'week');
  } else if (Math.abs(months) < 12) {
    return rtf.format(-months, 'month');
  } else {
    return rtf.format(-years, 'year');
  }
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(
  num: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}