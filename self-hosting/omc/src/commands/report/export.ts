import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { withDatabase } from '@lib/cli/database.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

/**
 * Export report data.
 * AIDEV-NOTE: Supports json|csv|markdown output formats for different use cases
 */
export default class ReportExport extends BaseCommand {
  static override description = 'Export report data to file or stdout';

  static override examples = [
    '$ omc report export --format json',
    '$ omc report export --format csv --report-type topics',
    '$ omc report export --format markdown',
  ];

  static override flags = {
    format: Flags.string({
      description: 'Output format',
      required: true,
      options: ['json', 'csv', 'markdown'],
    }),
    'report-type': Flags.string({
      description: 'Type of report to export',
      default: 'corpus',
      options: ['corpus', 'topics', 'sentiment', 'monetization'],
    }),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const jobs = repo.getCompletedWithAnalysis();
      const analyses = this.parseAnalyses(jobs);

      const output = this.formatOutput(analyses, flags.format, flags['report-type']);
      this.log(output);
    });
  }

  private parseAnalyses(jobs: any[]): ContentAnalysis[] {
    return jobs.map(job => parseJsonSafely<ContentAnalysis>(job.analysisJson))
      .filter((a): a is ContentAnalysis => !!a && !!a.topics && a.topics[0] !== 'N/A');
  }

  private formatOutput(analyses: ContentAnalysis[], format: string, reportType: string): string {
    if (format === 'json') return this.exportJSON(analyses, reportType);
    if (format === 'csv') return this.exportCSV(analyses, reportType);
    return this.exportMarkdown(analyses, reportType);
  }

  private exportJSON(analyses: ContentAnalysis[], reportType: string): string {
    const data = reportType === 'topics' ? this.buildTopicsData(analyses) :
                 reportType === 'sentiment' ? this.buildSentimentData(analyses) :
                 reportType === 'monetization' ? this.buildMonetizationData(analyses) :
                 { analyses };
    return JSON.stringify(data, null, 2);
  }

  private exportCSV(analyses: ContentAnalysis[], reportType: string): string {
    if (reportType === 'topics') {
      const topics = this.buildTopicsData(analyses);
      return 'Topic,Frequency,AvgScore\n' +
        topics.map((t: any) => `${t.topic},${t.frequency},${t.avgScore}`).join('\n');
    }
    return 'ArticleId,Topics,Sentiment,ContentType\n' +
      analyses.map(a => `${a.articleId},"${a.topics.join(';')}",${a.sentiment},${a.contentType}`).join('\n');
  }

  private exportMarkdown(analyses: ContentAnalysis[], reportType: string): string {
    let md = `# ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report\n\n`;
    md += `Total Analyses: ${analyses.length}\n\n`;

    if (reportType === 'topics') {
      md += '## Topic Distribution\n\n';
      const topics = this.buildTopicsData(analyses);
      for (const t of topics) {
        md += `- **${t.topic}**: ${t.frequency} articles (avg score: ${t.avgScore})\n`;
      }
    } else {
      md += '## Articles\n\n';
      for (const a of analyses.slice(0, 10)) {
        md += `### ${a.articleId}\n`;
        md += `- Topics: ${a.topics.join(', ')}\n`;
        md += `- Sentiment: ${a.sentiment}\n\n`;
      }
    }
    return md;
  }

  private buildTopicsData(analyses: ContentAnalysis[]): any[] {
    const topicData: Record<string, { count: number; scoreSum: number }> = {};
    for (const a of analyses) {
      for (const topic of a.topics) {
        if (!topicData[topic]) topicData[topic] = { count: 0, scoreSum: 0 };
        topicData[topic].count++;
        topicData[topic].scoreSum += a.topicScores[topic] || 0;
      }
    }
    return Object.entries(topicData)
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        avgScore: (data.scoreSum / data.count).toFixed(2),
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private buildSentimentData(analyses: ContentAnalysis[]): any {
    const counts: Record<string, number> = {};
    for (const a of analyses) {
      counts[a.sentiment] = (counts[a.sentiment] || 0) + 1;
    }
    return { distribution: counts };
  }

  private buildMonetizationData(analyses: ContentAnalysis[]): any[] {
    return analyses.map(a => ({
      articleId: a.articleId,
      monetizationAngle: a.monetizationAngle,
      topics: a.topics,
      sentiment: a.sentiment,
    }));
  }
}
