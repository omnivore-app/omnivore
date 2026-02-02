import { BaseCommand } from '@lib/cli/base-command.js';
import { Args, Flags } from '@oclif/core';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatHeader, formatSuccess, formatError } from '@lib/cli/formatters.js';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Restore database from backup.
 * AIDEV-NOTE: Requires --force flag for safety
 */
export default class DbRestore extends BaseCommand {
  static override description = 'Restore database from backup';

  static override examples = [
    '$ omc db restore data/backup.db --force',
    '$ omc db restore data/backup.db --force --json',
  ];

  static override args = {
    backupPath: Args.string({ description: 'Path to backup file', required: true }),
  };

  static override flags = {
    json: jsonFlag(),
    force: Flags.boolean({ description: 'Skip confirmation', default: false }),
  };

  async execute(flags: any): Promise<void> {
    const { args } = await this.parse(DbRestore);
    const backupPath = args.backupPath;

    this.validateInputs(backupPath, flags.force);
    const dbPath = this.performRestore(backupPath);
    this.displayResult(flags, backupPath, dbPath);
  }

  private validateInputs(backupPath: string, force: boolean): void {
    if (!existsSync(backupPath)) {
      this.error(formatError(`Backup file not found: ${backupPath}`));
    }
    if (!force) {
      this.error('--force flag required for restore operation');
    }
  }

  private performRestore(backupPath: string): string {
    const dbPath = join(process.cwd(), 'data/omnivore-content.db');
    copyFileSync(backupPath, dbPath);
    return dbPath;
  }

  private displayResult(flags: any, backupPath: string, dbPath: string): void {
    const result = { restored: true, from: backupPath, to: dbPath };

    if (flags.json) {
      this.log(JSON.stringify(result, null, 2));
    } else {
      this.log(formatHeader('Database Restore'));
      this.log(formatSuccess(`Restored from: ${backupPath}`));
    }
  }
}
