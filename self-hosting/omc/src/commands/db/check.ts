import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader, formatSuccess, formatError } from '@lib/cli/formatters.js';

/**
 * Verify database integrity.
 * AIDEV-NOTE: Runs PRAGMA checks for corruption detection
 */
export default class DbCheck extends BaseCommand {
  static override description = 'Verify database integrity';

  static override examples = [
    '$ omc db check',
    '$ omc db check --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  async execute(flags: any): Promise<void> {
    await withDatabase(async ({ db }) => {
      const integrity = this.checkIntegrity(db);
      const foreignKeys = this.checkForeignKeys(db);
      const isHealthy = integrity.ok && foreignKeys.length === 0;

      const result = { ok: isHealthy, integrity, foreignKeys };

      if (flags.json) {
        this.log(JSON.stringify(result, null, 2));
      } else {
        this.displayCheckResults(integrity, foreignKeys, isHealthy);
      }
    });
  }

  private checkIntegrity(db: any): { ok: boolean; message: string } {
    const result = db.pragma('integrity_check');
    const message = result[0]?.integrity_check || 'ok';
    return { ok: message === 'ok', message };
  }

  private checkForeignKeys(db: any): any[] {
    return db.pragma('foreign_key_check');
  }

  private displayCheckResults(integrity: any, fkIssues: any[], ok: boolean): void {
    this.log(formatHeader('Database Integrity Check'));
    this.log(`Integrity: ${integrity.message}`);
    this.log(`Foreign Keys: ${fkIssues.length === 0 ? 'OK' : `${fkIssues.length} issues`}`);
    this.log(ok ? formatSuccess('Database is healthy') : formatError('Issues detected'));
  }
}
