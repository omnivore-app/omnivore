import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { updatePage } from '@lib/omnivore/client.js';

/**
 * Update article metadata.
 * AIDEV-NOTE: Modify article title/description via Omnivore API
 */
export default class OmnivoreUpdate extends BaseCommand {
  static override description = 'Update article metadata';

  static override examples = [
    '$ omc omnivore update article-id --title "New Title"',
    '$ omc omnivore update article-id --description "Summary"',
    '$ omc omnivore update article-id --title "Title" --description "Desc" --json',
  ];

  static override args = {
    articleId: Args.string({ description: 'Article ID', required: true }),
  };

  static override flags = {
    title: Flags.string({ char: 't', description: 'New title' }),
    description: Flags.string({ char: 'd', description: 'New description' }),
    json: jsonFlag(),
  };

  protected async execute(flags: { articleId: string; title?: string; description?: string; json: boolean }): Promise<void> {
    this.validateFlags(flags);

    const result = await updatePage({
      pageId: flags.articleId,
      title: flags.title,
      description: flags.description,
    });
    checkGraphQLResult({ data: { updatePage: result }, errors: undefined });

    this.outputResult(result, flags.json);
  }

  private validateFlags(flags: { title?: string; description?: string }): void {
    if (!flags.title && !flags.description) {
      throw new Error('At least one of --title or --description is required');
    }
  }

  private outputResult(result: any, json: boolean): void {
    if (json) {
      this.log(JSON.stringify(result.updatedPage, null, 2));
    } else {
      this.log('Article updated successfully');
    }
  }
}
