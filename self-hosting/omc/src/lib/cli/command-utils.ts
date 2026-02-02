import { Command } from '@oclif/core';
import { readFileSync, existsSync } from 'fs';
import { formatSuccess } from './formatters.js';
import { EXIT_CODES } from './constants.js';

/**
 * Shared error handling for all commands.
 * AIDEV-NOTE: DRY utility - eliminates duplicate handleError across 10+ commands
 *
 * @example
 * try {
 *   await doWork();
 * } catch (error) {
 *   handleCommandError(this, error);
 * }
 */
export function handleCommandError(command: Command, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  command.error(message, { exit: false });
  process.exit(EXIT_CODES.ERROR);
}

/**
 * Shared output formatter for JSON vs text modes.
 * AIDEV-NOTE: DRY utility - eliminates duplicate output logic across commands
 *
 * @example
 * outputResult(this, { count: 5 }, 'Processed 5 items', flags.json);
 */
export function outputResult(
  command: Command,
  data: any,
  successMessage: string,
  jsonMode: boolean
): void {
  if (jsonMode) {
    command.log(JSON.stringify(data, null, 2));
  } else {
    command.log(formatSuccess(successMessage));
  }
}

/**
 * Safe JSON parsing with error handling.
 * AIDEV-NOTE: DRY utility - eliminates unsafe JSON.parse across 15+ locations
 *
 * @example
 * const analysis = parseJsonSafely<ContentAnalysis>(job.analysisJson);
 */
export function parseJsonSafely<T>(jsonString: string | undefined, fallback?: T): T | undefined {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

/**
 * Load .env file as key-value pairs.
 * AIDEV-NOTE: DRY utility - eliminates duplicate .env parsing logic
 *
 * @example
 * const config = loadEnvFile('.env');
 */
export function loadEnvFile(envPath: string = '.env'): Record<string, string> {
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
  return env;
}
