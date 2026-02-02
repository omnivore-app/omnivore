import { readdirSync } from 'node:fs';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader, formatTable } from '@lib/cli/formatters.js';
import { QUEUE_STATUS } from '@lib/cli/constants.js';
import type { AnalysisJob } from '@storage/AnalysisQueueRepository.js';

/**
 * OCLIF command: omc analyze status
 * Show current analysis batch progress.
 * AIDEV-NOTE: tracking-coordination - displays in-progress jobs and stub files
 */
export default class AnalyzeStatus extends BaseCommand {
  static override description = 'Show current analysis batch progress';

  static override examples = ['$ omc analyze status', '$ omc analyze status --json'];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: Record<string, any>): Promise<void> {
    return await withDatabase(async ({ repo }) => {
      const jobs = repo.getByStatus(QUEUE_STATUS.IN_PROGRESS);
      const stubs = this.getStubFiles();
      const display = this.prepareDisplay(jobs, stubs);

      this.output(display, flags.json);
    });
  }

  private getStubFiles(): string[] {
    try {
      return readdirSync('temp').filter((f) => f.endsWith('.jsonl'));
    } catch {
      return [];
    }
  }

  private prepareDisplay(jobs: AnalysisJob[], stubs: string[]): any {
    return {
      inProgress: jobs.map((j) => ({
        articleId: j.articleId,
        status: j.status,
        elapsed: this.elapsed(j.assignedAt),
      })),
      stubFiles: stubs,
      count: jobs.length,
    };
  }

  private output(display: any, jsonMode: boolean): void {
    if (jsonMode) {
      this.log(JSON.stringify(display, null, 2));
      return;
    }

    this.log(formatHeader('Analysis Status'));
    if (display.count === 0) {
      this.log('\nNo analysis in progress');
      return;
    }

    this.log(formatTable(display.inProgress, ['articleId', 'status', 'elapsed']));
  }

  private elapsed(assignedAt?: string): string {
    if (!assignedAt) return 'N/A';
    const ms = Date.now() - new Date(assignedAt).getTime();
    return `${Math.floor(ms / 1000)}s`;
  }
}
