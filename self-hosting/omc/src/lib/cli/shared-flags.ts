import { Flags } from '@oclif/core';
import { VALID_STATUSES } from './constants.js';

/**
 * Shared flag definitions for CLI commands
 * AIDEV-NOTE: DRY utility - eliminates duplicate flag definitions across 10 commands
 * Reference: OCLIF docs recommend baseFlags pattern for shared flags
 */

/**
 * JSON output flag - used by all 10 commands
 * Appears in every command with identical definition
 */
export const jsonFlag = () =>
  Flags.boolean({
    description: 'Output as JSON',
    default: false,
  });

/**
 * Status filter flag - used by queue list and content list
 * Options match QUEUE_STATUS constants
 */
export const statusFlag = () =>
  Flags.string({
    description: 'Filter by status',
    options: [...VALID_STATUSES],
  });
