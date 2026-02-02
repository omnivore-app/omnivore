import { Args } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { createHighlight } from '@lib/omnivore/client.js';

/**
 * Add note to article.
 * AIDEV-NOTE: Creates NOTE-type highlight (no quote required)
 */
export default class NoteAdd extends BaseCommand {
  static override description = 'Add note to article';

  static override examples = [
    '$ omc omnivore note add article-id "My note content"',
    '$ omc omnivore note add article-id "Note" --json',
  ];

  static override args = {
    articleId: Args.string({ description: 'Article ID', required: true }),
    note: Args.string({ description: 'Note content', required: true }),
  };

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: { articleId: string; note: string; json: boolean }): Promise<void> {
    const result = await createHighlight({
      id: crypto.randomUUID(),
      shortId: crypto.randomUUID().substring(0, 8),
      articleId: flags.articleId,
      annotation: flags.note,
      type: 'NOTE',
    });
    checkGraphQLResult({ data: { createHighlight: result }, errors: undefined });

    this.outputResult(result, flags.json);
  }

  private outputResult(result: any, json: boolean): void {
    if (json) {
      this.log(JSON.stringify(result.highlight, null, 2));
    } else {
      this.log('Note added successfully');
    }
  }
}
