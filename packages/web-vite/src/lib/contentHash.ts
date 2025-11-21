/**
 * Content hash utilities for sentinel-based reading progress
 *
 * Generates stable SHA-256 hashes of HTML content to track versions
 * and detect when article content has changed.
 */

/**
 * Generate a SHA-256 hash of HTML content for version tracking
 *
 * Uses the Web Crypto API for consistent, browser-native hashing.
 * Normalizes whitespace before hashing to ensure consistency.
 *
 * @param html - The HTML content to hash
 * @returns Promise resolving to hex-encoded SHA-256 hash
 */
export async function generateContentHash(html: string): Promise<string> {
  // Normalize whitespace for consistent hashing
  const normalized = html
    .replace(/\s+/g, ' ') // Collapse multiple whitespace to single space
    .trim()

  // Convert string to Uint8Array for Web Crypto API
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)

  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  // Truncate to 64 chars to match database column size
  return hashHex.substring(0, 64)
}

/**
 * Synchronous fallback hash for environments without crypto.subtle
 * Uses simple string hashing algorithm (djb2)
 *
 * @param html - The HTML content to hash
 * @returns Hex-encoded hash string
 */
export function generateContentHashSync(html: string): string {
  const normalized = html.replace(/\s+/g, ' ').trim()

  let hash = 5381
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 33) ^ normalized.charCodeAt(i)
  }

  // Convert to unsigned 32-bit integer, then to hex
  const hashValue = (hash >>> 0).toString(16).padStart(8, '0')

  // Pad to 64 chars for consistency with SHA-256
  return hashValue.padEnd(64, '0')
}

/**
 * Check if the Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}

/**
 * Generate content hash with automatic fallback
 *
 * Prefers Web Crypto API (SHA-256), falls back to simple hash if unavailable
 *
 * @param html - The HTML content to hash
 * @returns Promise resolving to hex-encoded hash
 */
export async function generateContentHashWithFallback(
  html: string
): Promise<string> {
  if (isCryptoAvailable()) {
    return generateContentHash(html)
  }
  
  return generateContentHashSync(html)
}
