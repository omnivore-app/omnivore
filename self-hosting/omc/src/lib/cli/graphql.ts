import { getMe } from '@lib/omnivore/client.js';
import type { OmnivoreUser } from '@omc-types/omnivore.js';

/**
 * GraphQL client utilities with error handling.
 * Standardizes error checking and user authentication patterns.
 */

/**
 * Check GraphQL result for errors and throw if found.
 * Handles both GraphQL-level errors and domain-level error codes.
 *
 * AIDEV-NOTE: Pattern from fetch-articles.ts - checks errors at both levels
 * GraphQL errors = network/parse issues, errorCodes = domain errors
 *
 * @throws Error with GraphQL error details
 * @example
 * const result = await client.query(...);
 * checkGraphQLResult(result);
 */
export function checkGraphQLResult(result: unknown): void {
  const errors = getGraphQLErrorMessages(result);
  if (errors.length) throw new Error(`GraphQL errors: ${errors.join(', ')}`);

  const domainError = getDomainError(result);
  if (domainError) throw new Error(domainError);
}

/**
 * Fetch authenticated user's username.
 *
 * @throws Error if authentication fails or username not found
 * @example
 * const username = await fetchUsername();
 * console.log(`Authenticated as: ${username}`);
 */
export async function fetchUsername(): Promise<string> {
  const me = await getMe();

  if (!isOmnivoreUser(me)) throw new Error('Failed to fetch username - authentication may have failed');
  return me.profile.username;
}

function isOmnivoreUser(value: unknown): value is OmnivoreUser {
  if (typeof value !== 'object' || value === null) return false;
  const profile = (value as { profile?: unknown }).profile;
  if (typeof profile !== 'object' || profile === null) return false;
  return typeof (profile as { username?: unknown }).username === 'string';
}

function getGraphQLErrorMessages(result: unknown): string[] {
  if (typeof result !== 'object' || result === null) return [];
  const errors = (result as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return [];
  return errors.map((e) => (typeof e === 'object' && e !== null ? String((e as { message?: unknown }).message ?? '') : '')).filter(Boolean);
}

function getDomainError(result: unknown): string | null {
  const directCodes = extractErrorCodes(result);
  if (directCodes?.length) return `Error: ${directCodes.join(', ')}`;

  if (typeof result !== 'object' || result === null) return null;
  const data = (result as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return null;

  for (const [op, value] of Object.entries(data as Record<string, unknown>)) {
    const codes = extractErrorCodes(value);
    if (codes?.length) return `${op} error: ${codes.join(', ')}`;
  }

  return null;
}

function extractErrorCodes(value: unknown): string[] | null {
  if (typeof value !== 'object' || value === null) return null;
  const codes = (value as { errorCodes?: unknown }).errorCodes;
  if (!Array.isArray(codes)) return null;
  return codes.map(String);
}
