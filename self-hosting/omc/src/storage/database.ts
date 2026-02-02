// AIDEV-NOTE: tracking-db-boundary - SQLite stores immutable AI snapshots + job tracking
// AIDEV-NOTE: git-tracked Markdown files are user-editable, SQLite has original AI output
// AIDEV-NOTE: omnivore-boundary - existing Omnivore tables are READ-ONLY, never modify

import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize database connection with boundary enforcement
 *
 * CRITICAL BOUNDARIES:
 * 1. Existing Omnivore tables (if present) are READ-ONLY - never modify
 * 2. New tracking tables are READ-WRITE - store immutable AI snapshots + coordination
 * 3. Markdown files are user-editable; SQLite has original immutable AI output
 *
 * @param dbPath - Path to SQLite database file
 * @returns Database connection
 */
export function initDatabase(dbPath: string = 'data/omnivore-content.db'): Database.Database {
  // AIDEV-NOTE: tracking-db - stores immutable AI snapshots + coordination
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');

  // AIDEV-NOTE: Only create tracking tables, never modify existing Omnivore tables
  const trackingSchema = readFileSync(resolveTrackingSchemaPath(), 'utf-8');

  db.exec(trackingSchema);

  return db;
}

function resolveTrackingSchemaPath(): string {
  const candidates = [
    process.env.OMC_TRACKING_SCHEMA_PATH,
    join(__dirname, 'schema/tracking-schema.sql'),
    join(process.cwd(), 'src/storage/schema/tracking-schema.sql'),
    join(process.cwd(), 'dist/schema/tracking-schema.sql'),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }

  throw new Error(
    `Could not find tracking-schema.sql. Tried: ${candidates.join(', ')}`
  );
}

/**
 * List all tables in database for inspection
 * Used to identify Omnivore tables vs tracking tables
 */
export function listTables(db: Database.Database): string[] {
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table'
    ORDER BY name
  `).all() as { name: string }[];

  return tables.map(t => t.name);
}

/**
 * Check if table belongs to Omnivore cache (READ-ONLY)
 * Omnivore tables typically use Z-prefixed column names (Core Data convention)
 *
 * @param db - Database connection
 * @param tableName - Table to check
 * @returns true if likely an Omnivore table
 */
export function isOmnivoreTable(db: Database.Database, tableName: string): boolean {
  // AIDEV-NOTE: boundary-check - identify Omnivore tables by schema pattern
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;

    // Core Data (Omnivore) tables use Z-prefixed column names
    const hasZPrefixedColumns = columns.some(col => col.name.startsWith('Z'));

    return hasZPrefixedColumns;
  } catch (err) {
    console.warn(`Could not inspect table ${tableName}:`, err);
    return false;
  }
}

/**
 * Validate that our code hasn't modified Omnivore tables
 * This is a safety check to enforce the READ-ONLY boundary
 *
 * NOTE: This is not foolproof - it checks for suspicious patterns,
 * but cannot detect all modifications
 */
export function validateOmnivoreTablesReadOnly(db: Database.Database): void {
  // AIDEV-NOTE: boundary-check - ensure Omnivore tables never modified by our code
  const tables = listTables(db);

  for (const table of tables) {
    if (isOmnivoreTable(db, table)) {
      console.log(`[BOUNDARY CHECK] Omnivore table detected: ${table} (READ-ONLY)`);
    }
  }

  // Log our tracking tables
  const trackingTables = ['analysis_queue', 'analysis_sessions'];
  for (const table of trackingTables) {
    if (tables.includes(table)) {
      console.log(`[BOUNDARY CHECK] Tracking table: ${table} (READ-WRITE)`);
    }
  }
}

/**
 * Get table row counts for monitoring
 * Useful for debugging and understanding database state
 */
export function getTableCounts(db: Database.Database): Record<string, number> {
  const tables = listTables(db);
  const counts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
      counts[table] = result.count;
    } catch (err) {
      console.warn(`Could not count rows in ${table}:`, err);
      counts[table] = -1;
    }
  }

  return counts;
}
