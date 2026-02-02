import { Args } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { withDatabase } from '@lib/cli/database.js';
import { fetchUsername } from '@lib/cli/graphql.js';
import { getHighlights } from '@lib/omnivore/client.js';

type NoteRecord = { annotation?: string | null; createdAt?: string; quote?: string | null; type?: string };

/**
 * Get notes for article.
 * AIDEV-NOTE: Filters highlights to show only NOTE type
 */
export default class NoteGet extends BaseCommand {
  static override description = 'Get notes for article';

  static override examples = [
    '$ omc omnivore note get article-id',
    '$ omc omnivore note get article-id --json',
  ];

  static override args = {
    articleId: Args.string({ description: 'Article ID', required: true }),
  };

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: { articleId: string; json: boolean }): Promise<void> {
    await withDatabase(async ({ repo }) => {
      const job = repo.getByArticleId(flags.articleId);
      if (!job) {
        this.error(`Article not found in database: ${flags.articleId}`);
      }
      const username = await fetchUsername();
      const highlights = (await getHighlights(job.articleSlug, username)) as NoteRecord[];
      const notes = this.filterNotes(highlights);
      this.outputNotes(notes, flags.json);
    });
  }

  private filterNotes(highlights: NoteRecord[]): NoteRecord[] {
    return highlights.filter((h) => h.type === 'NOTE' || (!h.quote && h.annotation));
  }

  private outputNotes(notes: NoteRecord[], json: boolean): void {
    if (json) {
      this.log(JSON.stringify(notes, null, 2));
    } else {
      notes.forEach((note) => {
        this.log(`- ${note.annotation ?? ''}`);
        if (note.createdAt) this.log(`  Created: ${note.createdAt}`);
      });
    }
  }
}
