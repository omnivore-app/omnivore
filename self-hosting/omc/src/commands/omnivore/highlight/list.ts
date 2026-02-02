import { Args } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { fetchUsername } from '@lib/cli/graphql.js';
import { getHighlights } from '@lib/omnivore/client.js';

type HighlightRecord = {
  id: string;
  quote?: string | null;
  annotation?: string | null;
  createdAt?: string;
  type?: string;
};

/**
 * List highlights for article.
 * AIDEV-NOTE: Filters to show only HIGHLIGHT type (excludes NOTEs)
 */
export default class HighlightList extends BaseCommand {
  static override description = 'List highlights for article';

  static override examples = [
    '$ omc omnivore highlight list article-id',
    '$ omc omnivore highlight list article-id --json',
  ];

  static override args = {
    articleId: Args.string({ description: 'Article ID', required: true }),
  };

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: { articleId: string; json: boolean }): Promise<void> {
    const username = await fetchUsername();
    const allHighlights = (await getHighlights(flags.articleId, username)) as HighlightRecord[];
    const highlights = this.filterHighlights(allHighlights);

    this.outputHighlights(highlights, flags.json);
  }

  private filterHighlights(highlights: HighlightRecord[]): HighlightRecord[] {
    return highlights.filter((h) => h.type === 'HIGHLIGHT' || Boolean(h.quote));
  }

  private outputHighlights(highlights: HighlightRecord[], json: boolean): void {
    if (json) {
      this.log(JSON.stringify(highlights, null, 2));
    } else {
      highlights.forEach((h) => {
        this.log(`- "${h.quote ?? ''}"`);
        if (h.annotation) this.log(`  Note: ${h.annotation}`);
      });
    }
  }
}
