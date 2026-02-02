import { Args } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { updateHighlight } from '@lib/omnivore/client.js';

/**
 * Update note content.
 * AIDEV-NOTE: Updates annotation field of highlight
 */
export default class NoteUpdate extends BaseCommand {
  static override description = 'Update note content';

  static override examples = [
    '$ omc omnivore note update highlight-id "Updated note"',
    '$ omc omnivore note update highlight-id "New content" --json',
  ];

  static override args = {
    highlightId: Args.string({ description: 'Highlight ID', required: true }),
    note: Args.string({ description: 'New note content', required: true }),
  };

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: { highlightId: string; note: string; json: boolean }): Promise<void> {
    const result = await updateHighlight({
      highlightId: flags.highlightId,
      annotation: flags.note,
    });
    checkGraphQLResult({ data: { updateHighlight: result }, errors: undefined });

    this.outputResult(result, flags.json);
  }

  private outputResult(result: any, json: boolean): void {
    if (json) {
      this.log(JSON.stringify(result.highlight, null, 2));
    } else {
      this.log('Note updated successfully');
    }
  }
}
