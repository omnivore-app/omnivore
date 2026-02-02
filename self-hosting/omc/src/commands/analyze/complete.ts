import { Flags } from '@oclif/core';
import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader, formatSuccess } from '@lib/cli/formatters.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import { displayQueueStats } from '@lib/cli/queue-display.js';
import { AnalysisWriter } from '@storage/AnalysisWriter.js';
import { glob } from 'glob';
import type { ContentAnalysis } from '@omc-types/analysis.js';
import type { AnalysisJsonlRecord } from '@storage/AnalysisWriter.js';
import type { AnalysisQueueRepository, QueueStats } from '@storage/AnalysisQueueRepository.js';

interface EnrichedResult {
  articleId: string;
  articleSlug: string;
  username: string;
  articleUrl: string;
  articleTitle: string;
  savedAt: string;
  publishedAt: string | null;
  updatedAt: string | null;
  analysis?: ContentAnalysis;
}

interface AnalyzeCompleteFlags {
  'keep-temp': boolean;
  jsonl: boolean;
  'jsonl-path': string;
  json: boolean;
}

interface SaveResults {
  saved: number;
  failed: number;
  stats: QueueStats;
}

function buildJsonlRecord(result: EnrichedResult, analysis: ContentAnalysis, markdownPath: string): AnalysisJsonlRecord {
  return {
    articleId: result.articleId,
    articleSlug: result.articleSlug,
    articleUrl: result.articleUrl,
    articleTitle: result.articleTitle,
    savedAt: result.savedAt,
    publishedAt: result.publishedAt,
    updatedAt: result.updatedAt,
    markdownPath,
    analyzedAt: analysis.analyzedAt,
    topics: analysis.topics,
    topicScores: analysis.topicScores,
    sentiment: analysis.sentiment,
    summary: analysis.summary,
    keyPoints: analysis.keyPoints,
    monetizationAngle: analysis.monetizationAngle,
    contentType: analysis.contentType,
    problemStatement: analysis.problemStatement,
    audienceLevel: analysis.audienceLevel,
    technologiesMentioned: analysis.technologiesMentioned,
    companiesMentioned: analysis.companiesMentioned,
    peopleMentioned: analysis.peopleMentioned,
    conceptsExplained: analysis.conceptsExplained,
    relatedTechnologies: analysis.relatedTechnologies,
    useCases: analysis.useCases,
    targetKeywords: analysis.targetKeywords,
    searchQuestions: analysis.searchQuestions,
    githubRepo: analysis.githubRepo,
    releaseInfo: analysis.releaseInfo,
  };
}

/**
 * OCLIF command: omc analyze complete
 * Saves agent-analyzed results from temp/ to database and marks jobs complete.
 * AIDEV-NOTE: analysis-complete - final step in analyze workflow after agents finish
 */
export default class AnalyzeComplete extends BaseCommand {
  static override description = 'Save analyzed results and mark jobs complete';

  static override examples = [
    '$ omc analyze complete',
    '$ omc analyze complete --keep-temp',
  ];

  static override flags = {
    'keep-temp': Flags.boolean({
      description: 'Keep temp files after saving',
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

  protected async execute(flags: AnalyzeCompleteFlags): Promise<void> {
    this.validateFlags(flags);
    const files = await this.findAnalyzedFiles();

    if (files.length === 0) {
      this.log('No analyzed files found in temp/');
      return;
    }

    await withDatabase(async ({ repo }) => {
      const writer = new AnalysisWriter({ outputDir: 'content/analysis' });
      const results = await this.saveResults(files, repo, writer, {
        keepTemp: flags['keep-temp'],
        writeJsonl: flags.jsonl,
        jsonlPath: flags['jsonl-path'],
      });
      this.displayResults(results, flags.json);
    });
  }

  private validateFlags(flags: AnalyzeCompleteFlags): void {
    if (flags['jsonl-path'] !== 'content/analysis/analyses.jsonl' && !flags.jsonl) {
      throw new Error('--jsonl-path requires --jsonl');
    }
  }

  private async findAnalyzedFiles(): Promise<string[]> {
    const allFiles = await glob('temp/*.jsonl');
    return allFiles.filter((file) => {
      if (!existsSync(file)) return false;
      const content = readFileSync(file, 'utf-8').trim();
      if (!content) return false;
      const data = parseJsonSafely<EnrichedResult>(content);
      return data?.analysis !== undefined;
    });
  }

  private async saveResults(
    files: string[],
    repo: AnalysisQueueRepository,
    writer: AnalysisWriter,
    options: { keepTemp: boolean; writeJsonl: boolean; jsonlPath: string }
  ): Promise<SaveResults> {
    let saved = 0;
    let failed = 0;

    for (const file of files) {
      const success = await this.saveFile(file, repo, writer, options);
      if (success) saved++;
      else failed++;
    }

    return { saved, failed, stats: repo.getStats() };
  }

  private async saveFile(
    file: string,
    repo: AnalysisQueueRepository,
    writer: AnalysisWriter,
    options: { keepTemp: boolean; writeJsonl: boolean; jsonlPath: string }
  ): Promise<boolean> {
    const content = readFileSync(file, 'utf-8');
    const result = parseJsonSafely<EnrichedResult>(content);

    if (!result?.analysis) {
      this.warn(`Skipping ${file}: no analysis field`);
      return false;
    }

    const { articleId, articleUrl, articleTitle, savedAt, publishedAt, updatedAt, analysis } = result;

    try {
      const mdPath = await writer.write(articleId, articleUrl, articleTitle, savedAt, analysis, result.articleSlug);
      repo.storeAnalysis(articleId, publishedAt, updatedAt, JSON.stringify(analysis), mdPath);

      if (options.writeJsonl) {
        await writer.appendToJsonl(options.jsonlPath, buildJsonlRecord(result, analysis, mdPath));
      }

      if (!options.keepTemp) unlinkSync(file);

      this.log(`✓ ${this.truncate(articleTitle, 60)}`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      repo.markFailed(articleId, `Save failed: ${message}`);
      this.error(`✗ ${this.truncate(articleTitle, 60)} - ${message}`);
      return false;
    }
  }

  private displayResults(results: SaveResults, jsonMode: boolean): void {
    if (jsonMode) {
      this.log(JSON.stringify(results, null, 2));
      return;
    }

    this.log('');
    this.log(formatSuccess(`Saved ${results.saved} article(s)`));
    if (results.failed > 0) {
      this.log(`Failed: ${results.failed}`);
    }
    this.log('');
    this.log(formatHeader('Updated Queue Status'));
    displayQueueStats(results.stats);
  }

  private truncate(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
