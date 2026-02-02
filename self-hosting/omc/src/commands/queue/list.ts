import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { displayJobs } from '@lib/cli/queue-display.js';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag, statusFlag } from '@lib/cli/shared-flags.js';

/**
 * List articles in the analysis queue.
 * AIDEV-NOTE: Displays queue contents with optional status filtering
 */
export default class QueueList extends BaseCommand {
  static override description = 'List articles in the analysis queue';

  static override examples = [
    '$ omc queue list',
    '$ omc queue list --status pending',
    '$ omc queue list --status completed',
    '$ omc queue list --json',
  ];

  static override flags = {
    status: statusFlag(),
    json: jsonFlag(),
  };

  async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      let jobs;

      if (flags.status) {
        jobs = repo.getByStatus(flags.status);
      } else {
        // Get all jobs from all statuses
        const pending = repo.getByStatus('pending');
        const inProgress = repo.getByStatus('in_progress');
        const completed = repo.getByStatus('completed');
        const failed = repo.getByStatus('failed');
        jobs = [...pending, ...inProgress, ...completed, ...failed];
      }

      if (flags.json) {
        this.log(JSON.stringify(jobs, null, 2));
      } else {
        this.log(formatHeader('Queue Listing'));
        displayJobs(jobs);
      }
    });
  }
}
