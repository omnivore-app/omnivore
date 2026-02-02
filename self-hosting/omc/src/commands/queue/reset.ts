import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatSuccess } from '@lib/cli/formatters.js';

/**
 * Reset article(s) to pending status for reprocessing.
 * AIDEV-NOTE: Useful for retrying stuck in_progress jobs
 */
export default class QueueReset extends BaseCommand {
  static override description = 'Reset article to pending status';

  static override examples = [
    '$ omc queue reset <article-id>',
    '$ omc queue reset --all-in-progress',
  ];

  static override args = {
    articleId: Args.string({
      description: 'Article ID to reset',
      required: false,
    }),
  };

  static override flags = {
    'all-in-progress': Flags.boolean({
      description: 'Reset all in_progress articles to pending',
      default: false,
    }),
    json: jsonFlag(),
  };


  // AIDEV-NOTE: Extracted helper to keep execute() under 20 lines
  private resetAllInProgress(repo: any, flags: any): void {
    const jobs = repo.getByStatus('in_progress');
    for (const job of jobs) {
      repo.resetToPending(job.articleId);
    }

    if (flags.json) {
      this.log(JSON.stringify({ reset: jobs.length }));
    } else {
      this.log(formatSuccess(`Reset ${jobs.length} in_progress articles to pending`));
    }
  }

  // AIDEV-NOTE: Extracted helper to keep execute() under 20 lines
  private resetSingleArticle(repo: any, articleId: string, flags: any): void {
    repo.resetToPending(articleId);

    if (flags.json) {
      this.log(JSON.stringify({ reset: 1, articleId }));
    } else {
      this.log(formatSuccess(`Reset article ${articleId} to pending`));
    }
  }

  async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      if (flags['all-in-progress']) {
        this.resetAllInProgress(repo, flags);
        return;
      }

      if (!flags.articleId) {
        throw new Error('Either provide article-id or use --all-in-progress flag');
      }

      this.resetSingleArticle(repo, flags.articleId, flags);
    });
  }
}
