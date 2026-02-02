/**
 * Shared constants for CLI commands
 * AIDEV-NOTE: DRY utility - centralizes exit codes and status values used across all commands
 */

/**
 * Standard exit codes for CLI commands
 * Used consistently across all command implementations
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
  NOT_FOUND: 3,
} as const;

export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];

/**
 * Queue status values matching database schema
 * Source: src/storage/AnalysisQueueRepository.ts:17
 */
export const QUEUE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type QueueStatus = typeof QUEUE_STATUS[keyof typeof QUEUE_STATUS];

/**
 * Array of valid status values for validation
 */
export const VALID_STATUSES: readonly QueueStatus[] = [
  QUEUE_STATUS.PENDING,
  QUEUE_STATUS.IN_PROGRESS,
  QUEUE_STATUS.COMPLETED,
  QUEUE_STATUS.FAILED,
] as const;
