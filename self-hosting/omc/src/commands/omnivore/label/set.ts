import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { setLabels } from '@lib/omnivore/client.js';

/**
 * Set labels on a page (replaces existing labels).
 * AIDEV-NOTE: Integrates apply-single-label.js / apply-labels*.js into OMC CLI surface.
 */
export default class OmnivoreLabelSet extends BaseCommand {
  static override description = 'Set labels on a page (replaces existing labels)';

  static override examples = [
    '$ omc omnivore label set <page-id> --label "ai"',
    '$ omc omnivore label set <page-id> --label "ai" --label "devops"',
    '$ omc omnivore label set <page-id> --label "ai" --source "omc" --json',
  ];

  static override args = {
    pageId: Args.string({ description: 'Page/Article ID', required: true }),
  };

  static override flags = {
    label: Flags.string({
      description: 'Label name (repeatable)',
      multiple: true,
      required: true,
    }),
    source: Flags.string({
      description: 'Optional source string (stored by Omnivore)',
      default: 'omc',
    }),
    json: jsonFlag(),
  };

  protected async execute(flags: { pageId: string; label: string[]; source: string; json: boolean }): Promise<void> {
    const labels = flags.label.map((name) => ({ name }));
    const result = await setLabels({ pageId: flags.pageId, labels, source: flags.source });
    checkGraphQLResult({ data: { setLabels: result }, errors: undefined });

    if (flags.json) {
      this.log(JSON.stringify(result, null, 2));
      return;
    }

    const applied = (result.labels ?? []).map((l: any) => l.name).join(', ');
    this.log(`Labels set: ${applied || '(none)'}`);
  }
}

