import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { parseJsonSafely } from '@lib/cli/command-utils.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

/**
 * Custom SQL-based report.
 * AIDEV-NOTE: Allows filtering analyses with custom SQL WHERE clause
 */
export default class ReportCustom extends BaseCommand {
  static override description = 'Run custom SQL query against analyses';

  static override examples = [
    '$ omc report custom --query "article_title LIKE \'%AI%\'"',
    '$ omc report custom --query "completed_at > \'2024-01-01\'" --json',
  ];

  static override flags = {
    query: Flags.string({
      description: 'SQL WHERE clause for filtering',
      required: true,
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    await withDatabase(async ({ db }) => {
      const results = this.executeCustomQuery(db, flags.query);

      if (flags.json) {
        this.log(JSON.stringify(results, null, 2));
      } else {
        this.displayResults(results);
      }
    });
  }

  private executeCustomQuery(db: any, whereClause: string): any[] {
    try {
      const sql = this.buildQuerySQL(whereClause);
      const rows = db.prepare(sql).all();
      return this.mapQueryResults(rows);
    } catch (error) {
      throw new Error(`SQL query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildQuerySQL(whereClause: string): string {
    return `
      SELECT article_id as articleId, article_title as articleTitle,
             analysis_json as analysisJson, completed_at as completedAt
      FROM analysis_queue
      WHERE status = 'completed' AND analysis_json IS NOT NULL AND (${whereClause})
      ORDER BY completed_at DESC
    `;
  }

  private mapQueryResults(rows: any[]): any[] {
    return rows.map((row: any) => {
      const analysis = parseJsonSafely<ContentAnalysis>(row.analysisJson);
      return {
        articleId: row.articleId,
        articleTitle: row.articleTitle,
        completedAt: row.completedAt,
        analysis,
      };
    }).filter(r => r.analysis);
  }

  private displayResults(results: any[]): void {
    this.log(formatHeader('Custom Query Results'));
    this.log(`\nFound ${results.length} matching analyses\n`);

    for (const { articleTitle, completedAt, analysis } of results) {
      this.log(`${articleTitle}`);
      this.log(`  Completed: ${completedAt}`);
      this.log(`  Topics: ${analysis.topics.join(', ')}`);
      this.log(`  Sentiment: ${analysis.sentiment}\n`);
    }
  }
}
