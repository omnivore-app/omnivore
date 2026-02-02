import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { listTables } from '@storage/database.js';

/**
 * Display current database schema.
 * AIDEV-NOTE: Shows table structure with columns and types
 */
export default class DbSchema extends BaseCommand {
  static override description = 'Show current database schema';

  static override examples = [
    '$ omc db schema',
    '$ omc db schema --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ db }) => {
      const tables = listTables(db);
      const schema = this.buildSchemaInfo(db, tables);

      if (flags.json) {
        this.log(JSON.stringify(schema, null, 2));
      } else {
        this.displaySchema(schema);
      }
    });
  }

  private buildSchemaInfo(db: any, tables: string[]) {
    return tables.map(table => ({
      name: table,
      columns: db.prepare(`PRAGMA table_info(${table})`).all(),
    }));
  }

  private displaySchema(schema: any[]): void {
    this.log(formatHeader('Database Schema'));
    for (const table of schema) {
      this.log(`\n${table.name}:`);
      for (const col of table.columns) {
        this.log(`  ${col.name.padEnd(30)} ${col.type}`);
      }
    }
  }
}
