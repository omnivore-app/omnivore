import type { AnalysisJob } from '@storage/AnalysisQueueRepository.js';

/**
 * Queue statistics display type.
 * Matches AnalysisQueueRepository.getQueueStats() return type.
 */
export interface QueueStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
}

/**
 * Display queue statistics in consistent format.
 * Pattern from cli/analysis-status.ts
 *
 * @example
 * const stats = repo.getQueueStats();
 * displayQueueStats(stats);
 * // Total: 42
 * // Pending: 10
 * // In Progress: 2
 * // Completed: 28
 * // Failed: 2
 */
export function displayQueueStats(stats: QueueStats): void {
  console.log(`Total: ${stats.total}`);
  console.log(`Pending: ${stats.pending}`);
  console.log(`In Progress: ${stats.inProgress}`);
  console.log(`Completed: ${stats.completed}`);
  console.log(`Failed: ${stats.failed}`);
}

/**
 * Format table header with column names and divider.
 * AIDEV-NOTE: Column widths match formatJobRow for alignment
 */
function formatJobHeader(): string {
  const COL_ID = 10;
  const COL_SLUG = 50;
  const COL_STATUS = 15;
  const COL_DATE = 25;

  const header = 'ID'.padEnd(COL_ID) +
    'Slug'.padEnd(COL_SLUG) +
    'Status'.padEnd(COL_STATUS) +
    'Created'.padEnd(COL_DATE);
  const divider = '─'.repeat(COL_ID + COL_SLUG + COL_STATUS + COL_DATE);

  return header + '\n' + divider;
}

/**
 * Format single job row with truncated slug and ISO date.
 * AIDEV-NOTE: Truncates slug at 47 chars + '...' to fit column width
 */
function formatJobRow(job: AnalysisJob): string {
  const COL_ID = 10;
  const COL_SLUG = 50;
  const COL_STATUS = 15;
  const COL_DATE = 25;

  const slug = job.articleSlug.length > COL_SLUG - 3
    ? job.articleSlug.substring(0, COL_SLUG - 3) + '...'
    : job.articleSlug;

  const created = job.createdAt
    ? new Date(job.createdAt).toISOString()
    : 'N/A';

  return String(job.id).padEnd(COL_ID) +
    slug.padEnd(COL_SLUG) +
    job.status.padEnd(COL_STATUS) +
    created.padEnd(COL_DATE);
}

/**
 * Display analysis jobs in tabular format.
 * Shows key job details: ID, slug, status, timestamps.
 *
 * @example
 * const jobs = repo.getRecentJobs(10);
 * displayJobs(jobs);
 */
export function displayJobs(jobs: AnalysisJob[]): void {
  if (jobs.length === 0) {
    console.log('(no jobs found)');
    return;
  }

  console.log(formatJobHeader());

  for (const job of jobs) {
    console.log(formatJobRow(job));
  }
}
