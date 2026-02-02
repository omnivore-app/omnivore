import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag, statusFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import type { AnalysisJob } from '@storage/AnalysisQueueRepository.js';

/**
 * Export queue to JSONL format.
 * AIDEV-NOTE: Exports queue jobs for backup/transfer (one JSON object per line)
 */
export default class QueueExport extends BaseCommand {
  static override description = 'Export queue to JSONL format';

  static override examples = [
    '$ omc queue export',
    '$ omc queue export --status pending',
    '$ omc queue export --json',
  ];

  static override flags = {
    status: statusFlag(),
    json: jsonFlag(),
  };

  async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const jobs = await this.fetchJobs(repo, flags.status);

      if (flags.json) {
        this.outputJsonArray(jobs);
      } else {
        this.outputJsonl(jobs);
      }
    });
  }

  private async fetchJobs(repo: any, status?: string): Promise<AnalysisJob[]> {
    if (status) {
      return repo.getByStatus(status);
    }

    const allJobs: AnalysisJob[] = [];

    for (const s of ['pending', 'in_progress', 'completed', 'failed']) {
      allJobs.push(...repo.getByStatus(s));
    }

    return allJobs;
  }

  private outputJsonArray(jobs: AnalysisJob[]): void {
    this.log(JSON.stringify(jobs, null, 2));
  }

  private outputJsonl(jobs: AnalysisJob[]): void {
    for (const job of jobs) {
      this.log(JSON.stringify(job));
    }
  }
}
