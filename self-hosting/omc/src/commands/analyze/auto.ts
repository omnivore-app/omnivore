import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { withDatabase } from '@lib/cli/database.js';
import { fetchUsername } from '@lib/cli/graphql.js';
import { formatHeader, formatSuccess } from '@lib/cli/formatters.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { displayQueueStats } from '@lib/cli/queue-display.js';
import { AnalysisWriter } from '@storage/AnalysisWriter.js';
import type { AnalysisJob, QueueStats, AnalysisQueueRepository } from '@storage/AnalysisQueueRepository.js';
import { ContentAnalyzer } from '@analysis/ContentAnalyzer.js';
import { runAnalyzeAuto } from '@analysis/analyze-auto-runner.js';

interface AnalyzeAutoFlags {
  'batch-size': number;
  'article-id'?: string;
  all: boolean;
  model?: string;
  'timeout-ms': number;
  'keep-temp': boolean;
  jsonl: boolean;
  'jsonl-path': string;
  json: boolean;
}

export default class AnalyzeAuto extends BaseCommand {
  static override description = 'Analyze queued articles end-to-end (non-interactive)';

  static override examples = [
    '$ omc analyze auto --batch-size 5',
    '$ omc analyze auto --article-id abc123',
    '$ omc analyze auto --json',
  ];

  static override flags = {
    'batch-size': Flags.integer({
      char: 'b',
      description: 'Number of articles to analyze',
      default: 5,
    }),
    'article-id': Flags.string({
      description: 'Analyze specific article by ID',
      exclusive: ['all'],
    }),
    all: Flags.boolean({
      description: 'Analyze pending + failed jobs (up to batch size)',
      exclusive: ['article-id'],
    }),
    model: Flags.string({
      description: 'Codex model override (passed to codex exec -m)',
    }),
    'timeout-ms': Flags.integer({
      description: 'Timeout per article analysis (milliseconds)',
      default: 10 * 60 * 1000,
    }),
    'keep-temp': Flags.boolean({
      description: 'Keep temp/*.jsonl files after successful save',
      default: false,
    }),
    jsonl: Flags.boolean({
      description: 'Append each completed analysis to content/analysis/analyses.jsonl',
      default: false,
    }),
    'jsonl-path': Flags.string({
      description: 'Path to JSONL output (requires --jsonl)',
      default: 'content/analysis/analyses.jsonl',
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: AnalyzeAutoFlags): Promise<void> {
    return await withDatabase(async ({ repo }) => {
      const jobs = this.selectJobs(repo, flags);
      if (jobs.length === 0) return this.outputEmpty(flags.json);

      if (!flags.json) {
        this.log(formatHeader('Analysis Queue Status'));
        displayQueueStats(repo.getStats());
      }

      this.markJobsInProgress(repo, jobs);

      const username = await fetchUsername();
      const analyzer = new ContentAnalyzer({ model: flags.model, timeoutMs: flags['timeout-ms'] });
      const writer = new AnalysisWriter({ outputDir: 'content/analysis' });

      const jsonlPath = flags.jsonl ? flags['jsonl-path'] : undefined;
      const results = await runAnalyzeAuto({ jobs, username, analyzer, writer, repo, keepTemp: flags['keep-temp'], jsonlPath });
      this.outputResults(results, repo.getStats(), flags.json);
    });
  }

  private selectJobs(repo: AnalysisQueueRepository, flags: AnalyzeAutoFlags): AnalysisJob[] {
    if (flags['article-id']) {
      const job = repo.getByArticleId(flags['article-id']);
      if (!job) throw new Error(`Article with ID ${flags['article-id']} not found`);
      return [job];
    }
    if (flags.all) {
      const combined = [...repo.getByStatus('pending'), ...repo.getByStatus('failed')];
      return combined.slice(0, flags['batch-size'] ?? combined.length);
    }
    return repo.getPending(flags['batch-size']);
  }

  private outputEmpty(jsonMode: boolean): void {
    if (jsonMode) this.log(JSON.stringify({ saved: 0, failed: 0, skipped: 0 }, null, 2));
    else this.log('No jobs to process');
  }

  private markJobsInProgress(repo: AnalysisQueueRepository, jobs: AnalysisJob[]): void {
    for (const job of jobs) repo.markInProgress(job.articleId);
  }

  private outputResults(results: { saved: number; failed: number; skipped: number }, stats: QueueStats, jsonMode: boolean): void {
    if (jsonMode) {
      this.log(JSON.stringify({ ...results, stats }, null, 2));
      return;
    }
    this.log('');
    this.log(formatSuccess(`Saved ${results.saved} article(s)`));
    if (results.failed) this.log(`Failed: ${results.failed}`);
    if (results.skipped) this.log(`Skipped: ${results.skipped}`);
    this.log('');
    this.log(formatHeader('Updated Queue Status'));
    displayQueueStats(stats);
  }

}
