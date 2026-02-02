import Database from 'better-sqlite3';
import { initDatabase } from '@storage/database.js';
import { AnalysisQueueRepository } from '@storage/AnalysisQueueRepository.js';

export interface DatabaseContext {
  db: Database.Database;
  repo: AnalysisQueueRepository;
}

/**
 * Execute callback with initialized database and repository.
 * Ensures proper cleanup via try/finally pattern.
 *
 * AIDEV-NOTE: Eliminates repeated db init/close pattern across 6+ CLI scripts
 *
 * @example
 * await withDatabase(async ({ db, repo }) => {
 *   const stats = repo.getQueueStats();
 *   return stats;
 * });
 */
export async function withDatabase<T>(
  callback: (ctx: DatabaseContext) => Promise<T>
): Promise<T> {
  const db = initDatabase();
  const repo = new AnalysisQueueRepository(db);
  try {
    return await callback({ db, repo });
  } finally {
    db.close();
  }
}
