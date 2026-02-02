import { BaseCommand } from '@lib/cli/base-command.js';
import { Args } from '@oclif/core';
import { formatSuccess } from '@lib/cli/formatters.js';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Switch environment.
 * AIDEV-NOTE: Copies .env.{environment} to .env
 */
export default class ConfigEnvUse extends BaseCommand {
  static override description = 'Switch environment';

  static override examples = [
    '$ omc config env use dev',
    '$ omc config env use prod',
    '$ omc config env use local',
  ];

  static override args = {
    environment: Args.string({
      description: 'Environment to switch to (dev|prod|local)',
      required: true,
      options: ['dev', 'prod', 'local'],
    }),
  };

  protected async execute(flags: { environment: string }): Promise<void> {
    this.switchEnvironment(flags.environment);
    this.log(formatSuccess(`Switched to ${flags.environment} environment`));
  }

  private switchEnvironment(environment: string): void {
    const cwd = process.cwd();
    const sourceFile = environment === 'local' ? '.env.local' : `.env.${environment}`;
    const sourcePath = join(cwd, sourceFile);
    const targetPath = join(cwd, '.env');

    if (!existsSync(sourcePath)) {
      throw new Error(`Environment file not found: ${sourceFile}`);
    }

    copyFileSync(sourcePath, targetPath);
  }
}
