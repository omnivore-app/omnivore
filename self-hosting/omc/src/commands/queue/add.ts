import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { formatSuccess } from '@lib/cli/formatters.js';
import { fetchUsername, checkGraphQLResult } from '@lib/cli/graphql.js';
import { searchArticles, getArticle, getArticlesByLabel } from '@lib/omnivore/client.js';
import type { OmnivoreArticle, SearchResult } from '@omc-types/omnivore.js';

interface QueueAddFlags {
  hours?: number;
  url?: string;
  label?: string;
  slug?: string;
  json: boolean;
}

type QueueSourceArticle = Pick<OmnivoreArticle, 'id' | 'url' | 'title' | 'savedAt'> & { slug: string };

/**
 * Add articles to the analysis queue.
 * AIDEV-NOTE: Entry point for queue population from Omnivore API
 */
export default class QueueAdd extends BaseCommand {
  static override description = 'Add articles to the analysis queue';

  static override examples = [
    '$ omc queue add --hours 24',
    '$ omc queue add --hours 168',
    '$ omc queue add --label AI',
    '$ omc queue add --slug my-article-slug',
    '$ omc queue add --url https://omnivore.app/username/article-slug',
    '$ omc queue add --hours 24 --json',
  ];

  static override flags = {
    hours: Flags.integer({
      char: 'h',
      description: 'Add articles from last N hours',
      exclusive: ['url', 'label', 'slug'],
    }),
    url: Flags.string({
      char: 'u',
      description: 'Add single article by Omnivore URL',
      exclusive: ['hours', 'label', 'slug'],
    }),
    label: Flags.string({
      char: 'l',
      description: 'Add articles with specific label',
      exclusive: ['hours', 'url', 'slug'],
    }),
    slug: Flags.string({
      char: 's',
      description: 'Add single article by slug',
      exclusive: ['hours', 'url', 'label'],
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: QueueAddFlags): Promise<void> {
    this.validateFlags(flags);

    await withDatabase(async ({ repo }) => {
      let articles: QueueSourceArticle[] = [];

      if (flags.label) {
        articles = await this.fetchByLabel(flags.label);
      } else if (flags.url) {
        articles = await this.fetchByUrl(flags.url);
      } else if (flags.slug) {
        articles = await this.fetchBySlug(flags.slug);
      } else {
        articles = await this.fetchByHours(this.requireHours(flags.hours));
      }

      const queueArticles = this.formatArticlesForQueue(articles);
      const inserted = repo.initializeQueue(queueArticles);
      this.outputResults(inserted, articles.length, flags.json);
    });
  }

  private validateFlags(flags: QueueAddFlags): void {
    if (!flags.hours && !flags.url && !flags.label && !flags.slug) {
      throw new Error('One of --hours, --url, --label, or --slug is required');
    }
  }

  private requireHours(hours: number | undefined): number {
    if (hours === undefined) throw new Error('--hours is required');
    return hours;
  }

  private async fetchByHours(hours: number): Promise<QueueSourceArticle[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    const collected: QueueSourceArticle[] = [];
    let after: string | undefined;
    let shouldContinue = true;

    while (shouldContinue) {
      const result = await this.fetchSearchPage(after);
      const { items, reachedCutoff, nextCursor } = this.collectWithinCutoff(result, hoursAgo);
      collected.push(...items);
      shouldContinue = !reachedCutoff && Boolean(nextCursor);
      after = nextCursor ?? undefined;
    }

    return collected;
  }

  private async fetchSearchPage(after?: string): Promise<SearchResult> {
    const result = await searchArticles({
      query: 'in:all sort:saved-desc',
      first: 100,
      after: after ?? '',
    });

    if (!isSearchResult(result)) throw new Error('Unexpected searchArticles response shape');
    return result;
  }

  private collectWithinCutoff(result: SearchResult, cutoff: Date): { items: QueueSourceArticle[]; reachedCutoff: boolean; nextCursor?: string } {
    const items: QueueSourceArticle[] = [];
    for (const edge of result.edges) {
      const node = edge.node;
      if (new Date(node.savedAt) < cutoff) return { items, reachedCutoff: true };
      if (isQueueSourceArticle(node)) items.push(node);
    }
    return { items, reachedCutoff: false, nextCursor: result.pageInfo.endCursor };
  }

  private async fetchByLabel(labelName: string): Promise<QueueSourceArticle[]> {
    const result = await getArticlesByLabel(labelName, 50);
    if (!isSearchResult(result)) throw new Error('Unexpected getArticlesByLabel response shape');
    checkGraphQLResult({ data: { search: result }, errors: undefined });
    return result.edges.map((edge) => this.toQueueSourceArticle(edge.node));
  }

  private async fetchBySlug(slug: string): Promise<QueueSourceArticle[]> {
    const username = await fetchUsername();
    const result = await getArticle(slug, username);
    checkGraphQLResult({ data: { article: result }, errors: undefined });
    if (!result.article) {
      throw new Error('Article not found');
    }
    return [this.toQueueSourceArticle({ ...result.article, slug })];
  }

  private async fetchByUrl(url: string): Promise<QueueSourceArticle[]> {
    // AIDEV-NOTE: URL format is https://omnivore.app/{username}/{slug}
    const urlPattern = /https:\/\/omnivore\.app\/([^/]+)\/(.+)/;
    const match = url.match(urlPattern);

    if (!match) {
      throw new Error('Invalid Omnivore URL. Expected format: https://omnivore.app/{username}/{slug}');
    }

    const [, username, slug] = match;
    const result = await getArticle(slug, username);
    checkGraphQLResult({ data: { article: result }, errors: undefined });
    if (!result.article) {
      throw new Error('Article not found');
    }
    return [this.toQueueSourceArticle({ ...result.article, slug })];
  }

  private toQueueSourceArticle(article: OmnivoreArticle): QueueSourceArticle {
    if (!isQueueSourceArticle(article)) throw new Error('Article missing required queue fields');
    return { id: article.id, slug: article.slug, url: article.url, title: article.title, savedAt: article.savedAt };
  }

  private formatArticlesForQueue(articles: QueueSourceArticle[]): Array<{ id: string; slug: string; url: string; title: string; savedAt: string }> {
    return articles.map(({ id, slug, url, title, savedAt }) => ({ id, slug, url, title, savedAt }));
  }

  private outputResults(inserted: number, total: number, json: boolean): void {
    if (json) {
      this.log(JSON.stringify({ added: inserted, total }));
    } else {
      this.log(formatSuccess(`Added ${inserted} articles to queue (${total} total found)`));
    }
  }

}

function isSearchResult(value: unknown): value is SearchResult {
  return typeof value === 'object' && value !== null && 'edges' in value && 'pageInfo' in value;
}

function isQueueSourceArticle(value: unknown): value is QueueSourceArticle {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as { id?: unknown; slug?: unknown; url?: unknown; title?: unknown; savedAt?: unknown };
  return typeof v.id === 'string' && typeof v.slug === 'string' && typeof v.url === 'string' && typeof v.title === 'string' && typeof v.savedAt === 'string';
}
