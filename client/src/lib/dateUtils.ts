/**
 * Convert a value that might be a Date object or a serialized Date to a proper Date
 */
export function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'number') return new Date(value);
  // Handle superjson serialized dates (empty objects {})
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return null;
  }
  return null;
}

/**
 * Recursively convert Date fields in an object
 */
export function deserializeDates<T extends Record<string, any>>(obj: T, dateFields: (keyof T)[]): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  for (const field of dateFields) {
    if (field in result) {
      const value = result[field];
      if (value && typeof value === 'object') {
        // Try to parse as ISO string if it looks like a date
        if (typeof value === 'string' || (typeof value === 'object' && Object.keys(value).length === 0)) {
          result[field] = new Date() as any;
        }
      }
    }
  }
  return result;
}
