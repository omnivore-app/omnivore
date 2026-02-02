import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { createHighlight } from '@lib/omnivore/client.js';

/**
 * Add highlight to article.
 * AIDEV-NOTE: Creates HIGHLIGHT-type with quote (optional annotation)
 */
export default class HighlightAdd extends BaseCommand {
  static override description = 'Add highlight to article';

  static override examples = [
    '$ omc omnivore highlight add article-id "quote text"',
    '$ omc omnivore highlight add article-id "quote" --annotation "my note"',
    '$ omc omnivore highlight add article-id "quote" --color "#FF0000" --json',
  ];

  static override args = {
    articleId: Args.string({ description: 'Article ID', required: true }),
    quote: Args.string({ description: 'Highlighted text', required: true }),
  };

  static override flags = {
    annotation: Flags.string({ char: 'a', description: 'Optional annotation' }),
    color: Flags.string({ char: 'c', description: 'Highlight color', default: '#FFD700' }),
    json: jsonFlag(),
  };

  protected async execute(flags: { articleId: string; quote: string; annotation?: string; color: string; json: boolean }): Promise<void> {
    const result = await createHighlight({
      id: crypto.randomUUID(),
      shortId: crypto.randomUUID().substring(0, 8),
      articleId: flags.articleId,
      quote: flags.quote,
      annotation: flags.annotation,
      color: flags.color,
      type: 'HIGHLIGHT',
    });
    checkGraphQLResult({ data: { createHighlight: result }, errors: undefined });

    this.outputResult(result, flags.json);
  }

  private outputResult(result: any, json: boolean): void {
    if (json) {
      this.log(JSON.stringify(result.highlight, null, 2));
    } else {
      this.log('Highlight added successfully');
    }
  }
}
