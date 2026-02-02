import { BaseCommand } from '@lib/cli/base-command.js';
import { Flags } from '@oclif/core';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatHeader, formatSuccess } from '@lib/cli/formatters.js';
import { withDatabase } from '@lib/cli/database.js';
import { join } from 'path';

/**
 * Create database backup.
 * AIDEV-NOTE: Uses better-sqlite3 backup API for safe copy
 */
export default class DbBackup extends BaseCommand {
  static override description = 'Create database backup';

  static override examples = [
    '$ omc db backup',
    '$ omc db backup --destination data/backup.db',
    '$ omc db backup --json',
  ];

  static override flags = {
    json: jsonFlag(),
    destination: Flags.string({
      description: 'Backup file path',
    }),
  };

  protected async execute(flags: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = flags.destination || join(process.cwd(), `data/backup-${timestamp}.db`);

    await withDatabase(async ({ db }) => {
      db.backup(dest);
      const result = { destination: dest, timestamp };

      if (flags.json) {
        this.log(JSON.stringify(result, null, 2));
      } else {
        this.log(formatHeader('Database Backup'));
        this.log(formatSuccess(`Backup created: ${dest}`));
      }
    });
  }
}
