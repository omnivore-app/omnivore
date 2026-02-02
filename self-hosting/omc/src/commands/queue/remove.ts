import { Args } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatSuccess } from '@lib/cli/formatters.js';

/**
 * Remove article from analysis queue.
 * AIDEV-NOTE: CLI command for queue article removal
 */
export default class QueueRemove extends BaseCommand {
  static override description = 'Remove article from queue';

  static override examples = [
    '$ omc queue remove <article-id>',
  ];

  static override args = {
    articleId: Args.string({
      description: 'Article ID to remove',
      required: true,
    }),
  };

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: Record<string, any>): Promise<void> {
    const { args } = await this.parse(QueueRemove);

    await withDatabase(async ({ repo }) => {
      const removed = repo.removeArticle(args.articleId);

      if (removed === 0) {
        this.warn(`Article ${args.articleId} not found in queue`);
        return;
      }

      if (flags.json) {
        this.log(JSON.stringify({ removed, articleId: args.articleId }));
      } else {
        this.log(formatSuccess(`Removed article ${args.articleId} from queue`));
      }
    });
  }
}
