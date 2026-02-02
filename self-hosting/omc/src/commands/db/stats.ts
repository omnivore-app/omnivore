import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { getTableCounts } from '@storage/database.js';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Display database statistics.
 * AIDEV-NOTE: Shows table counts and file size
 */
export default class DbStats extends BaseCommand {
  static override description = 'Show database statistics';

  static override examples = [
    '$ omc db stats',
    '$ omc db stats --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ db }) => {
      const counts = getTableCounts(db);
      const dbPath = join(process.cwd(), 'data/omnivore-content.db');
      const fileSize = this.getFileSize(dbPath);

      const result = { tables: counts, fileSize };

      if (flags.json) {
        this.log(JSON.stringify(result, null, 2));
      } else {
        this.displayStats(counts, fileSize);
      }
    });
  }

  private getFileSize(path: string): number {
    return existsSync(path) ? statSync(path).size : 0;
  }

  private displayStats(counts: Record<string, number>, size: number): void {
    this.log(formatHeader('Database Statistics'));
    this.log(`File size: ${this.formatBytes(size)}\n`);
    this.log('Table Row Counts:');
    for (const [table, count] of Object.entries(counts)) {
      this.log(`  ${table.padEnd(30)} ${count.toLocaleString()}`);
    }
  }

  private formatBytes(bytes: number): string {
    return bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(2)} KB`;
  }
}
