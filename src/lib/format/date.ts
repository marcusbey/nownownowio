import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

export const formatDate = (date: Date): string => {
  return format(date, "MMMM d, yyyy", { locale: enUS });
};

/**
 * Formats a date as a relative time (e.g., "5 minutes ago", "2 hours ago", "3 days ago")
 * @param date The date to format
 * @returns A string representing the relative time
 */
export const formatTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: enUS });
  } catch {
    // Fallback to basic format if there's an error
    return format(dateObj, "MMM d, yyyy", { locale: enUS });
  }
};
