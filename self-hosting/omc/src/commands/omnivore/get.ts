import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { fetchUsername, checkGraphQLResult } from '@lib/cli/graphql.js';
import { getArticle } from '@lib/omnivore/client.js';
import type { OmnivoreArticle } from '@omc-types/omnivore.js';

/**
 * Fetch article by slug.
 * AIDEV-NOTE: Direct Omnivore API access for article retrieval
 */
export default class OmnivoreGet extends BaseCommand {
  static override description = 'Fetch article by slug';

  static override examples = [
    '$ omc omnivore get my-article-slug',
    '$ omc omnivore get my-article-slug --json',
    '$ omc omnivore get my-article-slug --username different-user',
  ];

  static override args = {
    slug: Args.string({ description: 'Article slug', required: true }),
  };

  static override flags = {
    username: Flags.string({ char: 'u', description: 'Username (defaults to authenticated user)' }),
    content: Flags.boolean({
      description: 'Print raw article content to stdout (agent-friendly)',
      default: false,
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: { slug: string; username?: string; content: boolean; json: boolean }): Promise<void> {
    const username = flags.username || await fetchUsername();
    const result = await getArticle(flags.slug, username);
    checkGraphQLResult({ data: { article: result }, errors: undefined });

    if (!result.article) {
      throw new Error('Article not found');
    }

    if (flags.content && flags.json) {
      throw new Error('Use either --content or --json (not both)');
    }

    if (flags.content) {
      this.log(result.article?.content ?? '');
      return;
    }

    this.outputArticle(result.article, flags.json);
  }

  private outputArticle(article: OmnivoreArticle, json: boolean): void {
    if (json) {
      this.log(JSON.stringify(article, null, 2));
    } else {
      this.log(`Title: ${article.title}`);
      this.log(`URL: ${article.url}`);
      this.log(`Author: ${article.author || 'N/A'}`);
      this.log(`Description: ${article.description || 'N/A'}`);
    }
  }
}
