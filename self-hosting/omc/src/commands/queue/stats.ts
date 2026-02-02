import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader, formatDivider } from '@lib/cli/formatters.js';
import { displayQueueStats } from '@lib/cli/queue-display.js';

/**
 * Show queue statistics.
 * AIDEV-NOTE: Displays aggregate queue metrics for monitoring
 */
export default class QueueStats extends BaseCommand {
  static override description = 'Show queue statistics';

  static override examples = [
    '$ omc queue stats',
    '$ omc queue stats --detailed',
    '$ omc queue stats --json',
  ];

  static override flags = {
    detailed: Flags.boolean({
      description: 'Show detailed per-status breakdown',
      default: false,
    }),
    json: jsonFlag(),
  };

  async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const stats = repo.getStats();

      if (flags.json) {
        const output = flags.detailed ? this.buildDetailedStats(repo) : stats;
        this.log(JSON.stringify(output, null, 2));
      } else {
        this.log(formatHeader('Queue Statistics'));
        displayQueueStats(stats);

        if (flags.detailed) {
          this.displayDetailedBreakdown(repo);
        }
      }
    });
  }

  private buildDetailedStats(repo: any): any {
    const stats = repo.getStats();
    const detailed: any = { ...stats, breakdown: {} };

    for (const status of ['pending', 'in_progress', 'completed', 'failed']) {
      const jobs = repo.getByStatus(status);
      detailed.breakdown[status] = this.analyzeJobs(jobs);
    }

    return detailed;
  }

  private displayDetailedBreakdown(repo: any): void {
    this.log('\n' + formatDivider());
    this.log('Detailed Breakdown\n');

    for (const status of ['pending', 'in_progress', 'completed', 'failed']) {
      const jobs = repo.getByStatus(status);
      this.displayStatusAnalysis(status, jobs);
    }
  }

  private displayStatusAnalysis(status: string, jobs: any[]): void {
    const analysis = this.analyzeJobs(jobs);

    this.log(`${status.toUpperCase()}:`);
    this.log(`  Count: ${analysis.count}`);
    if (analysis.oldestDate) this.log(`  Oldest: ${analysis.oldestDate}`);
    if (analysis.newestDate) this.log(`  Newest: ${analysis.newestDate}`);
    if (status === 'failed') this.log(`  Total Retries: ${analysis.totalRetries}`);
    this.log('');
  }

  private analyzeJobs(jobs: any[]): any {
    if (jobs.length === 0) {
      return { count: 0 };
    }

    const dates = jobs.map(j => new Date(j.createdAt).getTime()).filter(d => !isNaN(d));
    const totalRetries = jobs.reduce((sum, j) => sum + (j.retryCount || 0), 0);

    return {
      count: jobs.length,
      oldestDate: dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null,
      newestDate: dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null,
      totalRetries,
    };
  }
}
