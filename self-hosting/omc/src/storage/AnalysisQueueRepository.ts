// AIDEV-NOTE: tracking + immutable analysis storage - coordination and AI snapshots
// AIDEV-NOTE: analysisJson stores original AI output; git Markdown files are human-editable

import Database from 'better-sqlite3';

export interface AnalysisJob {
  id: number;
  articleId: string;
  articleSlug: string;  // AIDEV: REQUIRED for article(slug, username) GQL query
  articleUrl: string;
  articleTitle: string;
  savedAt: string;
  publishedAt?: string;
  updatedAtArticle?: string;
  analysisJson?: string;  // Full ContentAnalysis as JSON
  markdownPath?: string;  // Path to git-tracked .md file
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
}

/**
 * Repository for analysis job queue
 *
 * BOUNDARY: This is TRACKING ONLY
 * - Coordinates parallel analysis execution
 * - Tracks which articles need analysis
 * - Prevents duplicate work
 * - Analysis RESULTS stored in Markdown/JSONL, not here
 */
export class AnalysisQueueRepository {
  constructor(private db: Database.Database) {}

  private readonly PENDING_QUERY = `
    SELECT
      id,
      article_id as articleId,
      article_slug as articleSlug,
      article_url as articleUrl,
      article_title as articleTitle,
      saved_at as savedAt,
      published_at as publishedAt,
      updated_at_article as updatedAtArticle,
      analysis_json as analysisJson,
      markdown_path as markdownPath,
      status,
      assigned_at as assignedAt,
      completed_at as completedAt,
      error_message as errorMessage,
      retry_count as retryCount,
      created_at as createdAt,
      updated_at as updatedAt
    FROM analysis_queue
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT ?
  `;

  /**
   * Initialize queue from list of article metadata
   * AIDEV-NOTE: tracking-initialization - sets up job queue, not analysis storage
   * AIDEV-NOTE: gql-article-query-fields - slug required for fetching article content
   */
  initializeQueue(articles: Array<{ id: string; slug: string; url: string; title: string; savedAt: string }>): number {
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO analysis_queue
        (article_id, article_slug, article_url, article_title, saved_at, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `);

    const insertMany = this.db.transaction((articles: any[]) => {
      let inserted = 0;
      for (const article of articles) {
        const result = insert.run(article.id, article.slug, article.url, article.title, article.savedAt);
        inserted += result.changes;
      }
      return inserted;
    });

    return insertMany(articles);
  }

  /**
   * Get next batch of pending jobs
   * AIDEV-NOTE: tracking-coordination - fetches jobs for parallel processing
   */
  getPending(limit: number = 5): AnalysisJob[] {
    return this.db.prepare(this.PENDING_QUERY).all(limit) as AnalysisJob[];
  }

  /**
   * Mark job as in_progress (coordination lock)
   * AIDEV-NOTE: tracking-lock - prevents duplicate analysis by parallel workers
   */
  markInProgress(articleId: string): void {
    this.db.prepare(`
      UPDATE analysis_queue
      SET status = 'in_progress',
          assigned_at = datetime('now'),
          updated_at = datetime('now')
      WHERE article_id = ?
    `).run(articleId);
  }

  /**
   * Mark job as completed without storing analysis (use storeAnalysis instead)
   * AIDEV-NOTE: tracking-completion - deprecated, use storeAnalysis() to save results
   */
  markCompleted(articleId: string): void {
    this.db.prepare(`
      UPDATE analysis_queue
      SET status = 'completed',
          completed_at = datetime('now'),
          updated_at = datetime('now')
      WHERE article_id = ?
    `).run(articleId);
  }

  /**
   * Store complete analysis result (immutable AI snapshot)
   * AIDEV-NOTE: analysis-storage - saves original AI output to database
   */
  storeAnalysis(
    articleId: string,
    publishedAt: string | null,
    updatedAtArticle: string | null,
    analysisJson: string,
    markdownPath: string
  ): void {
    this.db.prepare(`
      UPDATE analysis_queue
      SET status = 'completed',
          published_at = ?,
          updated_at_article = ?,
          analysis_json = ?,
          markdown_path = ?,
          completed_at = datetime('now'),
          updated_at = datetime('now')
      WHERE article_id = ?
    `).run(publishedAt, updatedAtArticle, analysisJson, markdownPath, articleId);
  }

  /**
   * Mark job as failed for retry
   * AIDEV-NOTE: tracking-error - increments retry counter, job stays in queue
   */
  markFailed(articleId: string, errorMessage: string): void {
    this.db.prepare(`
      UPDATE analysis_queue
      SET status = 'failed',
          error_message = ?,
          retry_count = retry_count + 1,
          updated_at = datetime('now')
      WHERE article_id = ?
    `).run(errorMessage, articleId);
  }

  /**
   * Reset failed job to pending for retry
   * AIDEV-NOTE: tracking-retry - gives failed job another chance
   */
  resetToPending(articleId: string): void {
    this.db.prepare(`
      UPDATE analysis_queue
      SET status = 'pending',
          error_message = NULL,
          assigned_at = NULL,
          updated_at = datetime('now')
      WHERE article_id = ?
    `).run(articleId);
  }

  /**
   * Get queue statistics
   * AIDEV-NOTE: tracking-stats - shows progress, not analysis content
   */
  getStats(): QueueStats {
    const stats = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM analysis_queue
    `).get() as any;

    return {
      total: stats.total || 0,
      pending: stats.pending || 0,
      inProgress: stats.inProgress || 0,
      completed: stats.completed || 0,
      failed: stats.failed || 0
    };
  }

