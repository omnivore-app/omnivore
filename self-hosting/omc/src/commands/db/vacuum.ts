import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader, formatSuccess } from '@lib/cli/formatters.js';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Optimize database by running VACUUM.
 * AIDEV-NOTE: Reclaims unused space and defragments
 */
export default class DbVacuum extends BaseCommand {
  static override description = 'Optimize database with VACUUM';

  static override examples = [
    '$ omc db vacuum',
    '$ omc db vacuum --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  // AIDEV-NOTE: Execute split into helpers for function length compliance
  protected async execute(flags: any): Promise<void> {
    const dbPath = join(process.cwd(), 'data/omnivore-content.db');
    const sizeBefore = this.getFileSize(dbPath);

    await withDatabase(async ({ db }) => {
      db.exec('VACUUM');
    });

    const sizeAfter = this.getFileSize(dbPath);
    const result = this.buildResult(sizeBefore, sizeAfter);

    this.displayResult(result, flags.json);
  }

  private buildResult(
    sizeBefore: number,
    sizeAfter: number
  ): { sizeBefore: number; sizeAfter: number; savedBytes: number } {
    return {
      sizeBefore,
      sizeAfter,
      savedBytes: sizeBefore - sizeAfter,
    };
  }

  private displayResult(
    result: { sizeBefore: number; sizeAfter: number; savedBytes: number },
    asJson: boolean
  ): void {
    if (asJson) {
      this.log(JSON.stringify(result, null, 2));
    } else {
      this.log(formatHeader('Database Vacuum'));
      this.log(`Size before: ${this.formatBytes(result.sizeBefore)}`);
      this.log(`Size after:  ${this.formatBytes(result.sizeAfter)}`);
      this.log(formatSuccess(`Saved ${this.formatBytes(result.savedBytes)}`));
    }
  }

  private getFileSize(path: string): number {
    return existsSync(path) ? statSync(path).size : 0;
  }

  private formatBytes(bytes: number): string {
    return bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(2)} KB`;
  }
}
