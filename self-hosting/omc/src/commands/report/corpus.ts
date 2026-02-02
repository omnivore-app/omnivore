import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

/**
 * Full corpus analysis report.
 * AIDEV-NOTE: Aggregates topic frequencies, sentiment distribution, content types
 */
export default class ReportCorpus extends BaseCommand {
  static override description = 'Generate full corpus analysis report';

  static override examples = [
    '$ omc report corpus',
    '$ omc report corpus --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const jobs = repo.getCompletedWithAnalysis();
      const analyses = this.parseAnalyses(jobs);

      if (flags.json) {
        this.log(JSON.stringify(this.buildCorpusStats(analyses), null, 2));
      } else {
        this.displayCorpusReport(analyses);
      }
    });
  }

  private parseAnalyses(jobs: any[]): ContentAnalysis[] {
    return jobs.map(job => parseJsonSafely<ContentAnalysis>(job.analysisJson))
      .filter((a): a is ContentAnalysis => !!a && !!a.topics && a.topics[0] !== 'N/A');
  }

  private buildCorpusStats(analyses: ContentAnalysis[]): any {
    const topicFreq = this.countTopics(analyses);
    const sentimentDist = this.countSentiment(analyses);
    const contentTypeDist = this.countContentTypes(analyses);

    return {
      totalAnalyses: analyses.length,
      topicDistribution: topicFreq,
      sentimentDistribution: sentimentDist,
      contentTypeDistribution: contentTypeDist,
    };
  }

  private displayCorpusReport(analyses: ContentAnalysis[]): void {
    this.log(formatHeader('Corpus Analysis Report'));
    this.log(`\nTotal Analyses: ${analyses.length}\n`);

    this.log('Topic Distribution:');
    const topics = this.countTopics(analyses);
    for (const [topic, count] of Object.entries(topics).sort((a, b) => b[1] - a[1])) {
      this.log(`  ${topic.padEnd(30)} ${count}`);
    }

    this.log('\nSentiment Distribution:');
    const sentiment = this.countSentiment(analyses);
    for (const [sent, count] of Object.entries(sentiment)) {
      this.log(`  ${sent}: ${count}`);
    }

    this.log('\nContent Types:');
    const types = this.countContentTypes(analyses);
    for (const [type, count] of Object.entries(types).sort((a, b) => b[1] - a[1])) {
      this.log(`  ${type.padEnd(30)} ${count}`);
    }
  }

  private countTopics(analyses: ContentAnalysis[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const a of analyses) {
      for (const topic of a.topics) {
        counts[topic] = (counts[topic] || 0) + 1;
      }
    }
    return counts;
  }

  private countSentiment(analyses: ContentAnalysis[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const a of analyses) {
      counts[a.sentiment] = (counts[a.sentiment] || 0) + 1;
    }
    return counts;
  }

  private countContentTypes(analyses: ContentAnalysis[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const a of analyses) {
      counts[a.contentType] = (counts[a.contentType] || 0) + 1;
    }
    return counts;
  }
}
