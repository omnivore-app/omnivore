import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

/**
 * Trending topics over time.
 * AIDEV-NOTE: Tracks topic frequency changes, identifies rising/falling trends
 */
export default class ReportTrends extends BaseCommand {
  static override description = 'Show trending topics over time';

  static override examples = [
    '$ omc report trends',
    '$ omc report trends --period week',
    '$ omc report trends --json',
  ];

  static override flags = {
    period: Flags.string({
      description: 'Time period for grouping (day|week|month)',
      default: 'week',
      options: ['day', 'week', 'month'],
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const jobs = repo.getCompletedWithAnalysis();
      const trends = this.buildTrendAnalysis(jobs, flags.period);

      if (flags.json) {
        this.log(JSON.stringify(trends, null, 2));
      } else {
        this.displayTrends(trends);
      }
    });
  }

  private buildTrendAnalysis(jobs: any[], period: string): any {
    const periodData: Record<string, Record<string, number>> = {};

    for (const job of jobs) {
      const analysis = parseJsonSafely<ContentAnalysis>(job.analysisJson);
      if (!analysis || !analysis.topics || analysis.topics[0] === 'N/A') continue;

      const periodKey = this.getPeriodKey(job.completedAt, period);
      if (!periodData[periodKey]) periodData[periodKey] = {};

      for (const topic of analysis.topics) {
        periodData[periodKey][topic] = (periodData[periodKey][topic] || 0) + 1;
      }
    }

    return this.calculateTrends(periodData);
  }

  private getPeriodKey(date: string, period: string): string {
    const d = new Date(date);
    if (period === 'day') return d.toISOString().split('T')[0];
    if (period === 'week') {
      const weekNum = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
      return `Week-${weekNum}`;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private calculateTrends(periodData: Record<string, Record<string, number>>): any {
    const periods = Object.keys(periodData).sort();
    const allTopics = this.extractAllTopics(periodData);
    const trends = Array.from(allTopics).map(topic => this.calculateTopicTrend(topic, periods, periodData));

    return { periods, trends: trends.sort((a, b) => parseFloat(b.avgSecond) - parseFloat(a.avgSecond)) };
  }

  private extractAllTopics(periodData: Record<string, Record<string, number>>): Set<string> {
    const topics = new Set<string>();
    for (const topicCounts of Object.values(periodData)) {
      for (const topic of Object.keys(topicCounts)) topics.add(topic);
    }
    return topics;
  }

  private calculateTopicTrend(topic: string, periods: string[], periodData: Record<string, Record<string, number>>): any {
    const counts = periods.map(p => periodData[p][topic] || 0);
    const firstHalf = counts.slice(0, Math.floor(counts.length / 2));
    const secondHalf = counts.slice(Math.floor(counts.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
    const trend = avgSecond > avgFirst ? 'rising' : avgSecond < avgFirst ? 'falling' : 'stable';

    return { topic, trend, avgFirst: avgFirst.toFixed(1), avgSecond: avgSecond.toFixed(1) };
  }

  private displayTrends(data: any): void {
    this.log(formatHeader('Topic Trends Report'));
    this.log(`\nPeriods analyzed: ${data.periods.join(', ')}\n`);

    for (const { topic, trend, avgFirst, avgSecond } of data.trends) {
      const arrow = trend === 'rising' ? '↑' : trend === 'falling' ? '↓' : '→';
      this.log(`${arrow} ${topic.padEnd(30)} ${avgFirst} → ${avgSecond} (${trend})`);
    }
  }
}
