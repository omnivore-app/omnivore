import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatHeader, formatSuccess } from '@lib/cli/formatters.js';
import { withDatabase } from '@lib/cli/database.js';

/**
 * Run database migrations by executing tracking schema.
 * AIDEV-NOTE: Idempotent - safe to run multiple times (CREATE IF NOT EXISTS)
 */
export default class DbMigrate extends BaseCommand {
  static override description = 'Run database migrations (idempotent schema execution)';

  static override examples = [
    '$ omc db migrate',
    '$ omc db migrate --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ db }) => {
      const schemaPath = this.getSchemaPath();
      const schema = readFileSync(schemaPath, 'utf-8');

      db.exec(schema);

      const tables = this.getTrackingTables(db);

      if (flags.json) {
        this.log(JSON.stringify({ tables }, null, 2));
      } else {
        this.displayMigrationResults(tables);
      }
    });
  }

  private getSchemaPath(): string {
    // AIDEV-NOTE: Schema must be in source tree, not dist (not bundled by esbuild)
    const projectRoot = process.cwd();
    return join(projectRoot, 'src/storage/schema/tracking-schema.sql');
  }

  private getTrackingTables(db: any): string[] {
    const result = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as Array<{ name: string }>;

    return result.map(t => t.name);
  }

  private displayMigrationResults(tables: string[]): void {
    this.log(formatSuccess('Database schema migrated'));
    this.log(formatHeader('Tables'));
    tables.forEach(t => this.log(`  ✓ ${t}`));
  }
}
