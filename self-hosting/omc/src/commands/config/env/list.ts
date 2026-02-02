import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { readdirSync } from 'fs';

/**
 * List available environments.
 * AIDEV-NOTE: Shows .env files with active indicator
 */
export default class ConfigEnvList extends BaseCommand {
  static override description = 'List available environments';

  static override examples = [
    '$ omc config env list',
    '$ omc config env list --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    const environments = this.findEnvironments();

    if (flags.json) {
      this.log(JSON.stringify(environments, null, 2));
    } else {
      this.displayEnvironments(environments);
    }
  }

  private findEnvironments(): Array<{ name: string; file: string; active: boolean }> {
    const cwd = process.cwd();
    const files = readdirSync(cwd);
    const envFiles = files.filter(f => f.startsWith('.env'));

    return envFiles.map(file => ({
      name: file === '.env' ? 'local' : file.replace('.env.', ''),
      file,
      active: file === '.env',
    }));
  }

  private displayEnvironments(environments: Array<{ name: string; file: string; active: boolean }>): void {
    this.log(formatHeader('Available Environments'));

    if (environments.length === 0) {
      this.log('No environment files found');
      return;
    }

    for (const env of environments) {
      const indicator = env.active ? '* ' : '  ';
      this.log(`${indicator}${env.name.padEnd(15)} (${env.file})`);
    }
  }
}
