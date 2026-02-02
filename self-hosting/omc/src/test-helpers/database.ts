import Database from 'better-sqlite3';
import { initDatabase } from '../storage/database.js';
import { AnalysisQueueRepository } from '../storage/AnalysisQueueRepository.js';

/**
 * Create an in-memory test database
 *
 * @example
 * >>> const db = createTestDatabase()
 * >>> db.prepare('SELECT 1').get()
 * { '1': 1 }
 */
export function createTestDatabase(): Database.Database {
  return initDatabase(':memory:');
}

/**
 * Execute test with isolated database instance
 *
 * @example
 * >>> await withTestDatabase(async (db, repo) => {
 * >>>   repo.addArticle({ articleId: 'test', ... })
 * >>>   return repo.getJob('test')
 * >>> })
 */
export async function withTestDatabase<T>(
  callback: (db: Database.Database, repo: AnalysisQueueRepository) => Promise<T>
): Promise<T> {
  const db = createTestDatabase();
  const repo = new AnalysisQueueRepository(db);
  try {
    return await callback(db, repo);
  } finally {
    db.close();
  }
}
