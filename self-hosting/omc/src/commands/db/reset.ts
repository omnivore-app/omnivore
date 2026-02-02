import { BaseCommand } from '@lib/cli/base-command.js';
import { Flags } from '@oclif/core';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader, formatSuccess } from '@lib/cli/formatters.js';
import { listTables, isOmnivoreTable } from '@storage/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Reset tracking tables (preserves Omnivore tables).
 * AIDEV-NOTE: Boundary protection - never drops Omnivore tables
 */
export default class DbReset extends BaseCommand {
  static override description = 'Drop and recreate tracking tables';

  static override examples = [
    '$ omc db reset --force',
    '$ omc db reset --force --json',
  ];

  static override flags = {
    json: jsonFlag(),
    force: Flags.boolean({ description: 'Required for safety', default: false }),
  };

  async execute(flags: any): Promise<void> {
    if (!flags.force) {
      this.error('--force flag required for reset operation');
    }

    await withDatabase(async (db) => {
      const trackingTables = this.dropTrackingTables(db);
      this.recreateSchema(db);
      this.displayResult(flags, trackingTables);
    });
  }

  private dropTrackingTables(db: any): string[] {
    const tables = listTables(db);
    const trackingTables = tables.filter(t => !isOmnivoreTable(db, t));
    trackingTables.forEach(t => db.exec(`DROP TABLE IF EXISTS ${t}`));
    return trackingTables;
  }

  private recreateSchema(db: any): void {
    const schemaPath = this.getSchemaPath();
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  }

  private displayResult(flags: any, droppedTables: string[]): void {
    const result = { droppedTables, recreated: true };

    if (flags.json) {
      this.log(JSON.stringify(result, null, 2));
    } else {
      this.log(formatHeader('Database Reset'));
      this.log(`Dropped ${droppedTables.length} tracking tables`);
      this.log(formatSuccess('Schema recreated'));
    }
  }

  private getSchemaPath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    return join(__dirname, '../../../storage/schema/tracking-schema.sql');
  }
}
