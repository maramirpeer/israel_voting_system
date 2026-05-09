/**
 * Format a date for display (Hebrew locale)
 */
export function formatDate(date: any): string {
  try {
    const d = toDate(date);
    if (!d) return "לא זמין";
    return d.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "לא זמין";
  }
}

/**
 * Convert a value that might be a Date object or a serialized Date to a proper Date
 */
export function toDate(value: any): Date | null {
  if (!value) return null;
  
  // Already a Date object
  if (value instanceof Date) return value;
  
  // ISO string or timestamp
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  
  // Numeric timestamp
  if (typeof value === "number") {
    return new Date(value);
  }
  
  // Empty object from superjson (means null/undefined)
  if (typeof value === "object" && Object.keys(value).length === 0) {
    return null;
  }
  
  return null;
}

/**
 * Get time remaining until a date (returns object with days, hours, minutes)
 */
export function getTimeRemaining(endDate: any): { days: number; hours: number; minutes: number; totalSeconds: number } {
  const end = toDate(endDate);
  if (!end) return { days: 0, hours: 0, minutes: 0, totalSeconds: 0 };
  
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalSeconds: 0 };
  }
  
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  
  return { days, hours, minutes, totalSeconds };
}

/**
 * Format time remaining as a readable string
 */
export function formatTimeRemaining(endDate: any): string {
  const { days, hours, minutes } = getTimeRemaining(endDate);
  
  if (days > 0) {
    return `${days} ימים, ${hours} שעות`;
  }
  if (hours > 0) {
    return `${hours} שעות, ${minutes} דקות`;
  }
  if (minutes > 0) {
    return `${minutes} דקות`;
  }
  
  return "פחות מדקה";
}

/**
 * Check if a date is in the past
 */
export function isPast(date: any): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() < new Date().getTime();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: any): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() > new Date().getTime();
}
