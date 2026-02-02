import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { searchArticles } from '@lib/omnivore/client.js';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * Download a URL -> pageId mapping into a local SQLite DB.
 * AIDEV-NOTE: Integrates scripts/download-items-mapping.js functionality into OMC CLI.
 */
export default class OmnivoreMappingDownload extends BaseCommand {
  static override description = 'Download Omnivore URL-to-ID mapping into SQLite';

  static override examples = [
    '$ omc omnivore mapping download',
    '$ omc omnivore mapping download --destination temp/url-id-mapping.sqlite',
    '$ omc omnivore mapping download --limit 1000 --json',
  ];

  static override flags = {
    destination: Flags.string({
      description: 'Output SQLite path',
      default: 'temp/url-id-mapping.sqlite',
    }),
    limit: Flags.integer({
      description: 'Optional max items (for testing)',
      required: false,
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: { destination: string; limit?: number; json: boolean }): Promise<void> {
    const destination = resolve(flags.destination);
    mkdirSync(dirname(destination), { recursive: true });

    const db = new Database(destination);
    try {
      this.initSchema(db);
      const downloaded = await this.downloadInto(db, flags.limit);
      const result = { destination, downloaded };

      if (flags.json) this.log(JSON.stringify(result, null, 2));
      else this.log(`Saved ${downloaded} items to ${destination}`);
    } finally {
      db.close();
    }
  }

  private initSchema(db: Database.Database): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS item_mapping (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_item_mapping_url ON item_mapping(url);
      DELETE FROM item_mapping;
    `);
  }

  private async downloadInto(db: Database.Database, limit?: number): Promise<number> {
    const insert = db.prepare('INSERT OR REPLACE INTO item_mapping (id, url, title) VALUES (?, ?, ?)');
    const insertMany = db.transaction((rows: Array<{ id: string; url: string; title?: string }>) => {
      for (const r of rows) insert.run(r.id, r.url, r.title ?? null);
    });

    let after: string | undefined;
    let total = 0;

    while (true) {
      const first = 100;
      const result: any = await searchArticles({ query: '', first, after: after ?? '', includeContent: false });

      const edges = result.edges ?? [];
      let rows = edges.map((e: any) => ({ id: e.node.id, url: e.node.url, title: e.node.title }));
      if (limit && total + rows.length > limit) {
        rows = rows.slice(0, Math.max(0, limit - total));
      }
      insertMany(rows);

      total += rows.length;
      if (limit && total >= limit) return total;

      const pageInfo = result.pageInfo;
      if (!pageInfo?.hasNextPage) return total;
      after = pageInfo.endCursor;
    }
  }
}
