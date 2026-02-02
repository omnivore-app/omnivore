import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatSuccess } from '@lib/cli/formatters.js';

/**
 * Retry failed article analyses by resetting them to pending status.
 * AIDEV-NOTE: CLI command for retrying failed analyses
 */
export default class AnalyzeRetry extends BaseCommand {
  static override description = 'Retry failed article analyses';

  static override examples = [
    '$ omc analyze retry --failed',
    '$ omc analyze retry --article-id <id>',
  ];

  static override flags = {
    failed: Flags.boolean({
      description: 'Retry all failed articles',
      default: false,
      exclusive: ['article-id'],
    }),
    'article-id': Flags.string({
      description: 'Retry specific article by ID',
      exclusive: ['failed'],
    }),
    json: jsonFlag(),
  };

  async execute(flags: { failed: boolean; 'article-id'?: string; json: boolean }): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const count = flags.failed
        ? this.retryAllFailed(repo)
        : this.retrySingleArticle(repo, flags['article-id']);

      if (flags.json) {
        this.log(JSON.stringify({ retried: count }));
      } else {
        this.log(formatSuccess(`Reset ${count} failed article${count !== 1 ? 's' : ''} to pending`));
      }
    });
  }

  private retryAllFailed(repo: {
    getFailed: () => Array<{ articleId: string }>;
    resetToPending: (articleId: string) => void;
  }): number {
    const failed = repo.getFailed();
    for (const job of failed) {
      repo.resetToPending(job.articleId);
    }
    return failed.length;
  }

  private retrySingleArticle(
    repo: { resetToPending: (articleId: string) => void },
    articleId: string | undefined
  ): number {
    if (!articleId) {
      throw new Error('Either use --failed flag or provide --article-id');
    }
    repo.resetToPending(articleId);
    return 1;
  }
}
