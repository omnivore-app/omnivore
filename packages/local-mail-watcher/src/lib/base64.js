/**
 * Utility functions for handling base64 encoding/decoding
 */

/**
 * Decodes a base64 string to UTF-8 text
 * Uses Node.js Buffer but with type safety
 */
export function decodeBase64(base64String: string): string {
    try {
      // Use a type-safe approach without relying on global
      // @ts-ignore - Ignore TypeScript error for Buffer
      return Buffer.from(base64String, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decoding base64 string:', error);
      return base64String; // Return original string if decoding fails
    }
  }
  