import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatSuccess } from '@lib/cli/formatters.js';

/**
 * Clear articles from queue by status or all.
 * AIDEV-NOTE: CLI command for bulk queue clearing
 */
export default class QueueClear extends BaseCommand {
  static override description = 'Clear articles from queue';

  static override examples = [
    '$ omc queue clear --status failed',
    '$ omc queue clear --status completed',
    '$ omc queue clear --all',
    '$ omc queue clear --all --json',
  ];

  static override flags = {
    status: Flags.string({
      description: 'Clear articles with specific status (pending|in_progress|completed|failed)',
      exclusive: ['all'],
    }),
    all: Flags.boolean({
      description: 'Clear all articles from queue',
      exclusive: ['status'],
    }),
    json: jsonFlag(),
  };

  private validateFlags(flags: { status?: string; all: boolean; json: boolean }): void {
    if (!flags.status && !flags.all) {
      throw new Error('Either --status or --all flag is required');
    }

    if (flags.status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'failed'];
      if (!validStatuses.includes(flags.status)) {
        throw new Error(`Invalid status: ${flags.status}. Must be one of: ${validStatuses.join(', ')}`);
      }
    }
  }

  protected async execute(flags: { status?: string; all: boolean; json: boolean }): Promise<void> {
    this.validateFlags(flags);

    await withDatabase(async ({ repo }) => {
      const clearedCount = flags.all
        ? repo.clearAll()
        : repo.clearByStatus(flags.status as string);

      if (flags.json) {
        this.log(JSON.stringify({ cleared: clearedCount }));
      } else {
        this.log(formatSuccess(`Cleared ${clearedCount} articles from queue`));
      }
    });
  }
}
