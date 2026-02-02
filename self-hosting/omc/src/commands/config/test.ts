import { BaseCommand } from '@lib/cli/base-command.js';
import { formatSuccess, formatError } from '@lib/cli/formatters.js';
import { getMe } from '@lib/omnivore/client.js';

/**
 * Test API connection.
 * AIDEV-NOTE: Uses testConnection pattern from lib/omnivore/client.js
 */
export default class ConfigTest extends BaseCommand {
  static override description = 'Test API connection';

  static override examples = [
    '$ omc config test',
  ];

  protected async execute(flags: any): Promise<void> {
    void flags;
    try {
      const user = await getMe();

      this.log(formatSuccess('Connected to Omnivore API'));
      this.log(`   User: ${user.name} (${user.email})`);
      this.log(`   Username: ${user.profile?.username ?? 'N/A'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.log(formatError('Failed to connect to Omnivore API'));
      this.log(`   ${message}`);
      throw error;
    }
  }
}
