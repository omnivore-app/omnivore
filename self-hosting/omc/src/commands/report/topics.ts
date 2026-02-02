import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

/**
 * Topic distribution report.
 * AIDEV-NOTE: Groups analyses by topics with frequency and average scores
 */
export default class ReportTopics extends BaseCommand {
  static override description = 'Show topic distribution across all analyses';

  static override examples = [
    '$ omc report topics',
    '$ omc report topics --min-score 0.8',
    '$ omc report topics --json',
  ];

  static override flags = {
    'min-score': Flags.string({
      description: 'Minimum topic score threshold (0-1)',
      default: '0.0',
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const jobs = repo.getCompletedWithAnalysis();
      const analyses = this.parseAnalyses(jobs);
      const minScore = parseFloat(flags['min-score']);

      const topicStats = this.buildTopicStats(analyses, minScore);

      if (flags.json) {
        this.log(JSON.stringify(topicStats, null, 2));
      } else {
        this.displayTopicReport(topicStats);
      }
    });
  }

  private parseAnalyses(jobs: any[]): ContentAnalysis[] {
    return jobs.map(job => parseJsonSafely<ContentAnalysis>(job.analysisJson))
      .filter((a): a is ContentAnalysis => !!a && !!a.topics && a.topics[0] !== 'N/A');
  }

  private buildTopicStats(analyses: ContentAnalysis[], minScore: number): any[] {
    const topicData = this.aggregateTopicData(analyses, minScore);
    return this.formatTopicStats(topicData);
  }

  private aggregateTopicData(analyses: ContentAnalysis[], minScore: number): Record<string, { count: number; scoreSum: number; articles: string[] }> {
    const topicData: Record<string, { count: number; scoreSum: number; articles: string[] }> = {};

    for (const a of analyses) {
      for (const topic of a.topics) {
        const score = a.topicScores[topic] || 0;
        if (score < minScore) continue;

        if (!topicData[topic]) {
          topicData[topic] = { count: 0, scoreSum: 0, articles: [] };
        }
        topicData[topic].count++;
        topicData[topic].scoreSum += score;
        topicData[topic].articles.push(a.articleId);
      }
    }
    return topicData;
  }

  private formatTopicStats(topicData: Record<string, { count: number; scoreSum: number; articles: string[] }>): any[] {
    return Object.entries(topicData)
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        avgScore: data.count > 0 ? (data.scoreSum / data.count).toFixed(2) : '0',
        articles: data.articles,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private displayTopicReport(stats: any[]): void {
    this.log(formatHeader('Topic Distribution Report'));
    this.log('');

    for (const { topic, frequency, avgScore } of stats) {
      this.log(`${topic.padEnd(30)} ${frequency} articles (avg score: ${avgScore})`);
    }
  }
}
