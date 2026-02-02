import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

/**
 * Monetization opportunities report.
 * AIDEV-NOTE: Extracts monetizationAngle from analyses, ranks by potential
 */
export default class ReportMonetization extends BaseCommand {
  static override description = 'Show monetization opportunities across analyses';

  static override examples = [
    '$ omc report monetization',
    '$ omc report monetization --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const jobs = repo.getCompletedWithAnalysis();
      const analyses = this.parseAnalyses(jobs);

      const opportunities = this.extractOpportunities(analyses);

      if (flags.json) {
        this.log(JSON.stringify(opportunities, null, 2));
      } else {
        this.displayOpportunities(opportunities);
      }
    });
  }

  private parseAnalyses(jobs: any[]): ContentAnalysis[] {
    return jobs.map(job => parseJsonSafely<ContentAnalysis>(job.analysisJson))
      .filter((a): a is ContentAnalysis => !!a && !!a.topics && a.topics[0] !== 'N/A');
  }

  private extractOpportunities(analyses: ContentAnalysis[]): any[] {
    const themeGroups: Record<string, any[]> = {};

    for (const a of analyses) {
      const theme = this.extractTheme(a.monetizationAngle);
      if (!themeGroups[theme]) themeGroups[theme] = [];
      themeGroups[theme].push({
        articleId: a.articleId,
        angle: a.monetizationAngle,
        sentiment: a.sentiment,
        topics: a.topics,
      });
    }

    return Object.entries(themeGroups)
      .map(([theme, items]) => ({
        theme,
        count: items.length,
        items,
        potential: this.calculatePotential(items),
      }))
      .sort((a, b) => b.potential - a.potential);
  }

  private extractTheme(angle: string): string {
    const lower = angle.toLowerCase();
    if (lower.includes('comparison') || lower.includes('compare')) return 'comparison';
    if (lower.includes('roundup') || lower.includes('weekly')) return 'roundup';
    if (lower.includes('tutorial') || lower.includes('guide')) return 'tutorial';
    if (lower.includes('review')) return 'review';
    return 'other';
  }

  private calculatePotential(items: any[]): number {
    const positiveCount = items.filter(i => i.sentiment === 'positive').length;
    return items.length * 10 + positiveCount * 5;
  }

  private displayOpportunities(opportunities: any[]): void {
    this.log(formatHeader('Monetization Opportunities Report'));
    this.log('');

    for (const { theme, count, items, potential } of opportunities) {
      this.log(`${theme.toUpperCase()} (${count} articles, potential: ${potential})`);
      for (const item of items.slice(0, 3)) {
        this.log(`  • ${item.angle}`);
      }
      if (items.length > 3) this.log(`  ... and ${items.length - 3} more\n`);
      else this.log('');
    }
  }
}
