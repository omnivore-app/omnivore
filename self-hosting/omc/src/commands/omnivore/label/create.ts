import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { checkGraphQLResult } from '@lib/cli/graphql.js';
import { createLabel } from '@lib/omnivore/client.js';

/**
 * Create a label.
 * AIDEV-NOTE: Replacement for standalone scripts/test-create-label.js and migrate helpers.
 */
export default class OmnivoreLabelCreate extends BaseCommand {
  static override description = 'Create a label';

  static override examples = [
    '$ omc omnivore label create --name "ai"',
    '$ omc omnivore label create --name "ai" --color "#3B82F6" --description "AI/ML" --json',
  ];

  static override flags = {
    name: Flags.string({ description: 'Label name', required: true }),
    color: Flags.string({ description: 'Hex color (e.g. #3B82F6)' }),
    description: Flags.string({ description: 'Description' }),
    json: jsonFlag(),
  };

  protected async execute(flags: { name: string; color?: string; description?: string; json: boolean }): Promise<void> {
    const result = await createLabel({ name: flags.name, color: flags.color, description: flags.description });
    checkGraphQLResult({ data: { createLabel: result }, errors: undefined });

    if (flags.json) {
      this.log(JSON.stringify(result.label ?? result, null, 2));
      return;
    }

    this.log(`Label created: ${result.label?.name ?? flags.name}`);
  }
}

