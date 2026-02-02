import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader, formatDivider } from '@lib/cli/formatters.js';
import { displayQueueStats } from '@lib/cli/queue-display.js';

/**
 * OCLIF command: omc analyze watch
 * Real-time monitoring of analysis progress.
 * AIDEV-NOTE: polling-monitor - updates stats every interval until completion
 */
export default class AnalyzeWatch extends BaseCommand {
  static override description = 'Real-time monitoring of analysis progress';

  static override examples = ['$ omc analyze watch', '$ omc analyze watch --interval 5000'];

  static override flags = {
    interval: Flags.integer({
      char: 'i',
      description: 'Polling interval in milliseconds',
      default: 2000,
    }),
  };

  protected async execute(flags: Record<string, any>): Promise<void> {
    let running = true;
    this.setupCleanExit(() => (running = false));

    while (running) {
      const done = await this.pollStats();
      if (done) break;
      await this.sleep(flags.interval);
    }
  }

  private async pollStats(): Promise<boolean> {
    return await withDatabase(async ({ repo }) => {
      const stats = repo.getStats();
      this.display(stats);
      return stats.inProgress === 0 && stats.pending === 0;
    });
  }

  private display(stats: any): void {
    this.clear();
    this.log(formatHeader('Analysis Progress (Ctrl+C to exit)'));
    displayQueueStats(stats);
    this.log(formatDivider());
  }

  private setupCleanExit(callback: () => void): void {
    process.on('SIGINT', () => {
      this.log('\nExiting...');
      callback();
      process.exit(0);
    });
  }

  private clear(): void {
    process.stdout.write('\x1Bc');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
