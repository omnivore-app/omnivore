#!/usr/bin/env tsx
// AIDEV-NOTE: database-migration - adds new columns to existing analysis_queue table

import { initDatabase } from '../src/storage/database';

async function main() {
  console.log('Starting database migration...\n');

  const db = initDatabase();

  try {
    // Check current schema
    const columns = db.prepare(`PRAGMA table_info(analysis_queue)`).all() as Array<{ name: string }>;
    const columnNames = columns.map(c => c.name);

    console.log('Current columns:', columnNames.join(', '));

    // Add missing columns
    const migrations = [
      { name: 'saved_at', sql: 'ALTER TABLE analysis_queue ADD COLUMN saved_at TEXT NOT NULL DEFAULT ""' },
      { name: 'published_at', sql: 'ALTER TABLE analysis_queue ADD COLUMN published_at TEXT' },
      { name: 'updated_at_article', sql: 'ALTER TABLE analysis_queue ADD COLUMN updated_at_article TEXT' },
      { name: 'analysis_json', sql: 'ALTER TABLE analysis_queue ADD COLUMN analysis_json TEXT' },
      { name: 'markdown_path', sql: 'ALTER TABLE analysis_queue ADD COLUMN markdown_path TEXT' },
    ];

    let added = 0;
    for (const migration of migrations) {
      if (!columnNames.includes(migration.name)) {
        console.log(`Adding column: ${migration.name}`);
        db.exec(migration.sql);
        added++;
      } else {
        console.log(`Column ${migration.name} already exists, skipping`);
      }
    }

    console.log(`\n✓ Migration complete: ${added} columns added`);

    // Show final schema
    const finalColumns = db.prepare(`PRAGMA table_info(analysis_queue)`).all() as Array<{ name: string, type: string }>;
    console.log('\nFinal schema:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

  } catch (err: any) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

main().catch(console.error);
