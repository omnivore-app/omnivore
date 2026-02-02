import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatSuccess } from '@lib/cli/formatters.js';
import { withDatabase } from '@lib/cli/database.js';

/**
 * Seed database with sample articles for testing.
 * AIDEV-NOTE: Creates 10 diverse sample articles with varied statuses
 */
export default class DbSeed extends BaseCommand {
  static override description = 'Seed database with sample data';

  static override examples = [
    '$ omc db seed',
    '$ omc db seed --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  async execute(flags: any): Promise<void> {
    await withDatabase(async (db) => {
      const samples = this.createSampleData();
      const inserted = this.seedArticles(db, samples);

      if (flags.json) {
        this.log(JSON.stringify({ inserted, total: samples.length }, null, 2));
      } else {
        this.log(formatSuccess(`Seeded ${inserted} sample articles`));
      }
    });
  }

  private seedArticles(db: any, samples: any[]): number {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO analysis_queue (
        article_id, article_slug, article_url, article_title,
        saved_at, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    let inserted = 0;
    samples.forEach(article => {
      const result = stmt.run(
        article.articleId,
        article.articleSlug,
        article.articleUrl,
        article.articleTitle,
        article.savedAt,
        article.status
      );
      if (result.changes > 0) inserted++;
    });

    return inserted;
  }

  private createSampleData() {
    return [
      { articleId: 'seed-001', articleSlug: 'intro-to-llms', articleUrl: 'https://omnivore.app/test/intro-to-llms', articleTitle: 'Introduction to Large Language Models', savedAt: '2025-01-01T10:00:00Z', status: 'pending' },
      { articleId: 'seed-002', articleSlug: 'docker-best-practices', articleUrl: 'https://omnivore.app/test/docker-best-practices', articleTitle: 'Docker Best Practices 2025', savedAt: '2025-01-02T10:00:00Z', status: 'pending' },
      { articleId: 'seed-003', articleSlug: 'rust-async-await', articleUrl: 'https://omnivore.app/test/rust-async-await', articleTitle: 'Understanding Async/Await in Rust', savedAt: '2025-01-03T10:00:00Z', status: 'pending' },
      { articleId: 'seed-004', articleSlug: 'kubernetes-scaling', articleUrl: 'https://omnivore.app/test/kubernetes-scaling', articleTitle: 'Kubernetes Autoscaling Guide', savedAt: '2025-01-04T10:00:00Z', status: 'in_progress' },
      { articleId: 'seed-005', articleSlug: 'typescript-generics', articleUrl: 'https://omnivore.app/test/typescript-generics', articleTitle: 'Mastering TypeScript Generics', savedAt: '2025-01-05T10:00:00Z', status: 'in_progress' },
      { articleId: 'seed-006', articleSlug: 'graphql-federation', articleUrl: 'https://omnivore.app/test/graphql-federation', articleTitle: 'GraphQL Federation Explained', savedAt: '2025-01-06T10:00:00Z', status: 'completed' },
      { articleId: 'seed-007', articleSlug: 'postgres-performance', articleUrl: 'https://omnivore.app/test/postgres-performance', articleTitle: 'PostgreSQL Performance Tuning', savedAt: '2025-01-07T10:00:00Z', status: 'completed' },
      { articleId: 'seed-008', articleSlug: 'react-server-components', articleUrl: 'https://omnivore.app/test/react-server-components', articleTitle: 'React Server Components Deep Dive', savedAt: '2025-01-08T10:00:00Z', status: 'completed' },
      { articleId: 'seed-009', articleSlug: 'distributed-tracing', articleUrl: 'https://omnivore.app/test/distributed-tracing', articleTitle: 'Distributed Tracing with OpenTelemetry', savedAt: '2025-01-09T10:00:00Z', status: 'failed' },
      { articleId: 'seed-010', articleSlug: 'webassembly-performance', articleUrl: 'https://omnivore.app/test/webassembly-performance', articleTitle: 'WebAssembly Performance Benchmarks', savedAt: '2025-01-10T10:00:00Z', status: 'failed' },
    ];
  }
}
