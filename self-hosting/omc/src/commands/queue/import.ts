import { Args } from '@oclif/core';
import { readFileSync } from 'fs';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { outputResult, parseJsonSafely } from '@lib/cli/command-utils.js';

/**
 * Import queue from JSONL file.
 * AIDEV-NOTE: Imports queue jobs from backup/transfer file (one JSON object per line)
 */
export default class QueueImport extends BaseCommand {
  static override description = 'Import queue from JSONL file';

  static override examples = [
    '$ omc queue import queue-backup.jsonl',
    '$ omc queue import queue-backup.jsonl --json',
  ];

  static override args = {
    file: Args.string({
      description: 'Path to JSONL file',
      required: true,
    }),
  };

  static override flags = {
    json: jsonFlag(),
  };

  async execute(flags: any): Promise<void> {
    const file = await this.parse(QueueImport).then((p) => p.args.file);
    const articles = this.readJsonl(file);

    await withDatabase(async ({ repo }) => {
      const count = repo.initializeQueue(articles);
      outputResult(this, { imported: count }, `Imported ${count} articles`, flags.json);
    });
  }

  private readJsonl(filePath: string): Array<{ id: string; slug: string; url: string; title: string; savedAt: string }> {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    return lines.map(line => this.parseJobLine(line));
  }

  private parseJobLine(line: string): { id: string; slug: string; url: string; title: string; savedAt: string } {
    const job = parseJsonSafely<any>(line);
    if (!job) throw new Error('Failed to parse JSONL line');
    this.validateJob(job);

    return {
      id: job.articleId,
      slug: job.articleSlug,
      url: job.articleUrl,
      title: job.articleTitle,
      savedAt: job.savedAt,
    };
  }

  private validateJob(job: any): void {
    const required = ['articleId', 'articleSlug', 'articleUrl', 'articleTitle', 'savedAt'];

    for (const field of required) {
      if (!job[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
}