  /**
   * Check if article already in queue
   * AIDEV-NOTE: tracking-deduplication - prevents duplicate queue entries
   */
  hasArticle(articleId: string): boolean {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM analysis_queue
      WHERE article_id = ?
    `).get(articleId) as { count: number };

    return result.count > 0;
  }

  /**
   * Get all failed jobs for review
   * AIDEV-NOTE: tracking-failures - lists jobs that need retry or investigation
   */
  getFailed(): AnalysisJob[] {
    return this.db.prepare(`
      SELECT
        id,
        article_id as articleId,
        article_slug as articleSlug,
        article_url as articleUrl,
        article_title as articleTitle,
        status,
        assigned_at as assignedAt,
        completed_at as completedAt,
        error_message as errorMessage,
        retry_count as retryCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM analysis_queue
      WHERE status = 'failed'
      ORDER BY retry_count DESC, updated_at DESC
    `).all() as AnalysisJob[];
  }

  /**
   * Get jobs by status
   */
  getByStatus(status: string): AnalysisJob[] {
    return this.db.prepare(`
      SELECT
        id,
        article_id as articleId,
        article_slug as articleSlug,
        article_url as articleUrl,
        article_title as articleTitle,
        saved_at as savedAt,
        published_at as publishedAt,
        updated_at_article as updatedAtArticle,
        status,
        analysis_json as analysisJson,
        markdown_path as markdownPath,
        assigned_at as assignedAt,
        completed_at as completedAt,
        error_message as errorMessage,
        retry_count as retryCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM analysis_queue
      WHERE status = ?
      ORDER BY created_at DESC
    `).all(status) as AnalysisJob[];
  }

  /**
   * Get all jobs regardless of status
   * AIDEV-NOTE: tracking-all-jobs - fetches all articles for --all flag
   */
  getAll(limit?: number): AnalysisJob[] {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    return this.db.prepare(`
      SELECT id, article_id as articleId, article_slug as articleSlug,
        article_url as articleUrl, article_title as articleTitle,
        saved_at as savedAt, published_at as publishedAt,
        updated_at_article as updatedAtArticle, status,
        assigned_at as assignedAt, completed_at as completedAt,
        error_message as errorMessage, retry_count as retryCount,
        created_at as createdAt, updated_at as updatedAt
      FROM analysis_queue
      ORDER BY created_at ASC ${limitClause}
    `).all() as AnalysisJob[];
  }

  /**
   * Clear completed jobs (cleanup after export)
   * AIDEV-NOTE: tracking-cleanup - removes completed jobs after export to Markdown
   */
  clearCompleted(): number {
    const result = this.db.prepare(`
      DELETE FROM analysis_queue
      WHERE status = 'completed'
    `).run();

    return result.changes;
  }

  /**
   * Remove specific article from queue
   * AIDEV-NOTE: tracking-removal - deletes single article by ID
   */
  removeArticle(articleId: string): number {
    const result = this.db.prepare(`
      DELETE FROM analysis_queue
      WHERE article_id = ?
    `).run(articleId);

    return result.changes;
  }

  /**
   * Clear all articles with specific status
   * AIDEV-NOTE: tracking-bulk-clear - removes articles by status filter
   */
  clearByStatus(status: string): number {
    const result = this.db.prepare(`
      DELETE FROM analysis_queue
      WHERE status = ?
    `).run(status);

    return result.changes;
  }

  /**
   * Clear entire queue (all articles)
   * AIDEV-NOTE: tracking-reset - nuclear option, removes all queue entries
   */
  clearAll(): number {
    const result = this.db.prepare(`
      DELETE FROM analysis_queue
    `).run();

    return result.changes;
  }

  /**
   * Get specific job by article ID
   */
  getByArticleId(articleId: string): AnalysisJob | null {
    const result = this.db.prepare(`
      SELECT
        id,
        article_id as articleId,
        article_slug as articleSlug,
        article_url as articleUrl,
        article_title as articleTitle,
        saved_at as savedAt,
        published_at as publishedAt,
        updated_at_article as updatedAtArticle,
        status,
        analysis_json as analysisJson,
        markdown_path as markdownPath,
        assigned_at as assignedAt,
        completed_at as completedAt,
        error_message as errorMessage,
        retry_count as retryCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM analysis_queue
      WHERE article_id = ?
    `).get(articleId) as AnalysisJob | undefined;

    return result || null;
  }

  /**
   * Get completed jobs with analysis JSON
   * AIDEV-NOTE: report-helper - returns only completed analyses with parsed JSON
   */
  getCompletedWithAnalysis(): AnalysisJob[] {
    return this.db.prepare(`
      SELECT
        id,
        article_id as articleId,
        article_slug as articleSlug,
        article_url as articleUrl,
        article_title as articleTitle,
        saved_at as savedAt,
        published_at as publishedAt,
        updated_at_article as updatedAtArticle,
        analysis_json as analysisJson,
        markdown_path as markdownPath,
        status,
        assigned_at as assignedAt,
        completed_at as completedAt,
        error_message as errorMessage,
        retry_count as retryCount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM analysis_queue
      WHERE status = 'completed' AND analysis_json IS NOT NULL
      ORDER BY completed_at DESC
    `).all() as AnalysisJob[];
  }
}
