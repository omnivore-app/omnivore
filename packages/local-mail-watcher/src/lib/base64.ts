/**
 * Utility functions for handling base64 encoding/decoding
 */

/**
 * Decodes a base64 string to UTF-8 text
 * Uses Node.js Buffer with type safety
 */
export function decodeBase64(base64String: string): string {
  try {
    return Buffer.from(base64String, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Error decoding base64 string:', error);
    return base64String; // Return original string if decoding fails
  }
}
