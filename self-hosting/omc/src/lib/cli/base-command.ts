import { Command } from '@oclif/core';
import { handleCommandError } from './command-utils.js';

/**
 * Abstract base command class for all CLI commands.
 * AIDEV-NOTE: DRY utility - eliminates duplicate run() method across 10 commands
 *
 * @example
 * class MyCommand extends BaseCommand {
 *   protected async execute(): Promise<void> {
 *     // command logic here
 *   }
 * }
 */
export abstract class BaseCommand extends Command {
  // Note: We handle --json manually via shared-flags, not oclif's built-in JSON flag
  static enableJsonFlag = false;

  /**
   * Standard run method with error handling.
   * Pattern: try { parse → execute } catch { handleError }
   * Note: oclif commands should return normally on success, not call this.exit(0)
   */
  async run(): Promise<void> {
    try {
      const { args, flags } = await this.parse(this.constructor as typeof BaseCommand);
      await this.execute({ ...args, ...flags });
      // Success: return normally (oclif handles exit code 0)
    } catch (error) {
      handleCommandError(this, error);
    }
  }

  /**
   * Abstract method to be implemented by each command.
   * Contains command-specific logic.
   * @param flags - Parsed command flags from oclif
   */
  protected abstract execute(flags: Record<string, any>): Promise<void>;
}
