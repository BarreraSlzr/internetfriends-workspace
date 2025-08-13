/**
 * Timestamp utilities for consistent date/time handling across the application
 * Prevents raw Date() usage and provides standardized timestamp formats
 */

/**
 * Generate ISO timestamp string (standardized format)
 * @returns ISO 8601 timestamp string
 */
export function getIsoTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get current timestamp as number (milliseconds since epoch)
 * @returns Timestamp as number for calculations
 */
export function getTimestamp(): number {
  return Date.now();
}

/**
 * Generate compact timestamp stamp for IDs and tracking
 * Format: YYYYMMDDHHMMSSXXX (17 chars)
 * @returns Compact timestamp string suitable for IDs
 */
export function generateStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 15);
}

/**
 * Generate unique ID with timestamp prefix
 * @param prefix Optional prefix for the ID
 * @returns Unique ID string with timestamp
 */
export function generateTimestampId(prefix?: string): string {
  const stamp = generateStamp();
  const random = Math.random().toString(36).slice(2, 8);
  return prefix ? `${prefix}-${stamp}-${random}` : `${stamp}-${random}`;
}

/**
 * Parse timestamp back to Date object
 * @param timestamp ISO timestamp string or stamp
 * @returns Date object
 */
export function parseTimestamp(timestamp: string): Date {
  // Handle both ISO and stamp formats
  if (timestamp.includes("T")) {
    return new Date(timestamp);
  } else {
    // Parse stamp format: YYYYMMDDHHMMSSXXX
    const year = parseInt(timestamp.slice(0, 4));
    const month = parseInt(timestamp.slice(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(timestamp.slice(6, 8));
    const hour = parseInt(timestamp.slice(8, 10));
    const minute = parseInt(timestamp.slice(10, 12));
    const second = parseInt(timestamp.slice(12, 14));
    return new Date(year, month, day, hour, minute, second);
  }
}

/**
 * Format timestamp for display
 * @param timestamp ISO timestamp string
 * @param format Display format option
 * @returns Formatted timestamp string
 */
export function formatTimestamp(
  timestamp: string,
  format: "full" | "date" | "time" | "relative" = "full",
): string {
  const date = new Date(timestamp);

  switch (format) {
    case "full":
      return date.toLocaleString();
    case "date":
      return date.toLocaleDateString();
    case "time":
      return date.toLocaleTimeString();
    case "relative":
      return getRelativeTime(date);
    default:
      return date.toISOString();
  }
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 * @param date Date object
 * @returns Relative time string
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}
