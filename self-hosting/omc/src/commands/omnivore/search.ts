import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { searchArticles } from '@lib/omnivore/client.js';
import type { SearchResult } from '@omc-types/omnivore.js';

/**
 * Search articles.
 * AIDEV-NOTE: Omnivore search with query DSL support
 */
export default class OmnivoreSearch extends BaseCommand {
  static override description = 'Search articles';

  static override examples = [
    '$ omc omnivore search "AI machine learning"',
    '$ omc omnivore search "label:tech" --limit 20',
    '$ omc omnivore search "in:inbox" --json',
  ];

  static override args = {
    query: Args.string({ description: 'Search query', required: true }),
  };

  static override flags = {
    limit: Flags.integer({ char: 'l', description: 'Max results', default: 10 }),
    json: jsonFlag(),
  };

  protected async execute(flags: { query: string; limit: number; json: boolean }): Promise<void> {
    const result = await searchArticles({ query: flags.query, first: flags.limit });
    checkGraphQLResult({ data: { search: result }, errors: undefined });

    this.outputResults(result.edges, flags.json);
  }

  private outputResults(edges: SearchResult['edges'], json: boolean): void {
    if (json) {
      this.log(JSON.stringify(edges.map((e) => e.node), null, 2));
    } else {
      edges.forEach(({ node }) => {
        this.log(`- ${node.title}`);
        this.log(`  URL: ${node.url}`);
      });
    }
  }
}
