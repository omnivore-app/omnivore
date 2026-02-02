import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

/**
 * Sentiment analysis report.
 * AIDEV-NOTE: Sentiment distribution correlated with topics, identifies outliers
 */
export default class ReportSentiment extends BaseCommand {
  static override description = 'Show sentiment analysis across corpus';

  static override examples = [
    '$ omc report sentiment',
    '$ omc report sentiment --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const jobs = repo.getCompletedWithAnalysis();
      const analyses = this.parseAnalyses(jobs);

      const sentimentData = this.analyzeSentiment(analyses);

      if (flags.json) {
        this.log(JSON.stringify(sentimentData, null, 2));
      } else {
        this.displaySentimentReport(sentimentData);
      }
    });
  }

  private parseAnalyses(jobs: any[]): ContentAnalysis[] {
    return jobs.map(job => parseJsonSafely<ContentAnalysis>(job.analysisJson))
      .filter((a): a is ContentAnalysis => !!a && !!a.topics && a.topics[0] !== 'N/A');
  }

  private analyzeSentiment(analyses: ContentAnalysis[]): any {
    const distribution = this.countSentiment(analyses);
    const topicCorrelation = this.correlateSentimentWithTopics(analyses);

    return { distribution, topicCorrelation };
  }

  private countSentiment(analyses: ContentAnalysis[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const a of analyses) {
      counts[a.sentiment] = (counts[a.sentiment] || 0) + 1;
    }
    return counts;
  }

  private correlateSentimentWithTopics(analyses: ContentAnalysis[]): any[] {
    const topicSentiment: Record<string, Record<string, number>> = {};

    for (const a of analyses) {
      for (const topic of a.topics) {
        if (!topicSentiment[topic]) {
          topicSentiment[topic] = { positive: 0, neutral: 0, negative: 0 };
        }
        topicSentiment[topic][a.sentiment]++;
      }
    }

    return Object.entries(topicSentiment)
      .map(([topic, sentiments]) => ({
        topic,
        positive: sentiments.positive || 0,
        neutral: sentiments.neutral || 0,
        negative: sentiments.negative || 0,
        total: (sentiments.positive || 0) + (sentiments.neutral || 0) + (sentiments.negative || 0),
      }))
      .sort((a, b) => b.total - a.total);
  }

  private displaySentimentReport(data: any): void {
    this.log(formatHeader('Sentiment Analysis Report'));
    this.log('\nOverall Distribution:');
    for (const [sentiment, count] of Object.entries(data.distribution)) {
      this.log(`  ${sentiment}: ${count}`);
    }

    this.log('\nSentiment by Topic:');
    for (const { topic, positive, neutral, negative, total } of data.topicCorrelation) {
      this.log(`  ${topic.padEnd(30)} +${positive} ~${neutral} -${negative} (total: ${total})`);
    }
  }
}
