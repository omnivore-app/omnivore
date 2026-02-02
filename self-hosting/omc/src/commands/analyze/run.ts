import { Flags } from '@oclif/core';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { fetchUsername } from '@lib/cli/graphql.js';
import { formatHeader, formatSuccess, formatDivider } from '@lib/cli/formatters.js';
import { displayQueueStats } from '@lib/cli/queue-display.js';
import { getArticle } from '@lib/omnivore/client.js';
import type { AnalysisJob } from '@storage/AnalysisQueueRepository.js';

/**
 * OCLIF command: omc analyze run
 * Wraps parallel-analyze.ts workflow for queue-based article analysis.
 *
 * AIDEV-NOTE: tracking-coordination - prepares batch for parallel agent execution
 * AIDEV-NOTE: stub-file-creation - fetches full article metadata before analysis
 */
export default class AnalyzeRun extends BaseCommand {
  static override description = 'Run parallel content analysis on queued articles';

  static override examples = [
    '$ omc analyze run',
    '$ omc analyze run --batch-size 10',
    '$ omc analyze run --article-id abc123',
    '$ omc analyze run --all',
    '$ omc analyze run --json',
  ];

  static override flags = {
    'batch-size': Flags.integer({
      char: 'b',
      description: 'Number of articles to analyze in parallel',
      default: 5,
    }),
    'article-id': Flags.string({
      description: 'Analyze specific article by ID',
      exclusive: ['all'],
    }),
    all: Flags.boolean({
      description: 'Analyze all articles regardless of status',
      exclusive: ['article-id'],
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: Record<string, any>): Promise<void> {
    return await withDatabase(async ({ repo }) => {
      const jobs = this.selectJobs(repo, flags);

      if (jobs.length === 0) {
        if (!flags.json) this.log('No jobs to process');
        return;
      }

      if (!flags.json) {
        const stats = repo.getStats();
        this.log(formatHeader('Analysis Queue Status'));
        displayQueueStats(stats);
      }

      this.markJobsInProgress(repo, jobs);

      const username = await fetchUsername();
      const agentParams = await this.processJobs(jobs, username, flags.json);

      this.outputResults(agentParams, jobs.length, flags.json);
    });
  }

  // AIDEV-NOTE: job-selection - handles --article-id, --all, or default pending
  private selectJobs(repo: any, flags: Record<string, any>): AnalysisJob[] {
    if (flags['article-id']) {
      const job = repo.getByArticleId(flags['article-id']);
      if (!job) {
        throw new Error(`Article with ID ${flags['article-id']} not found`);
      }
      return [job];
    }

    if (flags.all) {
      // Get all pending jobs (don't include in_progress to avoid overwriting)
      const pending = repo.getByStatus('pending');
      const failed = repo.getByStatus('failed');
      const combined = [...pending, ...failed];
      return flags['batch-size'] ? combined.slice(0, flags['batch-size']) : combined;
    }

    return repo.getPending(flags['batch-size']);
  }

  // AIDEV-NOTE: tracking-lock - marks jobs to prevent duplicate analysis
  private markJobsInProgress(repo: any, jobs: AnalysisJob[]): void {
    for (const job of jobs) {
      repo.markInProgress(job.articleId);
    }
  }

  private async processJobs(
    jobs: AnalysisJob[],
    username: string,
    silent: boolean
  ): Promise<any[]> {
    this.ensureTempDir();
    const agentParams = [];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (!silent) {
        this.log(`Fetching article ${i + 1}/${jobs.length}: ${this.truncate(job.articleTitle, 60)}...`);
      }

      const param = await this.createStubFile(job, username);
      if (param) agentParams.push(param);
    }

    return agentParams;
  }

  private async fetchArticleData(slug: string, username: string): Promise<any | null> {
    try {
      const result = await getArticle(slug, username);
      if (!result?.article) {
        this.warn(`Failed to fetch article: ${slug}`);
        return null;
      }
      return result.article;
    } catch (error) {
      this.warn(`Failed to fetch article: ${slug}`);
      return null;
    }
  }

  private buildStubObject(article: any, job: AnalysisJob, username: string): any {
    return {
      articleId: job.articleId,
      articleSlug: job.articleSlug,
      username,
      articleUrl: article.url,
      articleTitle: article.title,
      savedAt: article.savedAt,
      publishedAt: article.publishedAt || null,
      updatedAt: article.updatedAt || null,
    };
  }

  // AIDEV-NOTE: stub-file-creation - writes complete metadata for agent
  private async createStubFile(job: AnalysisJob, username: string): Promise<any | null> {
    const article = await this.fetchArticleData(job.articleSlug, username);
    if (!article) return null;

    const stubPath = join('temp', `${job.articleSlug}.jsonl`);
    const stub = this.buildStubObject(article, job, username);
    writeFileSync(stubPath, JSON.stringify(stub) + '\n', 'utf-8');

    return {
      filename: stubPath,
      articleId: job.articleId,
      articleSlug: job.articleSlug,
      username,
      articleTitle: this.truncate(article.title, 60),
    };
  }

  private outputResults(agentParams: any[], count: number, jsonMode: boolean): void {
    if (jsonMode) {
      this.log(JSON.stringify(agentParams, null, 2));
    } else {
      this.log(`\n${formatDivider()}`);
      this.log(formatSuccess(`Prepared ${count} articles for analysis`));
      this.log('\nAgent parameters (copy for Task tool invocation):');
      this.log(JSON.stringify(agentParams, null, 2));
    }
  }

  private ensureTempDir(): void {
    if (!existsSync('temp')) {
      mkdirSync('temp', { recursive: true });
    }
  }

  private truncate(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
