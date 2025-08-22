import { TokenClaims } from '../types';

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp?: string | number): string => {
  if (!timestamp) return 'No timestamp';
  
  const date = typeof timestamp === 'string' 
    ? new Date(parseInt(timestamp)) 
    : new Date(timestamp);
    
  return date.toLocaleString();
};

/**
 * Format message value with JSON pretty printing
 */
export const formatMessageValue = (value?: string): string => {
  if (!value) return '(empty)';
  
  try {
    // Try to parse as JSON for better formatting
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // Return as-is if not JSON
    return value;
  }
};

/**
 * Parse JWT token claims
 */
export const parseTokenClaims = (token?: string): TokenClaims | null => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as TokenClaims;
  } catch (err) {
    console.error('Error parsing token claims:', err);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token?: string): boolean => {
  const claims = parseTokenClaims(token);
  if (!claims?.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return claims.exp < now;
};

/**
 * Get token expiration time as Date
 */
export const getTokenExpiration = (token?: string): Date | null => {
  const claims = parseTokenClaims(token);
  if (!claims?.exp) return null;
  
  return new Date(claims.exp * 1000);
};

/**
 * Mask sensitive strings for display
 */
export const maskSensitiveValue = (value: string, visibleChars: number = 8): string => {
  if (value.length <= visibleChars) return value;
  return `${value.substring(0, visibleChars)}...`;
};

/**
 * Validate environment configuration
 */
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!process.env.REACT_APP_OKTA_ISSUER) {
    errors.push('REACT_APP_OKTA_ISSUER is not configured');
  }
  
  if (!process.env.REACT_APP_OKTA_CLIENT_ID) {
    errors.push('REACT_APP_OKTA_CLIENT_ID is not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T = any>(
  jsonString: string,
  fallback: T
): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Get API base URL
 */
export const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_URL || '';
};
