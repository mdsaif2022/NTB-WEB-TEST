// Safe JSON parsing utilities to handle malformed responses

export interface SafeParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Safely parse JSON with error handling
 * @param jsonString - The JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns SafeParseResult with success flag and data or error
 */
export function safeJsonParse<T>(
  jsonString: string,
  fallback?: T
): SafeParseResult<T> {
  try {
    // Check if the string looks like HTML (common error response)
    if (jsonString.trim().startsWith('<!doctype') || 
        jsonString.trim().startsWith('<html') ||
        jsonString.trim().startsWith('<')) {
      return {
        success: false,
        error: 'Response is HTML, not JSON. Server may be returning an error page.',
        data: fallback
      };
    }

    const parsed = JSON.parse(jsonString);
    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    console.error('JSON parsing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
      data: fallback
    };
  }
}

/**
 * Safely parse JSON from a fetch response
 * @param response - The fetch response object
 * @param fallback - Fallback value if parsing fails
 * @returns Promise<SafeParseResult>
 */
export async function safeJsonParseFromResponse<T>(
  response: Response,
  fallback?: T
): Promise<SafeParseResult<T>> {
  try {
    const text = await response.text();
    return safeJsonParse(text, fallback);
  } catch (error) {
    console.error('Response text parsing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read response text',
      data: fallback
    };
  }
}

/**
 * Validate that an object has required properties
 * @param obj - Object to validate
 * @param requiredProps - Array of required property names
 * @returns boolean indicating if all required properties exist
 */
export function validateObjectProperties(
  obj: any,
  requiredProps: string[]
): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return requiredProps.every(prop => 
    obj.hasOwnProperty(prop) && obj[prop] !== undefined && obj[prop] !== null
  );
}

/**
 * Safely access nested object properties
 * @param obj - Object to access
 * @param path - Dot-separated path to the property
 * @param fallback - Fallback value if path doesn't exist
 * @returns The value at the path or fallback
 */
export function safeGet<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(key)) {
        return fallback;
      }
      current = current[key];
    }

    return current !== undefined && current !== null ? current : fallback;
  } catch (error) {
    console.warn(`Error accessing path "${path}":`, error);
    return fallback;
  }
}

/**
 * Type guard to check if a value is a valid array
 * @param value - Value to check
 * @returns boolean indicating if value is a valid array
 */
export function isValidArray(value: any): value is any[] {
  return Array.isArray(value) && value.length >= 0;
}

/**
 * Type guard to check if a value is a valid string
 * @param value - Value to check
 * @returns boolean indicating if value is a valid string
 */
export function isValidString(value: any): value is string {
  return typeof value === 'string' && value.length >= 0;
}

/**
 * Type guard to check if a value is a valid number
 * @param value - Value to check
 * @returns boolean indicating if value is a valid number
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safely filter an array with defensive checks
 * @param array - Array to filter
 * @param predicate - Filter function
 * @returns Filtered array or empty array if input is invalid
 */
export function safeFilter<T>(
  array: any,
  predicate: (item: T, index: number) => boolean
): T[] {
  if (!isValidArray(array)) {
    console.warn('safeFilter: Invalid array input:', array);
    return [];
  }

  try {
    return array.filter(predicate);
  } catch (error) {
    console.error('safeFilter: Error during filtering:', error);
    return [];
  }
}

/**
 * Safely map an array with defensive checks
 * @param array - Array to map
 * @param mapper - Map function
 * @returns Mapped array or empty array if input is invalid
 */
export function safeMap<T, U>(
  array: any,
  mapper: (item: T, index: number) => U
): U[] {
  if (!isValidArray(array)) {
    console.warn('safeMap: Invalid array input:', array);
    return [];
  }

  try {
    return array.map(mapper);
  } catch (error) {
    console.error('safeMap: Error during mapping:', error);
    return [];
  }
}
