import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { getRecentArticles } from '@lib/omnivore/client.js';
import type { SearchResult } from '@omc-types/omnivore.js';

/**
 * List recent articles.
 * AIDEV-NOTE: Time-filtered article listing
 */
export default class OmnivoreList extends BaseCommand {
  static override description = 'List recent articles';

  static override examples = [
    '$ omc omnivore list',
    '$ omc omnivore list --hours 48',
    '$ omc omnivore list --hours 24 --limit 20 --json',
  ];

  static override flags = {
    hours: Flags.integer({ char: 'h', description: 'Hours to look back', default: 24 }),
    limit: Flags.integer({ char: 'l', description: 'Max results', default: 10 }),
    json: jsonFlag(),
  };

  protected async execute(flags: Record<string, any>): Promise<void> {
    const result = await getRecentArticles(flags.hours, flags.limit);
    checkGraphQLResult({ data: { search: result }, errors: undefined });

    this.outputResults(result.edges, flags.json);
  }

  private outputResults(edges: SearchResult['edges'], json: boolean): void {
    if (json) {
      this.log(JSON.stringify(edges.map((e) => e.node), null, 2));
    } else {
      edges.forEach(({ node }) => {
        this.log(`- ${node.title}`);
        this.log(`  Saved: ${node.savedAt}`);
      });
    }
  }
}
