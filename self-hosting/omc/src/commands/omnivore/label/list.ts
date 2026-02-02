import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { getLabels } from '@lib/omnivore/client.js';

/**
 * List labels.
 * AIDEV-NOTE: Integrates legacy Omnivore label scripts into the OMC CLI.
 */
export default class OmnivoreLabelList extends BaseCommand {
  static override description = 'List labels';

  static override examples = [
    '$ omc omnivore label list',
    '$ omc omnivore label list --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: { json: boolean }): Promise<void> {
    const labels = await getLabels();
    checkGraphQLResult({ data: { labels }, errors: undefined });

    if (flags.json) {
      this.log(JSON.stringify(labels, null, 2));
      return;
    }

    for (const label of labels) {
      this.log(`- ${label.name} (${label.id})`);
    }
  }
}

